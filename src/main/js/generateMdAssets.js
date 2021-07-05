import fsExtra from 'fs-extra'
import path from 'path'

import { quadrantAliases, tplDir } from './constants.js'

/**
 * generate path to .md file
 * @param name
 * @param quadrant
 * @param temp - temp directory
 * @returns {string}
 */
export function genMdPath({ name, quadrant, temp }) {
  const entryMdName = name + '.md'
  const quadrantAlias = quadrantAliases[quadrant.toLowerCase()]

  if (!quadrantAlias) {
    throw new Error(
      `Parsing error: invalid quadrant - "${quadrant}" name - "${name}"`,
    )
  }

  return path.join(temp, '/entries', quadrantAlias, entryMdName)
}

/**
 * generate content .md file
 * @param ring
 * @param description
 * @param moved - optional parameter
 * @returns {string}
 */
export function genMdContent({ ring, description, moved }) {
  return `---
ring: ${ring.toLowerCase()}
moved: ${moved || 0}
---
${description}`
}

/**
 * generate assets .md files from radarDocument to temp directory
 * @param doc - radarDocument
 * @param temp - temp directory
 */
export const genMdAssets = (doc, temp) => {
  fsExtra.copySync(tplDir, temp)

  doc.data.forEach(({ name, quadrant, ring, description, moved }) => {
    try {
      const entryPath = genMdPath({ name, quadrant, temp })
      const content = genMdContent({ ring, description, moved })
      fsExtra.writeFileSync(entryPath, content)
    } catch (err) {
      console.error(err)
    }
  })
}
