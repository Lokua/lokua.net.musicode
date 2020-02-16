import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const grammer = require('./grammer.js')

export default grammer.parse.bind(grammer)
