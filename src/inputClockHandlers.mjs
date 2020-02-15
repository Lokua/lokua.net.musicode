import midiUtil from '@lokua/midi-util'
import timeState from './timeState.mjs'

const createHandlerEntry = event => [
  midiUtil.statusMap.get(event),
  data => {
    timeState.emit(event, data)
  },
]

const handlers = new Map([
  createHandlerEntry('start'),
  createHandlerEntry('stop'),
  createHandlerEntry('clock'),
  createHandlerEntry('songPosition'),
])

export default handlers
