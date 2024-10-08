import { expressionTypes, valueTypes } from '../constants.mjs'
import Lang from './Lang.mjs'

export default ({ test, assert }) => {
  const instructionA = 'e *.1,2.%3,4'
  const expectedInstructionResultA = {
    expressionType: expressionTypes.instruction,
    operator: 'e',
    bar: {
      type: valueTypes.wildcard,
    },
    beat: {
      type: valueTypes.list,
      value: [
        { type: valueTypes.number, value: 0 },
        { type: valueTypes.number, value: 1 },
      ],
    },
    sixteenth: {
      type: valueTypes.list,
      value: [
        { type: valueTypes.modulo, value: 3 },
        { type: valueTypes.number, value: 3 },
      ],
    },
  }

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
        { type: valueTypes.number, value: 1 },
        { type: valueTypes.number, value: 2 },
        { type: valueTypes.number, value: 3 },
      ],
    })
  })

  test('integerModuloList', () => {
    assert.deepEqual(Lang.integerModuloList.parse('%2,3,%4,1').value, {
      type: valueTypes.list,
      value: [
        { type: valueTypes.modulo, value: 2 },
        { type: valueTypes.number, value: 2 },
        { type: valueTypes.modulo, value: 4 },
        { type: valueTypes.number, value: 0 },
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
      value: 0,
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
          value: 0,
        },
        {
          type: valueTypes.number,
          value: 1,
        },
      ],
    })
  })

  test('meter', () => {
    assert.deepEqual(Lang.meter.parse('1.1.1').value, {
      bar: { type: valueTypes.number, value: 0 },
      beat: { type: valueTypes.number, value: 0 },
      sixteenth: { type: valueTypes.number, value: 0 },
    })
    assert.deepEqual(Lang.meter.parse('1.*.%2').value, {
      bar: { type: valueTypes.number, value: 0 },
      beat: { type: valueTypes.wildcard },
      sixteenth: { type: valueTypes.modulo, value: 2 },
    })
    assert.deepEqual(Lang.meter.parse('*.1,2.%3,4').value, {
      bar: { type: valueTypes.wildcard },
      beat: {
        type: valueTypes.list,
        value: [
          { type: valueTypes.number, value: 0 },
          { type: valueTypes.number, value: 1 },
        ],
      },
      sixteenth: {
        type: valueTypes.list,
        value: [
          { type: valueTypes.modulo, value: 3 },
          { type: valueTypes.number, value: 3 },
        ],
      },
    })
  })

  test('instructionExpression', () => {
    assert.deepEqual(
      Lang.instructionExpression.parse(instructionA).value,
      expectedInstructionResultA,
    )
  })

  test('scale', () => {
    assert.deepEqual(Lang.scale.parse('s 1').value, {
      scaleNumber: 0,
      scaleDegree: {
        type: valueTypes.number,
        value: 0,
      },
    })
    assert.deepEqual(Lang.scale.parse('s4 1,2').value, {
      scaleNumber: 3,
      scaleDegree: {
        type: 'list',
        value: [
          {
            type: valueTypes.number,
            value: 0,
          },
          {
            type: valueTypes.number,
            value: 1,
          },
        ],
      },
    })
  })

  test('instructionExpression: with scale', () => {
    assert.deepEqual(
      Lang.instructionExpression.parse('e *.1,2.%3,2 s 1').value,
      {
        expressionType: expressionTypes.instruction,
        operator: 'e',
        bar: {
          type: valueTypes.wildcard,
        },
        beat: {
          type: valueTypes.list,
          value: [
            { type: valueTypes.number, value: 0 },
            { type: valueTypes.number, value: 1 },
          ],
        },
        sixteenth: {
          type: valueTypes.list,
          value: [
            { type: valueTypes.modulo, value: 3 },
            { type: valueTypes.number, value: 1 },
          ],
        },
        scaleNumber: 0,
        scaleDegree: {
          type: valueTypes.number,
          value: 0,
        },
      },
    )
  })

  test('rotatable', () => {
    assert.deepEqual(Lang.rotatable.parse('v 1').value, {
      velocity: {
        type: valueTypes.number,
        value: 0,
      },
    })
    assert.deepEqual(Lang.rotatable.parse('v 1,2').value, {
      velocity: {
        type: valueTypes.list,
        value: [
          { type: valueTypes.number, value: 0 },
          { type: valueTypes.number, value: 1 },
        ],
      },
    })
  })

  test('instructionExpression: with rotatables', () => {
    const actual = Lang.instructionExpression.parse('e 1.1.1 s 1 v 1').value
    assert.deepEqual(actual.velocity, { type: valueTypes.number, value: 0 })
  })

  test('instructionExpression: with 2 rotatables', () => {
    const actual = Lang.instructionExpression.parse('e 1.1.1 s 1 v 1 d 2').value
    assert.deepEqual(actual.duration, { type: valueTypes.number, value: 1 })
  })

  test('instructionExpression: any order', () => {
    assert.deepEqual(
      Lang.instructionExpression.parse('e 1.1.1 s 1 v 1 d 2').value.duration,
      { type: valueTypes.number, value: 1 },
    )
    assert.deepEqual(
      Lang.instructionExpression.parse('e 1.1.1 v 1 s 1 d 2').value.duration,
      { type: valueTypes.number, value: 1 },
    )
    assert.deepEqual(
      Lang.instructionExpression.parse('e 1.1.1 d 2 v 1 s 1').value.duration,
      { type: valueTypes.number, value: 1 },
    )
    // -- no scale
    assert.deepEqual(
      Lang.instructionExpression.parse('e 1.1.1 d 2').value.duration,
      { type: valueTypes.number, value: 1 },
    )
  })

  test('registerExpression', () => {
    assert.deepEqual(
      Lang.registerExpression.parse('register foo 1,2,3').value,
      {
        expressionType: expressionTypes.register,
        name: 'foo',
        value: [0, 1, 2],
      },
    )
  })

  test('unregisterExpression: string', () => {
    assert.deepEqual(Lang.unregisterExpression.parse('unregister foo').value, {
      expressionType: expressionTypes.unregister,
      scale: {
        type: valueTypes.string,
        value: 'foo',
      },
    })
  })

  test('unregisterExpression: number', () => {
    assert.deepEqual(Lang.unregisterExpression.parse('unregister 1').value, {
      expressionType: expressionTypes.unregister,
      scale: {
        type: valueTypes.number,
        value: 1,
      },
    })
  })

  test('muteExpression: *', () => {
    assert.deepEqual(Lang.muteExpression.parse('mute *').value, {
      expressionType: expressionTypes.mute,
      value: {
        type: valueTypes.wildcard,
      },
    })
  })

  test('muteExpression: 1', () => {
    assert.deepEqual(Lang.muteExpression.parse('mute 1').value, {
      expressionType: expressionTypes.mute,
      value: {
        type: valueTypes.number,
        value: 0,
      },
    })
  })

  test('muteExpression: 1,2,3', () => {
    assert.deepEqual(Lang.muteExpression.parse('unmute 1,2,3').value, {
      expressionType: expressionTypes.unmute,
      value: {
        type: valueTypes.list,
        value: [
          { type: valueTypes.number, value: 0 },
          { type: valueTypes.number, value: 1 },
          { type: valueTypes.number, value: 2 },
        ],
      },
    })
  })

  test('expression', () => {
    assert.deepEqual(Lang.expression.parse('register foo 1,2,3').value, {
      expressionType: expressionTypes.register,
      name: 'foo',
      value: [0, 1, 2],
    })
    assert.deepEqual(Lang.expression.parse('mute 1').value, {
      expressionType: expressionTypes.mute,
      value: {
        type: valueTypes.number,
        value: 0,
      },
    })
    assert.deepEqual(
      Lang.expression.parse(instructionA).value,
      expectedInstructionResultA,
    )
  })
}
