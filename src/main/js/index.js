import fsExtra from 'fs-extra'
import globby from 'globby'

import { tempDir } from './constants.js'
import { init, readFiles, resolveBases, sortContexts } from './context.js'
import { genParamMove } from './generateMdAssets.js'
import { generateStatics, genNavigationPage } from './generateStatic.js'

/**
 * generate static sites from csv/json/yml files to the output directory
 * @param input - globby pattern for input files
 * @param output - output directory
 * @param cwd - current working directory
 * @param autoscope - idenfify same-scoped files as subversions of a single radar
 */
export const run = async ({
  input,
  output,
  cwd = process.cwd(),
  basePrefix,
  autoscope,
  navPage,
} = {}) => {
  try {
    // TODO check that `output` is not a dir if exists
    const sources = await getSources(input, cwd)
    const intermediate = []
    genNavigationPage(await generateStatics(
      genParamMove(
        sortContexts(resolveBases(readFiles(init(sources)))),
        intermediate,
        autoscope,
      ),
      output,
      basePrefix,
    ), output, navPage, input)
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
