import parse from 'csv-parse/lib/sync.js'
import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'

import { trim, trimCsvFile } from './util.js'

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
  const radarContents = trimCsvFile(fs.readFileSync(csvPathResolved, 'utf8'))
  const radarDocument = {
    meta: {},
    data: [],
    quadrantAliases: {},
    quadrantTitles: {},
  }
  radarContents.split('===').forEach((radarChunks) => {
    const records = parse(radarChunks, {
      columns: true,
      skip_empty_lines: true,
    })
    const header = Object.keys(records[0])

    if (header.includes('name') && header.includes('quadrant')) {
      radarDocument.data = [
        ...radarDocument.data,
        ...records.map(trimRadarData),
      ]
    } else if (header.includes('alias')) {
      records.forEach((record) => {
        radarDocument.quadrantAliases[trim(record.alias.toLowerCase())] = trim(
          record.quadrant.toLowerCase(),
        )
      })
    } else if (header.includes('title') && header.includes('quadrant')) {
      records.forEach((record) => {
        radarDocument.quadrantTitles[trim(record.quadrant.toLowerCase())] =
          trim(record.title)
      })
    } else {
      Object.assign(radarDocument.meta, trimRadarMeta(records[0]))
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
/**
 * trim item radar.data
 * @param name
 * @param quadrant
 * @param ring
 * @param description
 * @param moved
 * @returns {{ring, quadrant, moved, name, description}}
 */
export const trimRadarData = ({ name, quadrant, ring, description, moved }) => {
  return {
    name: trim(name),
    quadrant: trim(quadrant),
    ring: trim(ring),
    description: description ? trim(description) : '',
    moved: moved ? trim(moved) : '',
  }
}
/**
 * trim element radar.meta title, date or legend
 * @param elem
 * @returns {}
 */
export const trimRadarMeta = (elem) => {
  const header = Object.keys(elem)
  return {
    [header[0]]: trim(elem[header[0]]),
  }
}
