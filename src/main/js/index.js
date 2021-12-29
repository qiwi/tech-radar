import fsExtra from 'fs-extra'
import { globbySync } from 'globby'
import tempy from 'tempy'

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
  navTitle,
  navFooter,
  temp = tempy.directory()
} = {}) => {
  try {
    // TODO check that `output` is not a dir if exists
    const sources = await getSources(input, cwd)
    const intermediate = []
    genNavigationPage(
      await generateStatics(
        genParamMove(
          sortContexts(resolveBases(readFiles(init(sources)))),
          intermediate,
          autoscope,
        ),
        output,
        basePrefix,
        temp,
      ),
      output,
      navPage,
      input,
      navTitle,
      navFooter,
    )
  } catch (err) {
    console.error(err)
  } finally {
    await fsExtra.remove(temp)
  }
}
/**
 * gives array of all file paths matching the globby pattern
 * @param input - globby pattern for input files
 * @param cwd - current working directory
 * @returns {string[]}
 */
export const getSources = async (input, cwd) =>
  globbySync([input], {
    onlyFiles: true,
    absolute: true,
    cwd,
  })
