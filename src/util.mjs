import fs from 'fs'
import { inspect } from 'util'

export function debug(data) {
  if (global.DEBUG) {
    if (!debug.initialized) {
      debug.initialized = true
      fs.writeFileSync('debug.log', '')
    }

    const body = (typeof data === 'object' ? JSON.stringify(data) : data) + '\n'

    if (onExit.ran) {
      fs.appendFileSync('debug.log', body)
    } else {
      fs.appendFile('debug.log', body, error => {
        if (error) {
          console.error(error)
        }
      })
    }
  }
}

export function inspectDeep(message) {
  return inspect(message, false, null, true)
}

export function rotate(array, n) {
  return [...array.slice(array.length - n), ...array.slice(0, array.length - n)]
}

export function safeCall(method, ...args) {
  if (method) {
    return method(...args)
  }
}

onExit.fns = []
onExit.run = () => {
  onExit.ran = true
  while (onExit.fns.length) {
    onExit.fns.pop()()
  }
}
process.on('exit', onExit.run)
process.on('SIGINT', onExit.run)
process.on('SIGTERM', onExit.run)

export function onExit(fn) {
  onExit.fns.push(fn)
}
