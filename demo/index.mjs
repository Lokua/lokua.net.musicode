import midi from 'midi'
import midiUtil from '@lokua/midi-util'
import musicode, { is16thTick, defaultPortName } from '../src/index.mjs'

const noteOn = midiUtil.statusMap.get('noteOn')

const output = new midi.Output()
output.openVirtualPort(defaultPortName)

const c = [noteOn, 60, 127]
const d = [noteOn, 70, 127]
const e = [noteOn, 80, 127]
const f = [noteOn, 90, 127]

// prettier-ignore
const data = [
  [
    [c, c, c, c],
    [d, e, e, d],
    [e, e, e, e],
    [f, f, e, d],
  ],
]

musicode({
  options: {},
  handlers: {
    tick(state) {
      if (is16thTick(state.tick)) {
        const [bar, beat, sixteenth] = state.meter
        const event = data[bar % data.length][beat][sixteenth]
        output.sendMessage(event)
      }
    },
  },
})
