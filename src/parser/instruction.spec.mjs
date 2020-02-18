import assert from 'assert'
import test from '../test/index.mjs'
import parse from './instruction.mjs'

test('e *.1,3.%2,%3 s1 2 v 1,2 d 3,4', () => {
  const string = 'e *.1,3.%2,%3 s1 2 v 1,2 d 3,4'
  const actual = parse(string)
  const expected = kitchenSinkExpected()

  assert.deepEqual(actual.operator, expected.operator)
  assert.deepEqual(actual.bar, expected.bar)
  assert.deepEqual(actual.beat, expected.beat)
  assert.deepEqual(actual.sixteenth, expected.sixteenth)
  assert.deepEqual(actual.scaleNumber, expected.scaleNumber)
  assert.deepEqual(actual.scaleDegree, expected.scaleDegree)
  assert.deepEqual(actual.velocity, expected.velocity)
  assert.deepEqual(actual.duration, expected.duration)
})

test('^ (swapped v and d)', () => {
  const string = 'e *.1,3.%2,%3 s1 2 d 3,4 v 1,2'
  const actual = parse(string)
  const expected = kitchenSinkExpected()

  assert.deepEqual(actual.velocity, expected.velocity)
  assert.deepEqual(actual.duration, expected.duration)
})

test('^ (scale at the end)', () => {
  const string = 'e *.1,3.%2,%3 d 3,4 v 1,2 s1 2'
  const actual = parse(string)
  const expected = kitchenSinkExpected()

  assert.deepEqual(actual.velocity, expected.velocity)
  assert.deepEqual(actual.duration, expected.duration)
  assert.deepEqual(actual.scaleNumber, expected.scaleNumber)
  assert.deepEqual(actual.scaleDegree, expected.scaleDegree)
})

test('allow omitting s, v, and d', () => {
  assert.deepEqual(parse('e 1.1.1'), {
    operator: 'e',
    bar: { type: 'number', value: 0 },
    beat: { type: 'number', value: 0 },
    sixteenth: { type: 'number', value: 0 },
    scaleNumber: 0,
    scaleDegree: { type: 'number', value: 0 },
    velocity: { type: 'number', value: 0 },
    duration: { type: 'number', value: 0 },
  })
})

function kitchenSinkExpected() {
  return {
    operator: 'e',
    bar: {
      type: 'wildcard',
    },
    beat: {
      type: 'list',
      value: [
        {
          type: 'number',
          value: 0,
        },
        {
          type: 'number',
          value: 2,
        },
      ],
    },
    sixteenth: {
      type: 'list',
      value: [
        {
          type: 'modulus',
          value: 2,
        },
        {
          type: 'modulus',
          value: 3,
        },
      ],
    },
    scaleNumber: 0,
    scaleDegree: {
      type: 'number',
      value: 1,
    },
    velocity: {
      type: 'rotatable',
      value: [0, 1],
      cursor: 0,
    },
    duration: {
      type: 'rotatable',
      value: [2, 3],
      cursor: 0,
    },
  }
}
