import midi from 'midi'
import midiUtil from '@lokua/midi-util'

import { debug, onExit } from './util.mjs'

const output = new midi.Output()

output.openVirtualPort('musicode')

export default function exec({ timeState, instructions }) {
  instructions.forEach(applyTimeStateForInstruction(timeState))
}

function applyTimeStateForInstruction(timeState) {
  return instruction => {
    if (canPlay({ meter: timeState.meter, music: instruction })) {
      output.sendMessage([
        midiUtil.NOTE_ON,
        [[60, 70, 80, 90]][instruction.scaleNumber][instruction.scaleDegree],
        127,
      ])
    }
  }
}

function canPlay({ meter: [a, b, c], music }) {
  return (
    (music.bar === a || music.bar === '*') &&
    (music.beat === b % 4 || music.beat === '*') &&
    (music.tick === c % 4 || music.tick === '*')
  )
}

let ran = false
onExit(() => {
  if (!ran) {
    ran = true
    debug('closing output port')
    output.closePort()
  }
})
