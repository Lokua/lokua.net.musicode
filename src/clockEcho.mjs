import dgram from 'dgram'
import midi from 'midi'
import { onExit } from './util.mjs'

const input = new midi.Input()
const port = 33333
let exitRan = false

try {
  input.openVirtualPort('musicode')
} catch (error) {
  console.error(error)
  process.exit()
}

const client = dgram.createSocket('udp4')
client.on('error', exitRoutine('client.on.error'))

input.ignoreTypes(true, false, true)

let t = 0
input.on('message', (deltaTime, message) => {
  try {
    t % 128 === 0 && process.stdout.write('.')
    t++
    client.send(`${deltaTime},${message.join(',')}`, port, 'localhost', err => {
      if (err) {
        console.error(err)
      }
    })
  } catch (error) {
    exitRoutine('input.on.message')(error)
  }
})

console.log('client broadcasting on port', port)

onExit(exitRoutine('onExit'))

function exitRoutine(id) {
  return err => {
    console.error(`\n[exitRoutine(${id})] err:`, err)

    if (!exitRan) {
      exitRan = true
      console.log('closing midi input port')
      input.closePort()
      console.log('closing udp client')
      client.close()
    }
  }
}
