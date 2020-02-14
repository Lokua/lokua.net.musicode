{
  const operators = {
    e: 'every',
  }
}

command "command" = command:operator space timeSpec space scaleLookup

operator "operator" = operator:[el] {
  return {
    operator: operators[operator],
  }
}

timeSpec "timeSpec" = timeSpec:(tick dot tick dot tick) {
  const [bar, beat, tick] = timeSpec.filter(x => x !== '.')
  
  return {
    bar,
    beat,
    tick,
  }
}

scaleLookup "scaleLookup" = scale:("s" [1-9]* space [1-9]*) {
  const [s, scaleNumber = [], , scaleDegree] = scale
  
  return {
    scaleNumber: Number(scaleNumber[0]) - 1 || 0,
    scaleDegree: Number(scaleDegree[0]) - 1
  }
}

tick = n:[1-4*] { return n === '*' ? '*' : n - 1 }
dot = [.]
space "space" = " "+ { return null }