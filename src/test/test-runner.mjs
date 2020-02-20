import fs from 'fs'
import path from 'path'
import { strict as assert, AssertionError } from 'assert'
import chalk from 'chalk'

import { inspectDeep } from '../util.mjs'
import test from './test-framework.mjs'

const srcPath = `${process.cwd()}/src`

const start = Date.now()

runTests()
  .then(() => {
    if (!test.failure) {
      console.log(chalk.green(`✔︎ ${Date.now() - start}ms`))
    }
  })
  .catch(console.error)

async function runTests() {
  const done = walkSync(srcPath).map(async filename => {
    if (filename.endsWith('.spec.mjs')) {
      const name = path
        .basename(filename, path.extname(filename))
        .replace('.spec', '')

      const wrapper = await import(filename)

      wrapper.default({
        test,
        assert,
      })

      if (test.failure) {
        if (test.failure.error instanceof AssertionError) {
          prettyPrintAssertError(
            name,
            test.failure.testName,
            test.failure.error,
          )
        } else {
          console.log(inspectDeep(test.failure))
        }

        process.exit()
      }
    }
  })

  await Promise.all(done)
}

function prettyPrintAssertError(filename, testName, error) {
  console.error(
    chalk.cyan(filename),
    '\n',
    chalk.bold.underline.red(`\n${testName} failed\n`),
    error.message.trimEnd(),
    '\n\n',
    chalk.gray(
      error.stack
        .slice(error.stack.indexOf('at file://'))
        .split('\n')
        .map(
          (s, i) =>
            // WTF goofy empty char before first "at "
            (i > 0 ? ' ' : '') + s.trim().replace(`file://${srcPath}`, '~~'),
        )
        .filter(
          s =>
            !/test-(framework|runner)/.test(s) &&
            !s.includes('at async Promise.all (index 13)'),
        )
        .join('\n'),
    ),
  )
}

// https://gist.github.com/kethinov/6658166#gistcomment-1921157
function walkSync(dir, fileList = []) {
  fs.readdirSync(dir).forEach(file => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      fileList = walkSync(path.join(dir, file), fileList)
    } else {
      fileList.push(path.join(dir, file))
    }
  })

  return fileList
}
