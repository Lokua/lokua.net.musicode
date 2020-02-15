import { inspect } from 'util'

export default function test(name, fn) {
  try {
    fn()
  } catch (error) {
    console.error(name, inspect(error, false, null, true))
  }
}
