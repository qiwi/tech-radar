import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

import { reader } from './reader.js'

const tplPath = path.resolve('src/main/tpl')

export const langAndFw = 'languages-and-frameworks'
export const platforms = 'platforms'
export const tools = 'tools'
export const techniques = 'techniques'

export function getQuadrant(quadrant) {
  const quadrantAliases = {
    [langAndFw]: langAndFw,
    'languages-and-framework': langAndFw,
    language: langAndFw,
    lang: langAndFw,
    lf: langAndFw,
    fw: langAndFw,
    framework: langAndFw,

    [platforms]: platforms,
    platform: platforms,
    pf: platforms,

    [tools]: tools,
    tool: tools,

    [techniques]: techniques,
    tech: techniques,
  }

  return quadrantAliases[quadrant.toLowerCase()]
}

export function generatePath({ name, quadrant, tempDirResolved }) {
  const entryMdName = name + '.md'
  const quadrantAlias = getQuadrant(quadrant.toLowerCase())

  if (!quadrantAlias) {
    throw new Error(
      `Parsing error: invalid quadrant - "${quadrant}" name - "${name}"`,
    )
  }

  return path.join(tempDirResolved, '/entries', quadrantAlias, entryMdName)
}

export function generateMd({ ring, description, moved }) {
  return `---
ring: ${ring.toLowerCase()}
moved: ${moved || '0'}
---
${description}`
}

export const generateMdAssets = (filePath, tempDir) => {
  const tempDirResolved = path.resolve(tempDir)
  fsExtra.copySync(tplPath, tempDirResolved)
  const radarDocument = reader(filePath)
  radarDocument.data.forEach(({ name, quadrant, ring, description, moved }) => {
    try {
      const entryFilePath = generatePath({ name, quadrant, tempDirResolved })
      const content = generateMd({ ring, description, moved })
      fs.writeFileSync(entryFilePath, content)
    } catch (err) {
      console.error(err)
    }
  })
  global.title = radarDocument.meta.title
  global.legend = radarDocument.meta.legend
}
