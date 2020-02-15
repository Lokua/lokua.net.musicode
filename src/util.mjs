import fs from 'fs'
import { inspect } from 'util'

export function debug(data) {
  if (global.DEBUG) {
    fs.appendFile(
      'debug.log',
      (typeof data === 'object' ? JSON.stringify(data) : data) + '\n',
      console.error,
    )
  }
}

export function inspectDeep(message) {
  return inspect(message, false, null, true)
}

export function onExit(cleanup) {
  process.on('exit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

export function safeCall(method, ...args) {
  if (method) {
    return method(...args)
  }
}
