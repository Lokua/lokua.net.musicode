import midi from 'midi'
// import midiUtil from '@lokua/midi-util'
import { debug } from './util.mjs'

inputClockHandler.input = new midi.Input()

// sysex, timing, active sensing
inputClockHandler.input.ignoreTypes(false, false, false)

export default function inputClockHandler({ portName, handlers }) {
  inputClockHandler.input.on('message', (deltaTime, message) => {
    // debug(midiUtil.statusMap.get(message[0]), ...message.slice(1))

    const handler = handlers.get(message[0])

    if (handler) {
      handler(message, deltaTime)
    }
  })

  inputClockHandler.input.openVirtualPort(portName)

  return function unsubscribe() {
    inputClockHandler.input.closePort()
  }
}
