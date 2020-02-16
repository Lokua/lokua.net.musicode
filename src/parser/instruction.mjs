export default function parse(string) {
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

function parseMetric(metric) {
  if (metric === '*') {
    return {
      type: 'wildcard',
    }
  }

  if (!isNaN(Number(metric))) {
    return {
      type: 'number',
      value: Number(metric) - 1,
    }
  }

  if (!metric.includes(',') && metric.startsWith('%')) {
    return {
      type: 'modulus',
      value: Number(metric.slice(1)) - 1,
    }
  }

  if (metric.includes(',')) {
    return {
      type: 'list',
      value: metric.split(',').map(parseMetric),
    }
  }
}

function parseScaleNumber(scaleNumber) {
  return scaleNumber === 's' ? 0 : Number(scaleNumber.slice(1)) - 1
}

function parseRotatable(value) {
  if (!isNaN(Number(value))) {
    return {
      type: 'number',
      value: Number(value) - 1,
    }
  }

  if (value.includes(',')) {
    return {
      type: 'rotatable',
      value: commaSeperatedToArray(value),
      cursor: 0,
    }
  }
}

function commaSeperatedToArray(commaSeperated) {
  return commaSeperated.split(',').map(n => Number(n) - 1)
}
