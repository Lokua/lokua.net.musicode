import { match, MatchError } from './util.mjs'

export default ({ test, assert }) => {
  test('match: map', () => {
    assert.deepEqual(
      match([
        [x => x === 0, () => {}],
        [x => x === 1, () => 42],
      ])(1),
      42,
    )
  })

  test('match: map (primitive)', () => {
    assert.deepEqual(
      match([
        [x => x === 0, () => {}],
        [x => x === 1, 42],
      ])(1),
      42,
    )
  })

  test('match: object', () => {
    assert.deepEqual(
      match({
        a: () => 0,
        b: () => 42,
      })('b'),
      42,
    )
  })

  test('match: object (primitive)', () => {
    assert.deepEqual(
      match({
        a: () => 0,
        b: 42,
      })('b'),
      42,
    )
  })

  test('match: defaultCase', () => {
    try {
      assert.deepEqual(match({})('b'), 42)
    } catch (error) {
      assert.ok(error instanceof MatchError)
    }
  })
}
