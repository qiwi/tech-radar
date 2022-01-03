import fs from 'fs'
import path from 'path'

/**
 * read .json file and generate radarDocument
 * @param jsonPath
 * @returns {{data: any[], meta: {}}} radarDocument
 */
export const parseJsonRadar = (jsonPath) => {
  const jsonPathResolved = path.resolve(jsonPath)
  const fileData = fs.readFileSync(jsonPathResolved, 'utf8')
  return JSON.parse(fileData)
}
