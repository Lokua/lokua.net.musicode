import midi from 'midi'
import { partsPerQuarter } from './constants.mjs'

export function is16thTick(tick) {
  return (tick * 4) % partsPerQuarter === 0
}

export function isQuarterTick(tick) {
  return tick % partsPerQuarter === 0
}

export function isBarTick(tick) {
  return tick % (partsPerQuarter * 4) === 0
}

export function noteValueToMs(bpm, divisionOfMeasure) {
  return ((60 * 1000) / bpm) * divisionOfMeasure
}

export function findNodeMidiPortByName(type, name, debug) {
  const input = new midi[type]()

  for (let i = 0; i < input.getPortCount(); i++) {
    const port = input.getPort(i)

    if (debug) {
      console.log('port', i, ':', port)
    }

    if (port.name.toLowerCase() === name) {
      return port
    }
  }
}
