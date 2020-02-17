export default class Scales {
  constructor({ scales, velocities, durations }) {
    this.scales = scales
    this.velocities = velocities
    this.durations = durations
  }

  getData() {
    return {
      scales: this.scales,
      velocities: this.velocities,
      durations: this.durations,
    }
  }

  setVelocities(velocities) {
    this.velocities = velocities
  }

  setDurations(durations) {
    this.velocities = durations
  }

  addScale(scale) {
    this.scales.push(typeof scale === 'object' ? scale : this.parse(scale))
  }

  removeScale(scale) {
    this.scales.splice(
      this.scales.findIndex(s => s.name === scale.name),
      1,
    )
  }

  // TODO: move me to parse
  parse(commaSeparated) {
    const name = commaSeparated.slice(0, commaSeparated.indexOf(' ')).trim()
    const values = commaSeparated.replace(name, '')

    return {
      name,
      values: values.split(',').map(s => Number(s.trim())),
    }
  }
}
