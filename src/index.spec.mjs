import test from './test-framework.mjs'
import assert from 'assert'

// fake module
const foo = (a, b) => a + b

test('default', () => {
  assert.deepEqual(foo(1, 2), 3)
})
