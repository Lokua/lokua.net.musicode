import EventEmitter from 'events'
import midiUtil from '@lokua/midi-util'

import { partsPerQuarter } from './constants.mjs'
import { isBarTick, isQuarterTick, is16thTick } from './helpers.mjs'
import { debug } from './util.mjs'

const initialState = Object.freeze({
  clock: -1,
  sixteenths: -1,
  meter: [-1, -1, -1],
})

const state = {
  ...initialState,
}

class TimeStateBus extends EventEmitter {
  getState() {
    return {
      ...state,
    }
  }

  resetState() {
    Object.assign(state, initialState)
  }

  toString() {
    return Object.keys(state)
      .map(k => `${k}: ${state[k]}`)
      .join(', ')
  }
}

const timeState = new TimeStateBus()

timeState.on('start', timeState.resetState)
timeState.on('stop', timeState.resetState)

timeState.on('clock', () => {
  const clock = ++state.clock

  let [bar, beat, sixteenth] = state.meter

  if (is16thTick(clock)) {
    state.sixteenths++
    sixteenth = (sixteenth + 1) % 4

    if (isQuarterTick(clock)) {
      beat = (beat + 1) % 4

      if (isBarTick(clock)) {
        bar = bar + 1
      }
    }

    state.meter = [bar, beat, sixteenth]
    timeState.emit('sixteenth', timeState.getState())

    if (global.DEBUG && isBarTick(clock) && bar % 16 === 0) {
      debug(timeState.toString())
    }
  }
})

// TODO: test, this is not correct (does not set meter correctly)
timeState.on('songPosition', ({ message: [, sixteenth, eighthBarCount] }) => {
  const clock =
    sixteenth * (partsPerQuarter / 4) + eighthBarCount * partsPerQuarter * 4

  state.clock = clock - 1
  timeState.emit('clock')
})

const createHandlerEntry = event => [
  midiUtil.statusMap.get(event),
  data => {
    timeState.emit(event, data)
  },
]

timeState.clockHandlers = new Map([
  createHandlerEntry('start'),
  createHandlerEntry('stop'),
  createHandlerEntry('clock'),
  createHandlerEntry('songPosition'),
])

export default timeState
