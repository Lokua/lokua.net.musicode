import midi from 'midi'
import midiUtil from '@lokua/midi-util'
import musicode, { is16thTick, defaultPortName } from '../src/index.mjs'
import parse from '../src/grammer/index.mjs'

const noteOn = midiUtil.statusMap.get('noteOn')
const output = new midi.Output()
const scale = [60]
const scales = [scale]

output.openVirtualPort(defaultPortName)

const music = parse('e *.2.1 s 1')
console.info(music)

musicode({
  handlers: {
    tick({ meter, tick }) {
      if (is16thTick(tick)) {
        music.forEach(expression => {
          if (canPlay({ meter, music: expression })) {
            output.sendMessage([
              noteOn,
              scales[expression.scaleNumber][expression.scaleDegree],
              127,
            ])
          }
        })
      }
    },
  },
})

function canPlay({ meter: [a, b, c], music }) {
  return (
    (music.bar === a || music.bar === '*') &&
    (music.beat === b || music.beat === '*') &&
    (music.tick === c || music.tick === '*')
  )
}
