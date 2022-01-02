import path from "path";
import fs from "fs";
import yaml from "js-yaml";

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
