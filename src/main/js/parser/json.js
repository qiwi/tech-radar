import fse from 'fs-extra'

/**
 * read .json file and generate radarDocument
 * @param jsonPath
 * @returns {{data: any[], meta: {}}} radarDocument
 */
export const parseJsonRadar = fse.readJson
