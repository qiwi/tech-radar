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
/**
 * generates the "moved" parameter depending on the "autoscope" flag and other files in this directory
 * @param contexts
 * @param intermediate - contains intermediate meanings of technology names and their rings
 * @param autoscope
 * @returns contexts
 */
export const genParamMove = (contexts, intermediate, autoscope) => {
  if (!autoscope) return contexts
  return contexts.map((context) => {
    const { file, data, date } = context

    const _date = new Date(date)
    if (isNaN(_date.getDate())) {
      throw new Error(`${file} - invalid date`)
    }
    const prevCtx = intermediate.find((i) => {
      return i.dir === path.dirname(file)
    })
    if (prevCtx && prevCtx.date < _date) {
      return { ...context, data: addMoved(data, prevCtx) }
    }

    if (!prevCtx) {
      intermediate.push({
        dir: path.dirname(file),
        data: data.data.reduce((r, item) => {
          return { ...r, [item.name.toLowerCase()]: item.ring.toLowerCase() }
        }),
        date: _date,
      })
    }
    return context
  })
}
/**
 * add param "moved" to radarDocument
 * @param doc - radarDocument
 * @param intermediate - contains intermediate meanings of technology names and their rings
 * @returns radarDocument - general input data format
 */
export const addMoved = (doc, intermediate) => {
  const rings = {
    hold: 0,
    assess: 1,
    trial: 2,
    adopt: 3,
  }
  const _data = doc.data.map((item) => {
    const name = item.name.toLowerCase()
    const prevRing = item.ring.toLowerCase()
    if (intermediate.data[name] !== prevRing) {
      item.moved = +rings[intermediate.data[name]] > +rings[prevRing] ? -1 : 1
      intermediate.data[name] = prevRing
    }
    return item
  })
  return { ...doc, data: _data }
}
