import midi from 'midi'
import midiUtil from '@lokua/midi-util'

import { metricTypes } from './constants.mjs'
import { debug, onExit } from './util.mjs'

const output = new midi.Output()

output.openVirtualPort('musicode')

export default function exec({ timeState, instructions, scales }) {
  instructions.forEach(applyDataForInstruction({ timeState, scales }))
}

function applyDataForInstruction({ timeState, scales }) {
  return instruction => {
    const can = canPlay({ timeState, music: instruction })

    const TEMP_OFFSET = 60

    if (can) {
      output.sendMessage([
        midiUtil.NOTE_ON,
        scales[instruction.scaleNumber].values[instruction.scaleDegree] +
          TEMP_OFFSET,
        127,
      ])
    }

    return can
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
    if (key === 'bar') {
      return meterValue % value === 0
    }

    if (key === 'beat') {
      return Math.floor(timeState.sixteenths / 4) % value === 0
    }

    return timeState.sixteenths % value === 0
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
