import midi from 'midi'
import midiUtil from '@lokua/midi-util'
import musicode, { is16thTick, defaultPortName } from '../src/index.mjs'

const noteOn = midiUtil.statusMap.get('noteOn')

const output = new midi.Output()
output.openVirtualPort(defaultPortName)

const c = [noteOn, midiUtil.ftom(880), 127]
const f = [noteOn, midiUtil.ftom(220), 127]

const data = [
  [
    [c, f, f, f],
    [f, f, f, f],
    [f, f, f, f],
    [f, f, f, f],
  ],
]

musicode({
  options: {},
  handlers: {
    tick(state) {
      if (is16thTick(state.tick)) {
        const [b, q, s] = state.meter
        const bar = data[b % data.length]
        const event = bar[q % bar.length][s]
        output.sendMessage(event)
      }
    },
  },
})
