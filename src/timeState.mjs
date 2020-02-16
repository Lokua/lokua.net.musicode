import EventEmitter from 'events'

import { partsPerQuarter } from './constants.mjs'
import { isBarTick, isQuarterTick, is16thTick } from './helpers.mjs'
import { debug } from './util.mjs'

const initialState = Object.freeze({
  clock: -1,
  sixteenths: -1,
  meter: [0, 0, 0],
})

const state = {
  ...initialState,
}

const resetState = () => {
  Object.assign(state, initialState)
}

class TimeStateBus extends EventEmitter {
  getState() {
    return {
      ...state,
    }
  }
}

const timeState = new TimeStateBus()

timeState.on('start', resetState)

timeState.on('stop', resetState)

timeState.on('clock', () => {
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
    timeState.emit('sixteenth', timeState.getState())
  }

  if (clock % 128 === 0) {
    debug(`clock check: ${clock}`)
  }
})

// TODO: test, this is not correct (does not set meter correctly)
timeState.on('songPosition', ({ message: [, sixteenth, eighthBarCount] }) => {
  const clock =
    sixteenth * (partsPerQuarter / 4) + eighthBarCount * partsPerQuarter * 4

  state.clock = clock - 1
  timeState.emit('clock')
})

timeState.on('log', () => {
  console.log(timeState.getState())
})

export default timeState
