import EventEmitter from 'events'

import { debug } from './util.mjs'

const instructions = []

class InstructionBus extends EventEmitter {
  getInstructions() {
    return instructions.slice()
  }
}

const instructionBus = new InstructionBus()

instructionBus.on('instruction', ({ command, instruction }) => {
  if (instructions.find(instruction => instruction.raw === command)) {
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

export default instructionBus
