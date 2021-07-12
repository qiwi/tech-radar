import fs from 'fs'
import fsExtra from 'fs-extra'
import { cloneDeep } from 'lodash-es'
import path from 'path'

import { tplDir } from './constants.js'
import { getQuadrant } from './util.js'

/**
 * generate path to .md file
 * @param {string} name
 * @param {string} quadrant
 * @param {string} temp - temp directory
 * @returns {string}
 */
export function genMdPath({ name, quadrant, temp }) {
  const entryMdName = name + '.md'
  return path.join(temp, '/entries', quadrant, entryMdName)
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
      const quadrantAlias = getQuadrant(quadrant, doc)
      const entryPath = genMdPath({ name, quadrant: quadrantAlias, temp })
      const content = genMdContent({ ring, description, moved })

      fs.writeFileSync(entryPath, content)
    } catch (err) {
      console.error('genMdAssets', err)
    }
  })
}

export const genParamMove = (dir, doc, intermediateValue) => {
  const rings = {
    hold: 0,
    assess: 1,
    trial: 2,
    adopt: 3,
  }
  const clone = cloneDeep(intermediateValue)
  console.log(dir, clone)
  if (dir === clone.dir) {
    const data = doc.data.map((item) => {
      const name = item.name.toLowerCase()
      const previousRing = item.ring.toLowerCase()
      console.log(clone.data[name], previousRing)
      if (clone.data[name] !== previousRing) {
        item.moved = +rings[clone.data[name]] > +rings[previousRing] ? -1 : 1
        console.log(item.moved, rings[clone.data[name]], rings[previousRing])
        clone.data[name] = previousRing
      }
      return item
    })
    return { data, intermediate: clone }
  }
  clone.dir = dir
  clone.data = {}
  doc.data.forEach((item) => {
    clone.data[item.name.toLowerCase()] = item.ring.toLowerCase()
  })
  return { data: doc.data, intermediate: clone }
}
