import fsExtra from 'fs-extra'
import globby from 'globby'
import lodash from 'lodash'
import path from 'path'

import { tempDir } from './constants.js'
import { genStatics } from './generateStatic.js'
import { read } from './reader.js'
import { makeUniq, reverse } from './util.js'

const { uniq } = lodash

export const run = async ({ input, output, cwd = process.cwd() } = {}) => {
  try {
    // TODO check that `output` is not a dir if exists
    const sources = await getSources(input, cwd)
    const docs = getDocuments(sources)
    const dirs = getDirs(sources)
    const statics = await genStatics(docs, dirs, output)

    console.log('statics=', statics)
  } finally {
    await fsExtra.remove(tempDir)
  }
}

export const getSources = async (input, cwd) =>
  globby.sync([input], {
    onlyFiles: true,
    absolute: true,
    cwd,
  })

export const getDocuments = (inputs) => inputs.map(read)

export const getDirs = (sources) =>
  makeUniq(sources.map((s) => s.slice(0, -path.extname(s).length)))
    .map((s) => reverse(s.split(path.sep)).filter((v) => v))
    .reduce((_m, _v, _i, a) => {
      let r
      let i = 0

      while (uniq(r).length !== a.length) {
        console.log(r)
        i++
        r = a.map((c) => reverse(c.slice(0, i)).join('-'))
      }

      a.length = 0
      return r
    })
