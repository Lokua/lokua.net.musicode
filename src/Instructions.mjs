import { valueTypes } from './constants.mjs'
import { createCustomErrorClass, debug } from './util.mjs'

export class Instruction {
  static of(constructorArguments) {
    return new Instruction(constructorArguments)
  }

  static requiredKeys = [
    'id',
    'operator',
    'bar',
    'beat',
    'sixteenth',
    'scaleNumber',
    'scaleDegree',
    'velocity',
    'duration',
  ]

  constructor({
    id,
    operator,
    bar,
    beat,
    sixteenth,
    scaleNumber,
    scaleDegree,
    velocity,
    duration,
    muted,
  }) {
    this.id = id
    this.operator = operator
    this.bar = bar
    this.beat = beat
    this.sixteenth = sixteenth
    this.scaleNumber = scaleNumber
    this.scaleDegree = scaleDegree
    this.velocity = velocity
    this.duration = duration
    this.muted = muted

    this.validate()
  }

  validate() {
    for (const [k, v] of Object.entries(this)) {
      if (
        Instruction.requiredKeys.includes(k) &&
        (v === null || v === undefined)
      ) {
        throw new TypeError(`required argument ${k} is ${v}`)
      }
    }
  }

  values() {
    return Object.values(this)
  }

  rotateCursor() {
    this.values().forEach(x => {
      if (typeof x === 'object' && x.type === valueTypes.rotatable) {
        x.cursor = (x.cursor + 1) % x.value.length
      }
    })
  }

  mute() {
    this.muted = true
  }

  unmute() {
    this.muted = false
  }
}

export default class Instructions extends Array {
  static DuplicateInstructionError = createCustomErrorClass(
    'DuplicateInstructionError',
  )

  findById(id) {
    return this.find(instruction => instruction.id === id)
  }

  push({ id, instruction }) {
    if (this.findById(id)) {
      throw new Instructions.DuplicateInstructionError()
    } else {
      super.push(
        Instruction.of({
          ...instruction,
          id,
        }),
      )
    }
  }

  remove(id) {
    this.splice(this.indexOf(this.findById(id)), 1)
  }

  mute() {
    this.forEach(instruction => {
      instruction.mute()
    })
  }

  unmute() {
    this.forEach(instruction => {
      instruction.unmute()
    })
  }
}
