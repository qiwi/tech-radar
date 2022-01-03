import path from 'path'
import { globby } from 'globby'

import { parseCsvRadar } from './csv.js'
import { parseJsonRadar } from './json.js'
import { parseYamlRadar } from './yaml.js'
import { validate } from './validator.js'

export {
  parseCsvRadar,
  parseJsonRadar,
  parseYamlRadar
}

/**
 * Parse radarDocument
 * @param filePath
 * @returns {{data: any[], meta: {}, quadrantAliases?: {}}} radarDocument
 */
export const parse = (filePath) => {
  try {
    const reader = getReader(path.extname(filePath))
    const document = reader(filePath)
    const radar = normalizeEntries(document)

    return validate(radar)
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
    return parseCsvRadar
  }
  if (ext === '.json') {
    return parseJsonRadar
  }
  if (ext === '.yml' || ext === '.yaml') {
    return parseYamlRadar
  }
  throw new Error('Unsupported format', ext)
}

/**
 * Returns absolute files paths by glob pattern
 * @param {string|string[]} pattern - glob pattern
 * @param cwd - cwd
 * @returns {Promise<string[]>}
 */
export const getSources = async (pattern, cwd) =>
  globby([pattern], {
    onlyFiles: true,
    absolute: true,
    cwd,
  })

export const normalizeEntries = (doc) => {
  doc.data.forEach((entry) => {
    entry.ring = entry.ring.toLowerCase()
    entry.quadrant = getQuadrant(entry.quadrant, doc.quadrantAliases)
    entry.moved = +entry.moved || 0
  })

  return doc
}

export const getQuadrant = (quadrant, quadrantAliases) => {
  const lowQuadrant = quadrant.toLowerCase()
  return quadrantAliases[lowQuadrant] || lowQuadrant
}
