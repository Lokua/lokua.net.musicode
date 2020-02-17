import assert from 'assert'
import test from './test/index.mjs'
import { Instruction } from './Instructions.mjs'
import { valueTypes } from './constants.mjs'

test('rotateCursor', () => {
  const defaults = {
    type: valueTypes.rotatable,
    value: [0, 1, 2],
  }

  const instruction = new Instruction({
    id: 'id',
    operator: 'e',
    bar: {},
    beat: {},
    sixteenth: {},
    scaleNumber: 0,
    scaleDegree: { ...defaults, cursor: 0 },
    velocity: { ...defaults, cursor: 1 },
    duration: { ...defaults, cursor: 2 },
    mute: false,
  })

  instruction.rotateCursor()

  assert.deepEqual(instruction.scaleDegree.cursor, 1)
  assert.deepEqual(instruction.velocity.cursor, 2)
  assert.deepEqual(instruction.duration.cursor, 0)
})
