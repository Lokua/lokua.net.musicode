import midi from 'midi'
import midiUtil from '@lokua/midi-util'

import { valueTypes } from './constants.mjs'
import { debug, onExit } from './util.mjs'

const output = new midi.Output()
output.openVirtualPort('musicode')

const noteOffs = new Map()
exec.noteOffs = noteOffs

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

  if (noteOffs.has(timeState.sixteenths)) {
    const message = noteOffs.get(timeState.sixteenths)
    output.sendMessage(message)
    debug(`ouput.sendMessage([${message}])`)
  }
}

function applyDataForInstruction({ timeState, scales, velocities, durations }) {
  return instruction => {
    if (canPlay({ timeState, instruction })) {
      const TEMP_OFFSET = 60
      const message = [
        midiUtil.NOTE_ON,
        getNote({ scales, instruction }) + TEMP_OFFSET,
        genericRotatableGet('velocity', {
          lookupArray: velocities,
          instruction,
        }),
      ]

      output.sendMessage(message)
      debug(`ouput.sendMessage([${message}])`)

      noteOffs.set(
        timeState.sixteenths +
          genericRotatableGet('duration', {
            lookupArray: durations,
            instruction,
          }),
        [midiUtil.NOTE_OFF, message[1], 0],
      )

      instruction.rotateCursor()
    }
  }
}

export function canPlay({ timeState, instruction }) {
  return (
    !instruction.muted &&
    ['bar', 'beat', 'sixteenth'].every((key, index) =>
      canPlayMetric({
        key,
        timeState,
        meterValue: timeState.meter[index],
        instructionValue: instruction[key],
      }),
    )
  )
}

function canPlayMetric({
  key,
  timeState,
  meterValue,
  instructionValue: { type, value },
}) {
  return {
    [valueTypes.wildcard]: () => true,
    [valueTypes.number]: () =>
      value === (key === 'bar' ? meterValue : meterValue % 4),
    [valueTypes.modulus]: () =>
      key === 'bar'
        ? meterValue % value === 0
        : key === 'beat'
        ? Math.floor(timeState.sixteenths / 4) % value === 0
        : timeState.sixteenths % value === 0,
    [valueTypes.list]: () =>
      value.some(v =>
        canPlayMetric({
          key,
          timeState,
          meterValue,
          instructionValue: v,
        }),
      ),
  }[type]()
}

export function getNote({
  scales,
  instruction: {
    scaleNumber,
    scaleDegree: { type, value, cursor },
  },
}) {
  const scale = scales[scaleNumber].values

  return {
    [valueTypes.number]: () => scale[value],
    [valueTypes.rotatable]: () => scale[value[cursor]],
  }[type]()
}

export function genericRotatableGet(
  key,
  {
    lookupArray,
    instruction: {
      [key]: { type, value, cursor },
    },
  },
) {
  return {
    [valueTypes.number]: () => lookupArray[value],
    [valueTypes.rotatable]: () => lookupArray[value[cursor]],
  }[type]()
}

onExit(() => {
  debug('onExit: closing output port')
  output.closePort()
})
