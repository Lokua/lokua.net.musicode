import { valueTypes } from '../constants.mjs'
import { and, negate, createCustomErrorClass, match } from '../util.mjs'

export const ParseError = createCustomErrorClass('ParseError')

export default function parse(string) {
  if (!string.startsWith('e ')) {
    throw new Error('SyntaxError')
  }

  const [operator, meter, ...positionals] = splitByWhiteSpace(string)

  const {
    s: [scaleNumber, scaleDegree],
    v: [, velocity],
    d: [, duration],
  } = orderPositionals(positionals)

  const [bar, beat, sixteenth] = parseMeter(meter)

  return {
    operator,
    bar,
    beat,
    sixteenth,
    scaleNumber: parseScaleNumber(scaleNumber),
    scaleDegree: parseRotatable(scaleDegree),
    velocity: parseRotatable(velocity),
    duration: parseRotatable(duration),
  }
}

function splitByWhiteSpace(string) {
  return string.split(/\s+/).map(s => s.trim())
}

function orderPositionals(positionals = []) {
  return positionals.reduce(
    (acc, x, i, ps) => {
      for (const k of ['s', 'v', 'd']) {
        if (x.startsWith(k)) {
          acc[k] = [x, ps[i + 1]]

          return acc
        }
      }

      return acc
    },
    {
      s: ['s', 1],
      v: ['v', 1],
      d: ['d', 1],
    },
  )
}

function parseMeter(meter) {
  return meter.split('.').map(parseMetric)
}

const parseMetric = match(
  [
    [
      isWildcard,
      () => ({
        type: 'wildcard',
      }),
    ],
    [
      isNumeric,
      x => ({
        type: 'number',
        value: Number(x) - 1,
      }),
    ],
    [
      and(negate(includesComma), startsWithPercentSign),
      x => ({
        type: 'modulus',
        value: Number(x.slice(1)),
      }),
    ],
    [
      includesComma,
      x => ({
        type: 'list',
        value: x.split(',').map(parseMetric),
      }),
    ],
  ],
  x => {
    throw new ParseError(`unable to parse metric ${x}`)
  },
)

function parseScaleNumber(scaleNumber) {
  return scaleNumber === 's' ? 0 : Number(scaleNumber.slice(1)) - 1
}

const parseRotatable = match(
  [
    [
      isNumeric,
      x => ({
        type: valueTypes.number,
        value: Number(x) - 1,
      }),
    ],
    [
      includesComma,
      x => ({
        type: valueTypes.rotatable,
        value: commaSeperatedToArray(x),
        cursor: 0,
      }),
    ],
  ],
  () => {
    throw new ParseError('unable to match rotatable value')
  },
)

function isWildcard(x) {
  return x === '*'
}

function includesComma(x) {
  return x.includes(',')
}

function startsWithPercentSign(x) {
  return x.startsWith('%')
}

function isNumeric(x) {
  return !isNaN(Number(x))
}

function commaSeperatedToArray(commaSeperated) {
  return commaSeperated.split(',').map(n => Number(n) - 1)
}
