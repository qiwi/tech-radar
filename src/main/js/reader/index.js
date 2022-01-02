import path from 'path'
import { globby } from 'globby'

import { csvReader } from './csv.js'
import { jsonReader } from './json.js'
import { yamlReader } from './yaml.js'

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
  if (ext === '.yml' || ext === '.yaml') {
    return yamlReader
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
