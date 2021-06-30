import parse from 'csv-parse/lib/sync.js'
import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'

export const read = (filePath) => {
  return getReader(path.extname(filePath))(filePath)
}

export const getReader = (ext) => {
  if (ext === '.csv') {
    return csvReader
  }
  if (ext === '.json') {
    return jsonReader
  }
  if (ext === '.yml') {
    return yamlReader
  }
  throw new Error('Unsupported format', ext)
}

export const csvReader = (csvPath) => {
  const csvPathResolved = path.resolve(csvPath)
  const radarContents = fs.readFileSync(csvPathResolved, 'utf8')
  const radarDocument = {
    meta: {},
    data: [],
  }
  radarContents.split('===').forEach((radarChunks) => {
    const records = parse(radarChunks, {
      columns: true,
      skip_empty_lines: true,
    })
    const header = Object.keys(records[0])

    if (header.includes('name') && header.includes('quadrant')) {
      radarDocument.data = [...radarDocument.data, ...records]
    } else {
      Object.assign(radarDocument.meta, records[0])
    }
  })
  return radarDocument
}

export const jsonReader = (jsonPath) => {
  const jsonPathResolved = path.resolve(jsonPath)
  const fileData = fs.readFileSync(jsonPathResolved, 'utf8')
  return JSON.parse(fileData)
}

export const yamlReader = (yamlPath) => {
  const jsonPathResolved = path.resolve(yamlPath)
  const yamlData = fs.readFileSync(jsonPathResolved, 'utf8')
  return yaml.load(yamlData, 'utf8')
}
