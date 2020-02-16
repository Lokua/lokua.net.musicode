import EventEmitter from 'events'
import readline from 'readline'
import chalk from 'chalk'

import { debug, onExit } from './util.mjs'

const commandBus = new (class CommandBus extends EventEmitter {})()

readline.emitKeypressEvents(process.stdin)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.magenta('> '),
  removeHistoryDuplicates: true,
})

commandBus.on('write', data => {
  rl.write(data)
})

commandBus.on('writeLine', console.log)

commandBus.on('warn', message => {
  console.log(chalk.yellow(message))
})

commandBus.on('error', message => {
  console.log(chalk.red(message))
})

commandBus.on('info', message => {
  console.log(chalk.blue(message))
})

commandBus.start = () => {
  rl.prompt()

  rl.on('line', line => {
    const command = line.trim()

    switch (command) {
      case 'log':
        commandBus.emit('log')
        break

      case 'log:scales':
        commandBus.emit('logScales')
        break

      case 'log:state':
        commandBus.emit('logState')
        break

      case 'reset':
        commandBus.emit('reset')
        break

      case 'exit':
        commandBus.emit('exit')
        break

      default: {
        const firstWord = command.split(' ')[0].trim()

        if (/register|unregister|remove/.test(firstWord)) {
          commandBus.emit(firstWord, {
            command,
          })
        } else {
          commandBus.emit('instruction', {
            command,
          })
        }
        break
      }
    }

    rl.prompt()
  })

  process.stdin.on('keypress', char => {
    if (char === '|') {
      rl.write('__TODO_META_COMMANDS__')
    }
  })
}

export default commandBus

onExit(() => {
  debug('onExit: closing readline instance')
  rl.close()
})
