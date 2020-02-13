export function safeCall(method, ...args) {
  if (method) {
    return method(...args)
  }
}

export function debug(...args) {
  if (global.DEBUG) {
    console.log(...args)
  }
}

export function onExit(cleanup) {
  process.on('exit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}
