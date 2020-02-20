const f = []

test.f = async (name, fn) => {
  f.push(name)
  await test(name, fn)
}

test.x = () => {
  //
}

export default async function test(name, fn) {
  try {
    if (!f.length || f.includes(name)) {
      await fn()
    }
  } catch (error) {
    test.failure = {
      testName: name,
      error,
    }
  }
}
