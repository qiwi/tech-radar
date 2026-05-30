import { parse as parseCsv } from 'csv-parse/sync'
import fse from 'fs-extra'

/**
 * read .csv file and generate radarDocument
 * @param csvPath
 * @returns {{data: any[], meta: {}, quadrantAliases?: {}}} radarDocument
 */
export const parseCsvRadar = async (csvPath) => {
  const radarContents = normalizeCsv(await fse.readFile(csvPath, 'utf8'))
  const radarDocument = {
    meta: {},
    data: [],
    quadrantAliases: {},
    quadrantTitles: {},
    // Flex sections. Populated when the source uses `sector,*` / `ring,*`
    // rows. Left empty for legacy 4x4 radars — the normaliser derives a
    // unified `sectors`/`rings` view downstream.
    sectorTitles: {},
    sectorAliases: {},
    ringTitles: {},
  }
  radarContents.split('===').forEach((radarChunks) => {
    const records = parseCsv(radarChunks, {
      columns: true,
      skip_empty_lines: true,
    })
    const header = Object.keys(records[0])

    if (
      header.includes('name') &&
      (header.includes('quadrant') || header.includes('sector'))
    ) {
      radarDocument.data = [...radarDocument.data, ...records]
    } else if (header.includes('alias') && header.includes('sector')) {
      records.forEach((r) => {
        radarDocument.sectorAliases[r.alias.toLowerCase()] = r.sector.toLowerCase()
      })
    } else if (header.includes('alias')) {
      records.forEach((r) => {
        radarDocument.quadrantAliases[r.alias.toLowerCase()] = r.quadrant.toLowerCase()
      })
    } else if (header.includes('title') && header.includes('sector')) {
      records.forEach((r) => {
        radarDocument.sectorTitles[r.sector.toLowerCase()] = r.title
      })
    } else if (header.includes('title') && header.includes('ring')) {
      records.forEach((r) => {
        radarDocument.ringTitles[r.ring.toLowerCase()] = r.title
      })
    } else if (header.includes('title') && header.includes('quadrant')) {
      records.forEach((r) => {
        radarDocument.quadrantTitles[r.quadrant.toLowerCase()] = r.title
      })
    } else {
      Object.assign(radarDocument.meta, records[0])
    }
  })
  return radarDocument
}

export const normalizeCsv = (fileContents) =>
  // Strip UTF-8 BOM + CRLF (Excel/Sheets exports on Windows).
  fileContents
    .replace(/^﻿/, '')
    .replace(/\r\n?/g, '\n')
    .split(/("[^"]+")/g)
    .map((item) => {
      if (item[0] === '"') return item
      return item
        .split(',')
        .map((i) => i.replace(/^ *| *$/gm, ''))
        .join(',')
    })
    .join('')
