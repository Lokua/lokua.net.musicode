import EventEmitter from 'events'

import { partsPerQuarter } from './constants.mjs'
import { isBarTick, isQuarterTick, is16thTick } from './helpers.mjs'

const initialState = Object.freeze({
  clock: -1,
  sixteenths: -1,
  meter: [0, 0, 0],
})

const state = {
  ...initialState,
}

const getState = () => ({
  ...state,
})

const resetState = () => {
  Object.assign(state, initialState)
}

const bus = new (class TimeStateBus extends EventEmitter {})()

bus.getState = getState

bus.on('start', resetState)

bus.on('stop', resetState)

bus.on('clock', () => {
  const clock = state.clock++
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
    bus.emit('sixteenth', getState())
  }
})

// TODO: test, this is not correct (does not set meter correctly)
bus.on('songPosition', ({ message: [, sixteenth, eighthBarCount] }) => {
  const clock =
    sixteenth * (partsPerQuarter / 4) + eighthBarCount * partsPerQuarter * 4

  state.clock = clock - 1
  bus.emit('clock')
})

bus.on('log', () => {
  console.log(getState())
})

export default bus
