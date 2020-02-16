import assert from 'assert'
import test from './test/index.mjs'
import { metricTypes } from './constants.mjs'
import { canPlay } from './exec.mjs'

test('canPlay:1.1.1', () => {
  assert.ok(
    canPlay({
      timeState: {
        meter: [0, 0, 0],
        sixteenths: 0,
      },
      music: {
        bar: {
          type: metricTypes.number,
          value: 0,
        },
        beat: {
          type: metricTypes.number,
          value: 0,
        },
        sixteenth: {
          type: metricTypes.number,
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
      music: {
        bar: {
          type: metricTypes.wildcard,
        },
        beat: {
          type: metricTypes.wildcard,
        },
        sixteenth: {
          type: metricTypes.modulus,
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
      music: {
        bar: {
          type: metricTypes.modulus,
          value: 3,
        },
        beat: {
          type: metricTypes.number,
          value: 0,
        },
        sixteenth: {
          type: metricTypes.number,
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
      music: {
        bar: {
          type: metricTypes.wildcard,
        },
        beat: {
          type: metricTypes.list,
          value: [
            { type: metricTypes.number, value: 0 },
            { type: metricTypes.number, value: 2 },
          ],
        },
        sixteenth: {
          type: metricTypes.number,
          value: 0,
        },
      },
    }),
  )
})
