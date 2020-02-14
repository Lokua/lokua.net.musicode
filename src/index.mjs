import midiUtil from '@lokua/midi-util'

import inputClockHandler from './inputClockHandler.mjs'
import { partsPerQuarter } from './constants.mjs'
import { isBarTick, isQuarterTick, is16thTick } from './helpers.mjs'
import { safeCall } from './util.mjs'

global.DEBUG = !!process.argv.find(s => s.includes('debug'))

const state = {
  tick: -1,
  meter: [0, 0, 0],
  get count() {
    return state.meter[2]
  },
}

function reset() {
  state.tick = -1
  state.meter = [0, 0, 0]
}

function updateCounts(handlers) {
  return () => {
    const tick = state.tick++
    let [bar, beat, sixteenth] = state.meter

    if (is16thTick(tick)) {
      sixteenth = (sixteenth + 1) % 4

      if (isQuarterTick(tick)) {
        beat = (beat + 1) % 4

        if (isBarTick(tick)) {
          bar = bar + 1
        }
      }
    }

    state.meter = [bar, beat, sixteenth]
    safeCall(handlers.tick, state)
  }
}

export function getSongPositionTicks([, sixteenth, eighthBarCount]) {
  return (
    sixteenth * (partsPerQuarter / 4) + eighthBarCount * partsPerQuarter * 4
  )
}

const defaultPortName = 'musicode'

export default function musicode({ options = {}, handlers }) {
  const inputClockHandlers = new Map([
    [midiUtil.statusMap.get('start'), reset],
    [midiUtil.statusMap.get('stop'), reset],
    [midiUtil.statusMap.get('clock'), updateCounts(handlers)],
    [
      midiUtil.statusMap.get('songPosition'),
      message => {
        updateCounts(getSongPositionTicks(message) - 1)
      },
    ],
  ])

  inputClockHandler({
    portName: options.port || defaultPortName,
    handlers: inputClockHandlers,
  })
}

export { defaultPortName, isBarTick, isQuarterTick, is16thTick }
