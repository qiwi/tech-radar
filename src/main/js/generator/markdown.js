import fse from 'fs-extra'
import path from 'path'

import { tplDir } from './constants.js'

/**
 * generate path to .md file
 * @param {string} name
 * @param {string} quadrant
 * @param {string} temp - temp directory
 * @returns {string}
 */
export function genMdPath({ name, quadrant, temp }) {
  const entryMdName = name + '.md'
  return path.join(temp, 'entries', quadrant, entryMdName)
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
ring: ${ring}
moved: ${moved}
---
${description}`
}

/**
 * generate assets .md files from radarDocument to temp directory
 * @param document - radarDocument
 * @param temp - temp directory
 */
export const genMdAssets = async ({ document, temp }) => {
  await fse.copy(tplDir, temp)

  await Promise.all(
    document.data.map(async ({ name, quadrant, ring, description, moved }) => {
      try {
        const entryPath = genMdPath({ name, quadrant, temp })
        const content = genMdContent({ ring, description, moved })
        return fse.writeFile(entryPath, content)
      } catch (err) {
        console.error('genMdAssets', err)
      }
    }),
  )
}
