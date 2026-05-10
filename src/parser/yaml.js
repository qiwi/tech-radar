import fse from 'fs-extra'
import yaml from 'js-yaml'

/**
 * read .yml file and generate radarDocument
 * @param yamlPath
 * @returns {{data: any[], meta: {}}} radarDocument
 */
export const parseYamlRadar = async (yamlPath) => {
  const contents = await fse.readFile(yamlPath, 'utf8')
  return yaml.load(contents, 'utf8')
}
