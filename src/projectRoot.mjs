import path from 'path'

export default path.join(import.meta.url, '../..').replace(/^file:/, '')
