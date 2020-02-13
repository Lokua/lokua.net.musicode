# musicode

(terrible name, placeholder for now)

## Thinking out loud

The first basic idea for a procedural MIDI DSL: _"at TIME do X"_

> NOTE: examples are NOT zero indexed! Keep it musical!

Every bar (downbeat) play the first registered scale degree 1

```
e .1 s 1
// longhand:
e *.1 s1 (1, 127)
```

Every other bar on the 2nd beat play the 2nd registered scale degree 1

```
e %2.2 s2 1
// longhand:
e *%2.2 s2 (1, 127)
```

Every 16th note of every 3rd beat of every 5th bar rotate through the provided
scale degrees

```
e %5.3.* s [3, 5, (7, 90)]
// longhand:
e *%5.3.* s1 [(3, 127), (5, 127), (7, 90)]
```

Registering functions to return values:

```js
lib.register('foo', value => value)
```

every beat...

```
e *.foo s 1
```
