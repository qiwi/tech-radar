import fsExtra from 'fs-extra'
import path from 'path'

import { quadrantAliases } from './constants.js'
import { read } from './reader.js'

const tplPath = path.resolve('src/main/tpl')

export function getQuadrant(quadrant) {
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
moved: ${moved || 0}
---
${description}`
}

export const generateMdAssets = (filePath, tempDir) => {
  const tempDirResolved = path.resolve(tempDir)
  fsExtra.copySync(tplPath, tempDirResolved)

  const radarDocument = read(filePath)
  radarDocument.data.forEach(({ name, quadrant, ring, description, moved }) => {
    try {
      const entryFilePath = generatePath({ name, quadrant, tempDirResolved })
      const content = generateMd({ ring, description, moved })
      fsExtra.writeFileSync(entryFilePath, content)
    } catch (err) {
      console.error(err)
    }
  })
  global.title = radarDocument.meta.title
}
