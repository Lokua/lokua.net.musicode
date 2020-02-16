import midi from 'midi'
import midiUtil from '@lokua/midi-util'

import { metricTypes } from './constants.mjs'
import { debug, onExit } from './util.mjs'

const output = new midi.Output()

output.openVirtualPort('musicode')

export default function exec({ timeState, instructions }) {
  instructions.forEach(applyTimeStateForInstruction(timeState))
}

function applyTimeStateForInstruction(timeState) {
  return instruction => {
    if (canPlay({ timeState, music: instruction })) {
      output.sendMessage([
        midiUtil.NOTE_ON,
        [[60, 70, 80, 90]][instruction.scaleNumber][instruction.scaleDegree],
        127,
      ])
    }
  }
}

export function canPlay({ timeState, music }) {
  return ['bar', 'beat', 'sixteenth'].every((key, index) =>
    canPlayMetric({
      key,
      timeState,
      meterValue: timeState.meter[index],
      instructionValue: music[key],
    }),
  )
}

function canPlayMetric({
  key,
  timeState,
  meterValue,
  instructionValue: { type, value },
}) {
  if (type === metricTypes.wildcard) {
    return true
  }

  if (type === metricTypes.number) {
    return value === (key === 'bar' ? meterValue : meterValue % 4)
  }

  if (type === metricTypes.modulus) {
    return key === 'bar'
      ? meterValue % value === 0
      : key === 'beat'
      ? (timeState.count / 4) % value === 0
      : timeState.count % value === 0
  }

  if (type === metricTypes.list) {
    return value.some(v =>
      canPlayMetric({
        key,
        timeState,
        meterValue,
        instructionValue: v,
      }),
    )
  }
}

let ran = false
onExit(() => {
  if (!ran) {
    ran = true
    debug('closing output port')
    output.closePort()
  }
})
