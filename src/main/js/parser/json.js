import fse from 'fs-extra'
import path from 'path'

/**
 * read .json file and generate radarDocument
 * @param jsonPath
 * @returns {{data: any[], meta: {}}} radarDocument
 */
export const parseJsonRadar = async (jsonPath) => {
  const jsonPathResolved = path.resolve(jsonPath)
  const fileData = await fse.readFile(jsonPathResolved, 'utf8')
  return JSON.parse(fileData)
}
