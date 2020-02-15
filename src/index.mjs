import inputClockHandlers from './inputClockHandlers.mjs'
import { subscribe } from './inputClock.mjs'
import timeState from './timeState.mjs'

timeState.on('sixteenth', state => {
  console.log(state)
})

subscribe({
  portName: 'musicode',
  handlers: inputClockHandlers,
})
