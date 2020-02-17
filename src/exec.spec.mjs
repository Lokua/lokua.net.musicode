import assert from 'assert'
import test from './test/index.mjs'
import { valueTypes } from './constants.mjs'
import { canPlay, getNote, genericRotatableGet } from './exec.mjs'

test('canPlay:1.1.1', () => {
  assert.ok(
    canPlay({
      timeState: {
        meter: [0, 0, 0],
        sixteenths: 0,
      },
      instruction: {
        bar: {
          type: valueTypes.number,
          value: 0,
        },
        beat: {
          type: valueTypes.number,
          value: 0,
        },
        sixteenth: {
          type: valueTypes.number,
          value: 0,
        },
      },
    }),
  )
})

test('canPlay:*.*.%2', () => {
  assert.ok(
    canPlay({
      timeState: {
        meter: [0, 0, 2],
        sixteenths: 8,
      },
      instruction: {
        bar: {
          type: valueTypes.wildcard,
        },
        beat: {
          type: valueTypes.wildcard,
        },
        sixteenth: {
          type: valueTypes.modulus,
          value: 2,
        },
      },
    }),
  )
})

test('canPlay:%3', () => {
  assert.ok(
    canPlay({
      timeState: {
        meter: [12, 0, 0],
        sixteenths: 0,
      },
      instruction: {
        bar: {
          type: valueTypes.modulus,
          value: 3,
        },
        beat: {
          type: valueTypes.number,
          value: 0,
        },
        sixteenth: {
          type: valueTypes.number,
          value: 0,
        },
      },
    }),
  )
})

test('canPlay:*.1,3', () => {
  assert.ok(
    canPlay({
      timeState: {
        meter: [0, 2, 0],
        sixteenths: 0,
      },
      instruction: {
        bar: {
          type: valueTypes.wildcard,
        },
        beat: {
          type: valueTypes.list,
          value: [
            { type: valueTypes.number, value: 0 },
            { type: valueTypes.number, value: 2 },
          ],
        },
        sixteenth: {
          type: valueTypes.number,
          value: 0,
        },
      },
    }),
  )
})

test('getNote', () => {
  assert.deepEqual(
    getNote({
      scales: [
        {
          name: 'major',
          values: [1, 3, 5, 6, 8, 10, 12],
        },
      ],
      instruction: {
        scaleNumber: 0,
        scaleDegree: {
          type: 'number',
          value: 0,
        },
      },
    }),
    1,
  )
})

test('getNote: rotatable', () => {
  assert.deepEqual(
    getNote({
      scales: [
        {
          name: 'major',
          values: [1, 3, 5, 6, 8, 10, 12],
        },
      ],
      instruction: {
        scaleNumber: 0,
        scaleDegree: {
          type: valueTypes.rotatable,
          value: [0, 1, 2],
          cursor: 1,
        },
      },
    }),
    3,
  )
})

test('genericRotatableGet:rotatable velocity', () => {
  const lookupArray = [60, 70, 80]

  assert.deepEqual(
    genericRotatableGet('velocity', {
      lookupArray,
      instruction: {
        velocity: {
          type: valueTypes.rotatable,
          value: [1, 2],
          cursor: 1,
        },
      },
    }),
    80,
  )
})

test('genericRotatableGet:rotatable duration', () => {
  const lookupArray = [60, 70, 80]

  assert.deepEqual(
    genericRotatableGet('duration', {
      lookupArray,
      instruction: {
        duration: {
          type: valueTypes.rotatable,
          value: [1, 2],
          cursor: 1,
        },
      },
    }),
    80,
  )
})

test('genericRotatableGet: velocity number', () => {
  const lookupArray = [60, 70, 80]

  assert.deepEqual(
    genericRotatableGet('velocity', {
      lookupArray,
      instruction: {
        velocity: {
          type: valueTypes.number,
          value: 2,
        },
      },
    }),
    80,
  )
})

test('genericRotatableGet: duration number', () => {
  const lookupArray = [60, 70, 80]

  assert.deepEqual(
    genericRotatableGet('duration', {
      lookupArray,
      instruction: {
        duration: {
          type: valueTypes.number,
          value: 2,
        },
      },
    }),
    80,
  )
})
