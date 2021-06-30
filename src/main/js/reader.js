import parse from 'csv-parse/lib/sync.js'
import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'

export const reader = (filePath) => {
  if (filePath.includes('.csv', filePath.length - 4)) {
    return csvReader(filePath)
  }
  if (filePath.includes('.json', filePath.length - 5)) {
    return jsonReader(filePath)
  }
  if (filePath.includes('.yml', filePath.length - 5)) {
    return yamlReader(filePath)
  }
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
    const keys = Object.keys(records[0]).toString()

    if (keys === 'name,quadrant,ring,description,moved') {
      radarDocument.data = [...radarDocument.data, ...records]
    }
    if (keys === 'title') {
      radarDocument.meta.title = records[0].title
    }
    if (keys === 'date') {
      radarDocument.meta.date = records[0].date
    }
    if (keys === 'legend') {
      radarDocument.meta.legend = records[0].legend
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
