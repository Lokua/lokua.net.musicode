import chalk from 'chalk'

import parse from './parser/index.mjs'
import { subscribe } from './clock.mjs'
import commandBus from './commandBus.mjs'
import { valueTypes } from './constants.mjs'
import defaultConfig from './defaultConfig.mjs'
import exec from './exec.mjs'
import Instructions from './Instructions.mjs'
import Scales from './scales.mjs'
import timeState from './timeState.mjs'
import { inspectDeep } from './util.mjs'

const scales = new Scales(defaultConfig)
const instructions = new Instructions()

checkDebug()

commandBus
  .on('instruction', ({ command }) => {
    try {
      const instruction = parse(command)
      instructions.push({
        id: command,
        instruction,
      })
    } catch (error) {
      handleError(error)
    }
  })
  .on('mute', ({ command }) => {
    try {
      const parsed = parse(command)
      if (parsed.type === valueTypes.number) {
        instructions[parsed.value].mute()
      } else {
        instructions.mute()
      }
    } catch (error) {
      handleError(error)
    }
  })
  .on('unmute', ({ command }) => {
    try {
      const parsed = parse(command)
      if (parsed.type === valueTypes.number) {
        instructions[parsed.value].unmute()
      } else {
        instructions.unmute()
      }
    } catch (error) {
      handleError(error)
    }
  })
  .on('reset', timeState.resetState)
  .on('remove', ({ command }) => {
    instructions.remove(command)
  })
  .on('register', ({ command }) => {
    scales.addScale(command.replace('register '))
  })
  // eslint-disable-next-line no-unused-vars
  .on('unregister', ({ command }) => {
    commandBus.emit('warn', 'unregister is not implemented')
    // scales.unregister(command)
  })
  .on('logState', () => {
    commandBus.emit('writeLine', inspectDeep(getData()))
  })
  .on('log', () => {
    instructions.forEach((instruction, index) =>
      commandBus.emit(
        'writeLine',
        `${chalk.green(index + 1)}: ${chalk.cyan(instruction.raw)}`,
      ),
    )
  })
  .on('exit', () => {
    process.exit(0)
  })
  .start()

timeState.on('sixteenth', () => {
  exec(getData())
})

subscribe({
  portName: 'musicode',
  handlers: timeState.clockHandlers,
})

function getData() {
  return {
    timeState: timeState.getState(),
    instructions,
    ...scales.getData(),
  }
}

function handleError(error) {
  if (
    error.name === 'SyntaxError' ||
    error instanceof Instructions.DuplicateInstructionError
  ) {
    console.error(chalk.red(error.name), error.message)
  } else {
    console.error(error)
  }
}

function checkDebug() {
  global.DEBUG = process.argv.slice(2).find(s => s === '--debug')

  if (global.DEBUG) {
    commandBus.emit('warn', 'debug mode is on')
  }
}
