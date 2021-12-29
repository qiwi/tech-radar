import {parse as parseCsv} from 'csv-parse/sync'
import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'

import { normalizeCsv } from './util.js'

/**
 * read file and generate radarDocument
 * @param filePath
 * @returns {{data: any[], meta: {}, quadrantAliases?: {}}} radarDocument
 */
export const read = (filePath) => {
  try {
    return getReader(path.extname(filePath))(filePath)
  } catch (err) {
    console.error('filePath:', filePath, err)
    return {}
  }
}
/**
 * selection of the reading function depending on the extension
 * @param ext
 * @returns {(function(*=): {data: any[], meta: {}})}
 */
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
/**
 * read .csv file and generate radarDocument
 * @param csvPath
 * @returns {{data: any[], meta: {}, quadrantAliases?: {}}} radarDocument
 */
export const csvReader = (csvPath) => {
  const csvPathResolved = path.resolve(csvPath)
  const radarContents = normalizeCsv(fs.readFileSync(csvPathResolved, 'utf8'))
  const radarDocument = {
    meta: {},
    data: [],
    quadrantAliases: {},
    quadrantTitles: {},
  }
  radarContents.split('===').forEach((radarChunks) => {
    const records = parseCsv(radarChunks, {
      columns: true,
      skip_empty_lines: true,
    })
    const header = Object.keys(records[0])

    if (header.includes('name') && header.includes('quadrant')) {
      radarDocument.data = [...radarDocument.data, ...records]
    } else if (header.includes('alias')) {
      records.forEach((record) => {
        radarDocument.quadrantAliases[record.alias.toLowerCase()] =
          record.quadrant.toLowerCase()
      })
    } else if (header.includes('title') && header.includes('quadrant')) {
      records.forEach((record) => {
        radarDocument.quadrantTitles[record.quadrant.toLowerCase()] =
          record.title
      })
    } else {
      Object.assign(radarDocument.meta, records[0])
    }
  })
  return radarDocument
}
/**
 * read .json file and generate radarDocument
 * @param jsonPath
 * @returns {{data: any[], meta: {}}} radarDocument
 */
export const jsonReader = (jsonPath) => {
  const jsonPathResolved = path.resolve(jsonPath)
  const fileData = fs.readFileSync(jsonPathResolved, 'utf8')
  return JSON.parse(fileData)
}
/**
 * read .yml file and generate radarDocument
 * @param yamlPath
 * @returns {{data: any[], meta: {}}} radarDocument
 */
export const yamlReader = (yamlPath) => {
  const jsonPathResolved = path.resolve(yamlPath)
  const yamlData = fs.readFileSync(jsonPathResolved, 'utf8')
  return yaml.load(yamlData, 'utf8')
}
