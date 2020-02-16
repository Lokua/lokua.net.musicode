import chalk from 'chalk'
import parse from './grammer/index.mjs'
import commandBus from './commandBus.mjs'
import exec from './exec.mjs'
import { subscribe } from './inputClock.mjs'
import inputClockHandlers from './inputClockHandlers.mjs'
import instructionBus from './instructionBus.mjs'
import timeState from './timeState.mjs'
import { inspectDeep } from './util.mjs'
import * as scales from './scales.mjs'

checkDebug()

commandBus
  .on('instruction', ({ command }) => {
    try {
      const instruction = parse(command)
      instructionBus.emit('instruction', {
        command,
        instruction,
      })
    } catch (error) {
      handleParseError(error)
    }
  })
  .on('reset', timeState.resetState)
  .on('remove', ({ command }) => {
    instructionBus.emit('remove', command)
  })
  .on('register', ({ command }) => {
    scales.register(command)
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
    instructionBus
      .getInstructions()
      .forEach((instruction, index) =>
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

instructionBus.on('duplicateInstruction', ({ command }) => {
  commandBus.emit('warn', `ignoring duplicated command: ${command}`)
})

timeState.on('sixteenth', () => {
  exec(getData())
})

subscribe({
  portName: 'musicode',
  handlers: inputClockHandlers,
})

function getData() {
  return {
    timeState: timeState.getState(),
    instructions: instructionBus.getInstructions(),
    scales: scales.getScales(),
  }
}

function handleParseError(error) {
  if (error.name === 'SyntaxError') {
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
