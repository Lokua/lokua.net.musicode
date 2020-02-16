// POC to evaluate if PEG is worth if over brute force string parsing
import { inspectDeep } from './src/util.mjs'
const string = 'e *.1,3.%2,%3 s1 2 v 1,2 d 3,4'

const parts = string.split(/\s+/).map(s => s.trim())

const [operator, meter, scale, scaleDegree, , velocities, , durations] = parts

console.log(
  inspectDeep({
    operator,
    meter: parseMeter(meter),
    // NOTE: do not support providing scale name as you won't be able to load
    // arbitrary configs with different scales on the same patterns
    scaleNumber: parseScaleNumber(scale),
    scaleDegree: parseRotatable(scaleDegree),
    velocities: parseRotatable(velocities),
    durations: parseRotatable(durations),
  }),
)

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
      value: Number(metric),
    }
  }

  if (!metric.includes(',') && metric.startsWith('%')) {
    return {
      type: 'modulus',
      value: Number(metric.slice(1)),
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
  return scaleNumber === 's' ? 1 : Number(scaleNumber.slice(1))
}

function parseRotatable(value) {
  if (!isNaN(Number(value))) {
    return {
      type: 'number',
      value: Number(value),
    }
  }

  if (value.includes(',')) {
    return {
      type: 'rotatable',
      value: commaSeperatedToArray(value),
      pointer: 0,
    }
  }
}

function commaSeperatedToArray(commaSeperated) {
  return commaSeperated.split(',').map(Number)
}
