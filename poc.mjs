import P from 'parsimmon'
import R from 'ramda'
import { inspectDeep } from './src/util.mjs'

const rejectNils = R.reject(R.isNil)
const objOfValue = R.objOf('value')
const withType = R.assoc('type')
const toNumber = R.map(Number)
const isNumeric = R.compose(R.negate(isNaN), Number)

const createLang = () =>
  P.createLanguage({
    expression: r =>
      P.alt(
        r.instructionExpression,
        r.muteExpression,
        r.registerExpression,
        r.unregisterExpression,
      ).map(rejectNils),

    // expressions
    instructionExpression: r =>
      P.seq(r.instruction, r.ws, r.meter)
        .map(rejectNils)
        .map(x => x.reduce((o, v) => ({ ...o, ...v }), {})),
    muteExpression: r => P.seq(r.mute, r.ws, P.alt(r.wildcard, r.integerList)),
    registerExpression: r =>
      P.seq(
        r.register,
        r.ws,
        P.letters.map(R.objOf('name')),
        r.ws,
        r.integerList,
      ),
    unregisterExpression: r => P.seq(r.unregister, r.ws, P.letters),

    // operators
    instruction: () => P.regex(/e/).map(R.objOf('operator')),
    meter: r =>
      P.seq(r.metric, r.dot, r.metric, r.dot, r.metric)
        .map(rejectNils)
        .map(([bar, beat, sixteenth]) => ({
          bar,
          beat,
          sixteenth,
        })),
    metric: r => P.alt(r.wildcard, r.digit, r.integerModulusList),

    mute: () => P.regex(/(un)?mute/),
    register: () => P.regex(/register/),
    unregister: () => P.regex(/unregister/),
    transform: () => P.regex(/t/),

    // atoms
    integerList: () =>
      P.regex(/(\d,)+\d/).map(
        R.compose(
          R.assoc('type', 'list'),
          R.objOf('value'),
          toNumber,
          R.split(','),
        ),
      ),
    integerModulusList: r =>
      P.seq(P.seq(r.digitOrModulo, r.comma).atLeast(1), r.digitOrModulo),
    digitOrModulo: r => P.alt(r.digit, r.modulo),
    modulo: r =>
      P.seq(r.percentSign, P.digits)
        .map(Number)
        .map(objOfValue)
        .map(withType('modulus')),
    digit: () =>
      P.digit
        .map(Number)
        .map(objOfValue)
        .map(withType('number')),
    dot: () => P.regexp(/\./).map(R.always(null)),
    comma: () => P.string(','),
    wildcard: () => P.regex(/\*/).map(R.always({ type: 'wildcard' })),
    percentSign: () => P.string('%'),
    ws: () => P.whitespace.map(R.always(null)),
  })

const Lang = createLang()

const expressions = [
  'mute 1,2,3',
  'unmute 1,2,3',
  'mute *',
  'register major 1,2,3,4',
  'unregister major',
  'e *.1.1',
  // 'e *.1,2.%3,2',
  // 'e *.1,2.%3,2 s1 1,2 v 1 d 1,3',
]

expressions.forEach(e => {
  console.log('---')
  console.log(e)
  console.log(inspectDeep(Lang.expression.tryParse(e)))
  console.log(
    'integerModulusList:',
    inspectDeep(Lang.integerModulusList.tryParse('%2,2')),
  )
})
