import EventEmitter from 'events'
import readline from 'readline'
import chalk from 'chalk'

import { debug, inspectDeep, onExit } from './util.mjs'

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

commandBus.on('writeLine', data => {
  console.log(inspectDeep(data))
})

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
    switch (line.trim()) {
      case 'log':
        commandBus.emit('log')
        break
      case 'log commands':
        commandBus.emit('logCommands')
        break

      case 'exit':
        commandBus.emit('exit')
        break

      default:
        commandBus.emit('command', {
          command: line,
        })
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

let ran = false
onExit(() => {
  if (!ran) {
    ran = true
    debug('closing readline instance')
    rl.close()
  }
})
