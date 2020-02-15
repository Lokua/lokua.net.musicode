import readline from 'readline'
import midi from 'midi'
import midiUtil from '@lokua/midi-util'
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
})

read()

function read() {
  rl.question('$ ', command => {
    if (command === 'log') {
      console.log({
        music,
        state: musicode.getState(),
      })
    } else if (command === 'exit') {
      process.exit(0)
    } else {
      try {
        const m = parse(command)
        music = m
      } catch (error) {
        console.warn('invalid command')
      }
    }

    read()
  })
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
