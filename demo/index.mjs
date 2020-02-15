import readline from 'readline'
import midi from 'midi'
import midiUtil from '@lokua/midi-util'
import chalk from 'chalk'

import musicode from '../src/index.mjs'
import parse from '../src/grammer/index.mjs'
import { onExit } from '../src/util.mjs'

const noteOn = midiUtil.statusMap.get('noteOn')
const output = new midi.Output()
const scale = [60, 70, 80, 90]
const scales = [scale]

output.openVirtualPort(musicode.defaultPortName)

let music = parse('e *.2.1 s 1')
console.info(music)

musicode({
  handlers: {
    tick(state) {
      if (
        musicode.is16thTick(state.tick) &&
        canPlay({
          meter: state.meter,
          music,
        })
      ) {
        output.sendMessage([
          noteOn,
          scales[music.scaleNumber][music.scaleDegree],
          127,
        ])
      }
    },
  },
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.magenta('> '),
})

rl.prompt()

rl.on('line', line => {
  if (line === 'log') {
    console.log(
      JSON.parse(
        JSON.stringify({
          music,
          state: musicode.getState(),
        }),
      ),
    )
  } else if (line === 'exit') {
    process.exit(0)
  } else {
    try {
      const m = parse(line)
      music = m
      console.log(chalk.green(line))
    } catch (error) {
      handleParseError(error)
    }
  }

  rl.prompt()
})

function handleParseError(error) {
  if (error.name === 'SyntaxError') {
    console.error(chalk.red(error.name), error.message)
  } else {
    console.error(error)
  }
}

let ran = false
onExit(() => {
  if (!ran) {
    ran = true
    rl.close()
    output.closePort()
  }
})

function canPlay({ meter: [a, b, c], music }) {
  return (
    (music.bar === a || music.bar === '*') &&
    (music.beat === b % 4 || music.beat === '*') &&
    (music.tick === c % 4 || music.tick === '*')
  )
}
