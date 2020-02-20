const f = []

test.f = name => {
  f.push(name)
}

test.x = () => {
  //
}

export default async function test(testName, fn) {
  try {
    if (!f.length || f.includes(testName)) {
      await fn()
    }
  } catch (error) {
    test.failure = {
      testName,
      error,
    }
  }
}
