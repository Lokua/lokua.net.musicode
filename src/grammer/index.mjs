import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const grammer = require('./grammer.js')

export default function parse(string) {
  return grammer
    .parse(string)
    .filter(x => x !== null)
    .reduce((o, e) => ({ ...o, ...e }), {})
}
