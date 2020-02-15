import readline from 'readline'
import chalk from 'chalk'
import parse from '../src/grammer/index.mjs'

readline.emitKeypressEvents(process.stdin)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.magenta('> '),
})

rl.pause()
rl.prompt()

rl.on('line', line => {
  try {
    parse(line)
    console.log(chalk.green(line))
  } catch (error) {
    if (error.name === 'SyntaxError') {
      console.error(chalk.red(error.name), error.message)
    } else {
      console.log(error)
    }
  }

  rl.prompt()
})

process.stdin.on('keypress', char => {
  if (char === '|') {
    rl.write('*&^%^$^%%*')
  }
})
