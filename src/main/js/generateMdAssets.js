import fs from 'fs'
import fsExtra from 'fs-extra'
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

export const genParamMove = (file, doc, intermediate, date) => {
  const rings = {
    hold: 0,
    assess: 1,
    trial: 2,
    adopt: 3,
  }
  const validDate = new Date(date)
  if(isNaN(validDate.getDate())) {
    throw new Error(`${file} - invalid date`)
  }
  const a = intermediate.find((i) => {
    return i.dir === path.dirname(file)
  })
  if (a && a.date < validDate) {
    const data = doc.data.map((item) => {
      const name = item.name.toLowerCase()
      const previousRing = item.ring.toLowerCase()
      if (a.data[name] !== previousRing) {
        item.moved = +rings[a.data[name]] > +rings[previousRing] ? -1 : 1
        a.data[name] = previousRing
      }
      return item
    })
    return { ...doc, data }
  }
  const data = {}
  doc.data.forEach((item) => {
    data[item.name.toLowerCase()] = item.ring.toLowerCase()
  })
  if (!a) {
    intermediate.push({
      dir: path.dirname(file),
      data,
      date: validDate,
    })
  }
  return doc
}
