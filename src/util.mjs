import fs from 'fs'
import { inspect } from 'util'

export const createCustomErrorClass = name =>
  class extends Error {
    constructor(message) {
      super(message)
      this.name = name
    }
  }

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

export const MatchError = createCustomErrorClass('MatchError')

export function match(
  cases,
  defaultCase = () => {
    throw new MatchError()
  },
) {
  return (...args) => {
    if (Array.isArray(cases)) {
      for (const [k, v] of cases) {
        if (k(...args)) {
          return typeof v === 'function' ? v(...args) : v
        }
      }

      return defaultCase()
    }

    for (const [k, v] of Object.entries(cases)) {
      if (k === args[0]) {
        return typeof v === 'function' ? v(...args) : v
      }
    }

    return defaultCase()
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
