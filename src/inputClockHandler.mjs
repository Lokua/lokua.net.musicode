import { fork } from 'child_process'
import { debug, onExit } from './util.mjs'
import projectRoot from './projectRoot.mjs'

export default function inputClockHandler({ portName, handlers }) {
  const child = fork(`${projectRoot}/src/inputWorker.mjs`, [portName], {
    // detached: true,
  })

  child.on('message', ({ deltaTime, message }) => {
    const handler = handlers.get(message[0])

    if (handler) {
      handler(message, deltaTime)
    }
  })

  onExit(() => {
    // child.disconnect()
  })
}
