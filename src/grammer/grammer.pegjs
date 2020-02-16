{
  const operators = {
    e: 'every',
  }
}

command "command" = command:(operator space meter space scaleLookup) {
  return command
    .filter(x => x !== null)
    .reduce((acc, item) => ({ ...acc, ...item }), {})
}

operator "operator" = operator:[e] {
  return {
    operator: operators[operator],
  }
}

meter = value:(m [.] m [.] m / m [.] m / m)+ {
  const [bar, beat, sixteenth] = value.filter(x => x !== '.')
  const defaultValue = { 
    type: 'number', 
    value: 0 
  }
  
  return {
    bar,
    beat: beat || defaultValue,
    sixteenth: sixteenth || defaultValue,
  }
}

m = metricList / metric

metricList = wrapped:(metric [,] metric [,]?)+ {
  const [value] = wrapped

  return {
    type: 'list',
    value: value.filter(x => x !== ',' && x !== null),
  }
}

metric = value:(digit / wildcard / modulus) {
  return value
}

wildcard = "*" { 
  return { 
    type: 'wildcard' 
  }  
}

modulus = value:$([%][0-9])+ { 
  return { 
    type: 'modulus', 
    value: Number(value.slice(1))
  }
}

digit = value:[0-9]+ { 
  return { 
    type: 'number', 
    value: Number(value.join('')) - 1
  } 
}

scaleLookup "scaleLookup" = scale:("s" [1-9]* space [1-9]*) {
  const [, scaleNumber = [], , scaleDegree] = scale
  
  return {
    scaleNumber: Number(scaleNumber[0]) - 1 || 0,
    scaleDegree: Number(scaleDegree[0]) - 1
  }
}

space = " "+ { 
  return null 
}
