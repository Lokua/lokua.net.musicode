import EventEmitter from 'events'
import midi from 'midi'
import midiUtil from '@lokua/midi-util'

import { valueTypes } from './constants.mjs'
import { debug, onExit } from './util.mjs'

const output = new midi.Output()
output.openVirtualPort('musicode')

const bus = new EventEmitter()
exec.emit = bus.emit.bind(bus)
exec.on = bus.on.bind(bus)

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
    if (canPlay({ timeState, instruction })) {
      const TEMP_OFFSET = 60
      const message = [
        midiUtil.NOTE_ON,
        getNote({ scales, instruction }) + TEMP_OFFSET,
        velocities[0],
      ]
      output.sendMessage(message)
      debug(`ouput.sendMessage([${message}])`)

      if (includesRotatable(instruction)) {
        exec.emit('cursor', {
          instruction,
        })
      }
    }
  }
}

export function canPlay({ timeState, instruction }) {
  return (
    !instruction.mute &&
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
  if (type === valueTypes.wildcard) {
    return true
  }

  if (type === valueTypes.number) {
    return value === (key === 'bar' ? meterValue : meterValue % 4)
  }

  if (type === valueTypes.modulus) {
    if (key === 'bar') {
      return meterValue % value === 0
    }

    if (key === 'beat') {
      return Math.floor(timeState.sixteenths / 4) % value === 0
    }

    return timeState.sixteenths % value === 0
  }

  if (type === valueTypes.list) {
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

  if (instruction.scaleDegree.type === valueTypes.number) {
    return scale[instruction.scaleDegree.value]
  }

  if (instruction.scaleDegree.type === valueTypes.rotatable) {
    return scale[instruction.scaleDegree.value[instruction.scaleDegree.cursor]]
  }
}

function includesRotatable(instruction) {
  return Object.values(instruction).some(
    x => typeof x === 'object' && x.type === valueTypes.rotatable,
  )
}

onExit(() => {
  debug('onExit: closing output port')
  output.closePort()
})
