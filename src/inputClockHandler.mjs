import midi from 'midi'

inputClockHandler.input = new midi.Input()
inputClockHandler.input.ignoreTypes(true, false, true)

export default function inputClockHandler({ portName, handlers }) {
  inputClockHandler.input.on('message', (deltaTime, message) => {
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
