import midi from 'midi'
import { debug, onExit } from './util.mjs'

export function subscribe({ portName, handlers }) {
  const input = new midi.Input()

  input.ignoreTypes(true, false, true)

  input.on('message', (deltaTime, message) => {
    const handler = handlers.get(message[0])

    if (handler) {
      handler({
        message,
        deltaTime,
      })
    }
  })

  input.openVirtualPort(portName)

  onExit(() => {
    debug('onExit: closing input port')
    input.closePort()
  })
}
