import assert from 'assert'
import test from './test-framework.mjs'
import { parse } from './dsl.mjs'

test('parse', () => {
  assert.deepEqual(parse('e 1.1.1 s 1'), {
    command: 'every',
    notationMode: 'scale',
    timeSpec: [1, 1, 1],
    scaleNumber: 1,
    scaleDegree: 1,
    value: [1],
  })
})
