import path from 'path'
import fs from 'fs'

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
