import P from 'parsimmon'
import R from 'ramda'
import chalk from 'chalk'
import { expressionTypes, valueTypes } from '../constants.mjs'

const rotatableNames = {
  v: 'velocity',
  d: 'duration',
}

const rejectNils = R.reject(R.isNil)
const objOfValue = R.objOf('value')
const assocType = R.assoc('type')
const trace = message => R.tap(x => console.log(chalk.bold.magenta(message), x))
const asValueType = t => R.compose(assocType(t), objOfValue)
const asListValueType = asValueType(valueTypes.list)
const rejectEmptyStrings = R.reject(R.both(R.is(String), R.isEmpty))

const ensureMultiple = parser =>
  parser.chain(x =>
    x.length > 1 ? P.of(x) : P.fail('expected more than one item'),
  )

export default P.createLanguage({
  // scratch paper
  // aOrAList: r => P.alt(ensureMultiple(r.aList), r.a),
  // aList: r => r.a.sepBy1(P.string(',')),
  // a: () => P.string('a'),

  expression: r =>
    P.alt(
      r.instructionExpression,
      r.muteExpression,
      r.registerExpression,
      r.unregisterExpression,
    ).map(rejectNils),

  instructionExpression: r => {
    const required = [r.instruction.skip(r._), r.meter]

    return P.alt(
      P.seq(...required, r._, r.rotatable, r._, r.scale, r._, r.rotatable),
      P.seq(...required, r._, r.rotatable, r._, r.rotatable, r._, r.scale),
      P.seq(...required, r._, r.scale, r._, r.rotatable, r._, r.rotatable),
      P.seq(...required, r._, r.rotatable, r._, r.rotatable),
      P.seq(...required, r._, r.scale, r._, r.rotatable),
      P.seq(...required, r._, P.alt(r.scale, r.rotatable)),
      P.seq(...required),
    ).map(R.compose(R.mergeAll, rejectEmptyStrings))
  },
  instruction: () => P.string('e').map(R.objOf('operator')),
  meter: r =>
    r.metric.sepBy1(r.dot).map(([bar, beat, sixteenth]) => ({
      bar,
      beat,
      sixteenth,
    })),
  metric: r => P.alt(r.integerModuloList, r.modulo, r.wildcard, r.number),
  scale: r =>
    P.seqMap(
      r.scaleNumber.skip(r._),
      P.alt(r.integerList, r.number),
      (scaleNumber, scaleDegree) => ({
        scaleNumber,
        scaleDegree,
      }),
    ),
  scaleNumber: r =>
    P.alt(ensureMultiple(P.seq(r.s, r.digits)), r.s).map(x =>
      Number(Array.isArray(x) ? x[1] : 1),
    ),
  s: () => P.string('s'),
  rotatable: r =>
    P.seqMap(
      P.regex(/[vd]/).skip(r._),
      P.alt(r.integerList, r.number),
      (k, v) => ({
        [rotatableNames[k]]: v,
      }),
    ),

  muteExpression: r =>
    P.seqMap(
      P.regex(/(un)?mute/).skip(r._),
      P.alt(r.wildcard, r.integerList, r.number),
      (expressionType, value) => ({
        expressionType,
        value,
      }),
    ),

  registerExpression: r =>
    P.seqMap(
      P.string(expressionTypes.register).skip(r._),
      P.letters.map(R.objOf('name')).skip(r._),
      r.integerList,
      (expressionType, letters, integerList) => ({
        expressionType,
        name: letters.name,
        value: integerList.value.map(R.prop('value')),
      }),
    ),
  unregisterExpression: r =>
    P.seqMap(
      P.string(expressionTypes.unregister).skip(r._),
      P.alt(r.number, r.string),
      (expressionType, scale) => ({
        expressionType,
        scale,
      }),
    ),

  transform: () => P.string('t'),

  // composite atoms
  integerList: r =>
    ensureMultiple(r.number.sepBy1(r.comma)).map(asListValueType),
  integerModuloList: r =>
    ensureMultiple(P.alt(r.modulo, r.number).sepBy1(r.comma)).map(
      asListValueType,
    ),

  // lowest level "valueTypes"
  modulo: r =>
    r.percentSign
      .then(r.digits)
      .map(R.compose(asValueType(valueTypes.modulo), Number)),
  number: r => r.digits.map(R.compose(asValueType(valueTypes.number), Number)),
  string: () => P.letters.map(asValueType(valueTypes.string)),
  wildcard: () => P.string('*').map(R.always({ type: valueTypes.wildcard })),

  // basics
  digits: () => P.regex(/\d+/),
  dot: () => P.string('.'),
  comma: () => P.string(','),
  percentSign: () => P.string('%'),
  _: () => P.whitespace.map(R.trim),
})
