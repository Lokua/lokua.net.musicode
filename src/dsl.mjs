export const commands = {
  every,
  e: every,
}

export const notations = {
  scale: 'scale',
  s: 'scale',
  midi: 'midi',
  m: 'm',
  notes: 'note',
  note: 'note',
  n: 'n',
}

export function parse(phrase) {
  // TODO: notationMode sounds stupid
  const [command, timeSpec, notationMode, ...value] = phrase.split(' ')

  return {
    command: commands[command].name,
    timeSpec: timeSpec.split('.').map(Number),
    notationMode: notations[notationMode],
    scaleNumber:
      notationMode === 's' ? Number(notationMode.split('')[1] || 1) : undefined,
    scaleDegree: Number(value[0]),
    value: value.map(Number),
  }
}

function every() {}
