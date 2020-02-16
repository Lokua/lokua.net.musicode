import fs from 'fs'
import path from 'path'

walkSync(`${process.cwd()}/src`).forEach(filename => {
  if (filename.endsWith('.spec.mjs')) {
    console.info('importing', filename)
    import(filename).catch(err => {
      console.error(err)
      process.exit(0)
    })
  }
})

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
