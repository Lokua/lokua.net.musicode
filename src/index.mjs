import chalk from 'chalk'
import parse from './grammer/index.mjs'
import commandBus from './commandBus.mjs'
import exec from './exec.mjs'
import { subscribe } from './inputClock.mjs'
import inputClockHandlers from './inputClockHandlers.mjs'
import instructionBus from './instructionBus.mjs'
import timeState from './timeState.mjs'

checkDebug()

commandBus
  .on('command', ({ command }) => {
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
  .on('log', () => {
    commandBus.emit('writeLine', getData())
  })
  .on('logCommands', () => {
    commandBus.emit(
      'info',
      instructionBus
        .getInstructions()
        .map((instruction, index) => `${index + 1}: ${instruction.raw}`)
        .join('\n'),
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
