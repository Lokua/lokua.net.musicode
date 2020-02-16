import assert from 'assert'
import test from './test/index.mjs'
import instructionBus from './instructionBus.mjs'
import { valueTypes } from './constants.mjs'

test('rotateCursor', () => {
  const defaults = {
    type: valueTypes.rotatable,
    value: [0, 1, 2],
  }

  const instruction = {
    raw: 'id',
    scaleDegree: { ...defaults, cursor: 0 },
    velocity: { ...defaults, cursor: 1 },
    duration: { ...defaults, cursor: 2 },
  }

  instructionBus.emit('instruction', { command: 'id', instruction })

  instructionBus.rotateCursor(instruction)
  const actual = instructionBus.getInstructions()[0]
  assert.deepEqual(actual.scaleDegree.cursor, 1)
  assert.deepEqual(actual.velocity.cursor, 2)
  assert.deepEqual(actual.duration.cursor, 0)
})
