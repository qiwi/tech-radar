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

/**
 * generate content .md file
 * @param ring
 * @param description
 * @param moved - optional parameter
 * @returns {string}
 */
export const genMdContent = ({ ring, description, moved }) =>
  `---
ring: ${ring}
moved: ${moved}
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
      const content = genMdContent({ ring, description, moved })

      try {
        return await fse.outputFile(entryPath, content)
      } catch (err) {
        console.error('genMdAssets', entryPath, err)
      }
    }),
  )
}
