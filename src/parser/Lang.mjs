import P from 'parsimmon'
import R from 'ramda'
import chalk from 'chalk'
import { valueTypes } from '../constants.mjs'

const rotatableNames = {
  v: 'velocity',
  d: 'duration',
}

const rejectNils = R.reject(R.isNil)
const objOfValue = R.objOf('value')
const assocType = R.assoc('type')
const toNumber = R.map(Number)
const trace = message => R.tap(x => console.log(chalk.bold.magenta(message), x))
const assocTypeList = assocType('list')
const asValueType = t => R.compose(assocType(t), objOfValue)
const asListValueType = asValueType(valueTypes.list)
const rejectEmptyStrings = R.reject(R.both(R.is(String), R.isEmpty))

const ensureMultiple = parser =>
  parser.chain(x =>
    x.length > 1 ? P.of(x) : P.fail('expected more than one item'),
  )

const createLang = () =>
  P.createLanguage({
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
      const required = [r.instruction, r.ws, r.meter]

      return P.alt(
        P.seq(...required, r.ws, r.rotatable, r.ws, r.scale, r.ws, r.rotatable),
        P.seq(...required, r.ws, r.rotatable, r.ws, r.rotatable, r.ws, r.scale),
        P.seq(...required, r.ws, r.scale, r.ws, r.rotatable, r.ws, r.rotatable),
        P.seq(...required, r.ws, r.rotatable, r.ws, r.rotatable),
        P.seq(...required, r.ws, r.scale, r.ws, r.rotatable),
        P.seq(...required, r.ws, P.alt(r.scale, r.rotatable)),
        P.seq(...required),
      )
        .map(rejectEmptyStrings)
        .map(R.mergeAll)
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
      P.seq(r.scaleNumber, r.ws, P.alt(r.integerList, r.number))
        .map(rejectEmptyStrings)
        .map(([scaleNumber, scaleDegree]) => ({
          scaleNumber,
          scaleDegree,
        })),
    scaleNumber: r =>
      P.alt(ensureMultiple(P.seq(r.s, r.digits)), r.s).map(x =>
        Number(Array.isArray(x) ? x[1] : 1),
      ),
    s: () => P.string('s'),
    rotatable: r =>
      P.seq(P.regex(/[vd]/), r.ws, P.alt(r.integerList, r.number))
        .map(rejectEmptyStrings)
        .map(([k, v]) => ({ [rotatableNames[k]]: v })),

    muteExpression: r => P.seq(r.mute, r.ws, P.alt(r.wildcard, r.integerList)),
    mute: () => P.alt(P.string('unmute'), P.string('mute')),

    registerExpression: r =>
      P.seq(
        r.register,
        r.ws,
        P.letters.map(R.objOf('name')),
        r.ws,
        r.integerList,
      ),
    unregisterExpression: r => P.seq(r.unregister, r.ws, P.letters),
    register: () => P.string('register'),
    unregister: () => P.string('unregister'),

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
      P.seq(r.percentSign, r.digits).map(
        R.compose(asValueType(valueTypes.modulo), Number, R.nth(1)),
      ),
    number: r =>
      r.digits.map(R.compose(asValueType(valueTypes.number), Number)),
    wildcard: () => P.string('*').map(R.always({ type: valueTypes.wildcard })),

    // basics
    digits: () => P.regex(/\d+/),
    dot: () => P.string('.'),
    comma: () => P.string(','),
    percentSign: () => P.string('%'),
    ws: () => P.whitespace.map(R.trim),
  })

const Lang = createLang()

export default Lang
