import fsExtra from 'fs-extra'
import globby from 'globby'

import { tempDir } from './constants.js'
import {
  init,
  readFiles,
  resolveBases,
  sortContexts,
} from './context.js'
import {generateStatics} from './generateStatic.js'
import { read } from './reader.js'

/**
 * generate static sites from csv/json/yml files to the output directory
 * @param input - globby pattern for input files
 * @param output - output directory
 * @param cwd - current working directory
 */
export const run = async ({
  input,
  output,
  cwd = process.cwd(),
  basePrefix,
  autoscope,
} = {}) => {
  console.log(input, output, cwd, basePrefix)
  try {
    // TODO check that `output` is not a dir if exists
    const sources = await getSources(input, cwd)
    const intermediate = []
    const statics = await generateStatics(
      sortContexts(resolveBases(readFiles(init(sources)))),
      output,
      basePrefix,
      intermediate,
      autoscope,
    )
    console.log('statics=', statics)
  } catch (err) {
    console.error(err)
  } finally {
    await fsExtra.remove(tempDir)
  }
}
/**
 * gives array of all file paths matching the globby pattern
 * @param input - globby pattern for input files
 * @param cwd - current working directory
 * @returns {string[]}
 */
export const getSources = async (input, cwd) =>
  globby.sync([input], {
    onlyFiles: true,
    absolute: true,
    cwd,
  })
/**
 * returns parsed data in radarDocument format
 * @param inputs
 * @returns {radarDocument[]}
 */
export const getDocuments = (inputs) => inputs.map(read)
