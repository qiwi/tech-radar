import path from 'path'
import fs from 'fs'
import {parse as parseCsv} from 'csv-parse/sync'

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

export const normalizeCsv = (fileContents) =>
  fileContents
    .split(/("[^"]+")/g)
    .map((item) => {
      if (item[0] === '"') return item
      return item
        .split(',')
        .map((i) => i.replace(/^ *| *$/gm, ''))
        .join(',')
    })
    .join('')
