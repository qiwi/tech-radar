import Eleventy from '@11ty/eleventy'
import fsExtra from 'fs-extra'
import globby from 'globby'
import {uniq} from 'lodash'
import path from 'path'

import {
  quadrantAliases,
  tempDir,
  tplDir} from './constants.js'

import {read} from './reader.js'

export const run = async ({ input, output, cwd = process.cwd()} = {}) => {
  try {
    // TODO check that `output` is not a dir if exists
    const sources = getSources(input, cwd)
    const docs = getDocuments(sources)
    const dirs = getDirs(sources)
    const statics = genStatics(docs, dirs, output)

    console.log('statics=', statics)

  } finally {
    fsExtra.emptyDirSync(tempDir)
  }
}

export const getSources = async (input, cwd) => globby.sync(
    [input],
    {
      onlyFiles: true,
      absolute: true,
      cwd
    }
  )

export const getDocuments = (inputs) => inputs.map(read)

const reverse = (arr) => {
  const _arr = [...arr]
  _arr.reverse()

  return _arr
}

export const getDirs = (sources) => sources
  .map(s => reverse(s.slice(0, -path.extname(s).length).split(path.sep)))
  .reduce((_m, _v, _i, a) => {
    let r
    let i = 0
    while (uniq(r).length !== a.length) {
      i++
      r = a.map(c => reverse(c.slice(0, i)).join('-'))
    }

    return r
  })

export const genStatics = async (docs, dirs, _output) => docs.reduce(async (r, doc, i) => {
  const temp = path.resolve(tempDir, dirs[i])
  const output = path.resolve(_output, dirs[i])

  global._e11y_ = {
    title: doc.meta.title,
    output,
    temp
  }

  try {
    genMdAssets(doc, temp)
    await genEleventy(temp, output)

  } catch (err) {
    console.error(err)
  }

  return [...await r, output]
}, [])


export const genEleventy = async (temp, output) => {
  const elev = new Eleventy(temp, output)
  elev.setConfigPathOverride('src/main/js/e11y/.eleventy.cjs')
  await elev.init()
  await elev.write()
  await fsExtra.remove(temp)
}

export function getMdPath({name, quadrant, temp}) {
  const entryMdName = name + '.md'
  const quadrantAlias = quadrantAliases[quadrant.toLowerCase()]

  if (!quadrantAlias) {
    throw new Error(
      `Parsing error: invalid quadrant - "${quadrantAlias}" name - "${name}"`,
    )
  }

  return path.join(temp, '/entries', quadrantAlias, entryMdName)
}

export function genMdContent({ring, description, moved}) {
  return `---
ring: ${ring.toLowerCase()}
moved: ${moved || 0}
---
${description}`
}

export const genMdAssets = (doc, temp) => {
  fsExtra.copySync(tplDir, temp)

  doc.data.forEach(({name, quadrant, ring, description, moved}) => {
    try {
      const entryPath = getMdPath({name, quadrant, temp})
      const content = genMdContent({ring, description, moved})
      fsExtra.writeFileSync(entryPath, content)

    } catch (err) {
      console.error(err)
    }
  })
}
