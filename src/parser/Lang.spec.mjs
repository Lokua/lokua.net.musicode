import assert from 'assert'
import test from '../test/index.mjs'
import { valueTypes } from '../constants.mjs'
import Lang from './Lang.mjs'

// // scratch paper
// test('a', () => {
//   assert.deepEqual(Lang.a.parse('a').value, 'a')
//   assert.deepEqual(Lang.aList.parse('a,a,a').value, ['a', 'a', 'a'])
//   assert.deepEqual(Lang.aOrAList.parse('a,a,a').value, ['a', 'a', 'a'])
//   assert.deepEqual(Lang.aOrAList.parse('a').value, 'a')
// })

test('modulo', () => {
  assert.deepEqual(Lang.modulo.parse('%2').value, {
    type: 'modulo',
    value: 2,
  })
})

test('integerList', () => {
  assert.deepEqual(Lang.integerList.parse('2,3,4').value, {
    type: valueTypes.list,
    value: [
      { type: valueTypes.number, value: 2 },
      { type: valueTypes.number, value: 3 },
      { type: valueTypes.number, value: 4 },
    ],
  })
})

test('integerModuloList', () => {
  assert.deepEqual(Lang.integerModuloList.parse('%2,3,%4,1').value, {
    type: valueTypes.list,
    value: [
      { type: valueTypes.modulo, value: 2 },
      { type: valueTypes.number, value: 3 },
      { type: valueTypes.modulo, value: 4 },
      { type: valueTypes.number, value: 1 },
    ],
  })
  assert.ok(!Lang.integerModuloList.parse('99').status)
})

test('metric', () => {
  assert.deepEqual(Lang.metric.tryParse('*'), {
    type: valueTypes.wildcard,
  })
  assert.deepEqual(Lang.metric.tryParse('1'), {
    type: valueTypes.number,
    value: 1,
  })
  assert.deepEqual(Lang.metric.tryParse('%2'), {
    type: valueTypes.modulo,
    value: 2,
  })
  assert.deepEqual(Lang.metric.parse('1,2').value, {
    type: valueTypes.list,
    value: [
      {
        type: valueTypes.number,
        value: 1,
      },
      {
        type: valueTypes.number,
        value: 2,
      },
    ],
  })
})

test('meter', () => {
  assert.deepEqual(Lang.meter.parse('1.1.1').value, {
    bar: { type: valueTypes.number, value: 1 },
    beat: { type: valueTypes.number, value: 1 },
    sixteenth: { type: valueTypes.number, value: 1 },
  })
  assert.deepEqual(Lang.meter.parse('1.*.%2').value, {
    bar: { type: valueTypes.number, value: 1 },
    beat: { type: valueTypes.wildcard },
    sixteenth: { type: valueTypes.modulo, value: 2 },
  })
  assert.deepEqual(Lang.meter.parse('*.1,2.%3,4').value, {
    bar: { type: valueTypes.wildcard },
    beat: {
      type: valueTypes.list,
      value: [
        { type: valueTypes.number, value: 1 },
        { type: valueTypes.number, value: 2 },
      ],
    },
    sixteenth: {
      type: valueTypes.list,
      value: [
        { type: valueTypes.modulo, value: 3 },
        { type: valueTypes.number, value: 4 },
      ],
    },
  })
})

test('instructionExpression', () => {
  assert.deepEqual(Lang.instructionExpression.parse('e *.1,2.%3,2').value, {
    operator: 'e',
    bar: {
      type: valueTypes.wildcard,
    },
    beat: {
      type: valueTypes.list,
      value: [
        { type: valueTypes.number, value: 1 },
        { type: valueTypes.number, value: 2 },
      ],
    },
    sixteenth: {
      type: valueTypes.list,
      value: [
        { type: valueTypes.modulo, value: 3 },
        { type: valueTypes.number, value: 2 },
      ],
    },
  })
})

test('scale', () => {
  assert.deepEqual(Lang.scale.parse('s 1').value, {
    scaleNumber: 1,
    scaleDegree: {
      type: valueTypes.number,
      value: 1,
    },
  })
  assert.deepEqual(Lang.scale.parse('s4 1,2').value, {
    scaleNumber: 4,
    scaleDegree: {
      type: 'list',
      value: [
        {
          type: valueTypes.number,
          value: 1,
        },
        {
          type: valueTypes.number,
          value: 2,
        },
      ],
    },
  })
})

test('instructionExpression: with scale', () => {
  assert.deepEqual(Lang.instructionExpression.parse('e *.1,2.%3,2 s 1').value, {
    operator: 'e',
    bar: {
      type: valueTypes.wildcard,
    },
    beat: {
      type: valueTypes.list,
      value: [
        { type: valueTypes.number, value: 1 },
        { type: valueTypes.number, value: 2 },
      ],
    },
    sixteenth: {
      type: valueTypes.list,
      value: [
        { type: valueTypes.modulo, value: 3 },
        { type: valueTypes.number, value: 2 },
      ],
    },
    scaleNumber: 1,
    scaleDegree: {
      type: valueTypes.number,
      value: 1,
    },
  })
})

test('rotatable', () => {
  assert.deepEqual(Lang.rotatable.parse('v 1').value, {
    velocity: {
      type: valueTypes.number,
      value: 1,
    },
  })
  assert.deepEqual(Lang.rotatable.parse('v 1,2').value, {
    velocity: {
      type: valueTypes.list,
      value: [
        { type: valueTypes.number, value: 1 },
        { type: valueTypes.number, value: 2 },
      ],
    },
  })
})

test('instructionExpression: with rotatables', () => {
  const actual = Lang.instructionExpression.parse('e 1.1.1 s 1 v 1').value
  assert.deepEqual(actual.velocity, { type: valueTypes.number, value: 1 })
})

test('instructionExpression: with 2 rotatables', () => {
  const actual = Lang.instructionExpression.parse('e 1.1.1 s 1 v 1 d 2').value
  assert.deepEqual(actual.duration, { type: valueTypes.number, value: 2 })
})

test('instructionExpression: any order', () => {
  assert.deepEqual(
    Lang.instructionExpression.parse('e 1.1.1 s 1 v 1 d 2').value.duration,
    { type: valueTypes.number, value: 2 },
  )
  assert.deepEqual(
    Lang.instructionExpression.parse('e 1.1.1 v 1 s 1 d 2').value.duration,
    { type: valueTypes.number, value: 2 },
  )
  assert.deepEqual(
    Lang.instructionExpression.parse('e 1.1.1 d 2 v 1 s 1').value.duration,
    { type: valueTypes.number, value: 2 },
  )
  // -- no scale
  assert.deepEqual(
    Lang.instructionExpression.parse('e 1.1.1 d 2').value.duration,
    { type: valueTypes.number, value: 2 },
  )
})
