const data = []

export function getScales() {
  return data.slice()
}

export function register(scale) {
  return data.push(parse(scale))
}

export function unregister(index) {
  data.splice(index, 1)
}

export function findByName(name) {
  return data.find(scale => scale.name === name)
}

export function findByIndex(index) {
  return data[index]
}

function parse(scale) {
  const s = scale.replace('register ', '')
  const name = s.slice(0, s.indexOf(' ')).trim()
  const values = s.replace(name, '')

  const parsed = {
    name,
    values: values.split(',').map(s => Number(s.trim())),
  }

  return parsed
}
