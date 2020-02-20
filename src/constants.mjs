export const partsPerQuarter = 24

export const valueTypes = {
  wildcard: 'wildcard',
  number: 'number',
  list: 'list',
  string: 'string',
  get modulus() {
    console.warn('valueTypes.modulo is deprecated. use "modulo"')
    return 'modulo'
  },
  modulo: 'modulo',
  rotatable: 'rotatable',
}

export const expressionTypes = {
  instruction: 'instruction',
  register: 'register',
  unregister: 'unregister',
  transform: 'transform',
  mute: 'mute',
  unmute: 'unmute',
}
