import fsExtra from 'fs-extra'
import globby from 'globby'
import { uniq } from 'lodash-es'
import path from 'path'

import { tempDir } from './constants.js'
import { genStatics } from './generateStatic.js'
import { read } from './reader.js'
import { makeUniq, reverse } from './util.js'

/**
 * generate static sites from csv/json/yml files to the output directory
 * @param input - globby pattern for input files
 * @param output - output directory
 * @param cwd - current working directory
 */
export const run = async ({ input, output, cwd = process.cwd() } = {}) => {
  try {
    // TODO check that `output` is not a dir if exists
    const sources = await getSources(input, cwd)
    const docs = getDocuments(sources)
    const dirs = getDirs(sources)
    const statics = await genStatics(docs, dirs, output)

    console.log('statics=', statics)
  } finally {
    fsExtra.removeSync(tempDir)
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
/**
 * gives unique dirs names for static sites
 * @param sources
 */
export const getDirs = (sources) =>
  makeUniq(sources.map((s) => s.slice(0, -path.extname(s).length)))
    .map((s) => reverse(s.split(path.sep)).filter((v) => v))
    .reduce((_m, _v, _i, a) => {
      let r
      let i = 0

      while (uniq(r).length !== a.length) {
        i++
        r = a.map((c) => reverse(c.slice(0, i)).join('-'))
      }

      a.length = 0
      return r
    })
