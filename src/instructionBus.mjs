import EventEmitter from 'events'

import { valueTypes } from './constants.mjs'
import { debug } from './util.mjs'

const instructions = []

class InstructionBus extends EventEmitter {
  getInstructions() {
    return instructions.slice()
  }

  findInstruction(rawCommand) {
    return instructions.find(instruction => instruction.raw === rawCommand)
  }

  rotateCursor(instruction) {
    Object.values(this.findInstruction(instruction.raw)).forEach(entry => {
      if (typeof entry === 'object' && entry.type === valueTypes.rotatable) {
        entry.cursor = (entry.cursor + 1) % entry.value.length
      }
    })
  }
}

const instructionBus = new InstructionBus()

instructionBus.on('instruction', ({ command, instruction }) => {
  if (instructionBus.findInstruction(command)) {
    instructionBus.emit('duplicateInstruction', {
      command,
    })
  } else {
    instructions.push({
      ...instruction,
      raw: command,
    })
  }
})

const createMuteHandler = mute => ({ instructionId }) => {
  if (instructionId.type === valueTypes.wildcard) {
    instructions.forEach(instruction => {
      instruction.mute = mute
    })
  } else if (instructionId.type === valueTypes.number) {
    instructions[instructionId.value].mute = mute
  }
}

instructionBus.on('mute', createMuteHandler(true))
instructionBus.on('unmute', createMuteHandler(false))

export default instructionBus
