import midi from 'midi'
import { onExit } from './util.mjs'

const [portName] = process.argv.slice(2)

console.info('hello', { portName })

if (!portName) {
  throw new Error('missing required portName argument')
}

const input = new midi.Input()
input.ignoreTypes(true, false, true)
input.openVirtualPort(portName)

input.on('message', (deltaTime, message) => {
  process.stdout.write('.')

  if (typeof process.send === 'function') {
    process.send({ deltaTime, message })
  } else {
    console.warn('process.send is not a function')
  }
})

onExit(() => {
  console.info('closing...')
  input.closePort()
})
