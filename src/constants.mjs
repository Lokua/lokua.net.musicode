export const partsPerQuarter = 24

export const valueTypes = {
  wildcard: 'wildcard',
  number: 'number',
  list: 'list',
  get modulus() {
    console.warn('valueTypes.modulo is deprecated. use "modulo"')
    return 'modulo'
  },
  modulo: 'modulo',
  rotatable: 'rotatable',
}
