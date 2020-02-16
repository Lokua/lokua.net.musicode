import midi from 'midi'
import midiUtil from '@lokua/midi-util'

import { metricTypes } from './constants.mjs'
import { debug, onExit } from './util.mjs'

const output = new midi.Output()

output.openVirtualPort('musicode')

export default function exec({
  timeState,
  instructions,
  scales,
  velocities,
  durations,
}) {
  instructions.forEach(
    applyDataForInstruction({
      timeState,
      scales,
      velocities,
      durations,
    }),
  )
}

function applyDataForInstruction({ timeState, scales, velocities }) {
  return instruction => {
    if (canPlay({ timeState, music: instruction })) {
      const TEMP_OFFSET = 60
      const message = [
        midiUtil.NOTE_ON,
        getNote({ scales, instruction }) + TEMP_OFFSET,
        velocities[0],
      ]
      debug(`ouput.sendMessage([${message}])`)
      output.sendMessage(message)
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

export function getNote({ scales, instruction }) {
  const scale = scales[instruction.scaleNumber].values
  const index =
    instruction.scaleDegree.type === 'number'
      ? instruction.scaleDegree.value
      : // TODO: use cursor
        0

  return scale[index]
}

onExit(() => {
  debug('onExit: closing output port')
  output.closePort()
})
