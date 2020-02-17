import { valueTypes } from '../constants.mjs'
import parseInstruction from './instruction.mjs'

export default function parse(string) {
  if (string.startsWith('e ')) {
    return parseInstruction(string)
  }

  // TODO: move me to own file
  // TODO: mute follows the same rules as velocity and duration (sort of)
  const mutesRegExp = /^(un)?mute\s+/
  if (mutesRegExp.test(string)) {
    const value = string
      .trim()
      .replace(mutesRegExp, '')
      .trim()

    if (value === '*') {
      return {
        type: valueTypes.wildcard,
        value,
      }
    }

    if (!isNaN(Number(value))) {
      return {
        type: valueTypes.number,
        value: Number(value) - 1,
      }
    }
  }

  throw new Error('SyntaxError')
}
