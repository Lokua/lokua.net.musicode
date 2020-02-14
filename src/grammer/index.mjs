import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const grammer = require('./grammer.js')

export default function parse(expressions) {
  const list = Array.isArray(expressions) ? expressions : [expressions]

  return list.map(expression =>
    grammer
      .parse(expression)
      .filter(x => x !== null)
      .reduce((o, e) => ({ ...o, ...e }), {}),
  )
}
