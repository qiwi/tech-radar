import fse from 'fs-extra'
import path from 'node:path'

/**
 * generate path to .md file
 * @param {string} name
 * @param {string} quadrant
 * @param {string} temp - temp directory
 * @returns {string}
 */
export const genMdPath = ({ name, quadrant, temp }) =>
  path.join(temp, 'entries', quadrant, name + '.md')

const QUADRANT_INDEX = { q1: 0, q2: 1, q3: 2, q4: 3 }

/**
 * generate content .md file
 * @param ring
 * @param description
 * @param moved - optional parameter
 * @param quadrant - quadrant id (q1..q4)
 * @returns {string}
 */
export const genMdContent = ({ ring, description, moved, quadrant }) =>
  `---
layout: entries.njk
tags: entries
ring: ${ring}
moved: ${moved}${quadrant in QUADRANT_INDEX ? `\nquadrant: ${QUADRANT_INDEX[quadrant]}` : ''}
---
${description}`

/**
 * generate assets .md files from radarDocument to temp directory
 * @param document - radarDocument
 * @param temp - temp directory
 */
export const genMdAssets = async ({ document, temp }) => {
  await Promise.all(
    document.data.map(async ({ name, quadrant, ring, description, moved }) => {
      const entryPath = genMdPath({ name, quadrant, temp })
      const content = genMdContent({ ring, description, moved, quadrant })

      try {
        return await fse.outputFile(entryPath, content)
      } catch (err) {
        console.error('genMdAssets', entryPath, err)
      }
    }),
  )
}
