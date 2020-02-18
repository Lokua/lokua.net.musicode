import EventEmitter from 'events'
import readline from 'readline'
import chalk from 'chalk'

import { debug, match, onExit } from './util.mjs'

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

commandBus
  .on('writeLine', console.log)
  .on('warn', message => {
    console.log(chalk.yellow(message))
  })
  .on('error', message => {
    console.log(chalk.red(message))
  })
  .on('info', message => {
    console.log(chalk.blue(message))
  })

const echo = s => [x => x === s, () => commandBus.emit(s)]
const route = match(
  [
    echo('log'),
    echo('log:scales'),
    echo('log:state'),
    echo('reset'),
    echo('exit'),
    [s => s.trim() === '', () => {}],
  ],
  command => {
    const firstWord = command.split(' ')[0].trim()

    if (/(un)?register|remove|(un)?mute/.test(firstWord)) {
      commandBus.emit(firstWord, {
        command,
      })
    } else {
      commandBus.emit('instruction', {
        command,
      })
    }
  },
)

commandBus.start = () => {
  rl.prompt()

  rl.on('line', line => {
    route(line.trim())
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
