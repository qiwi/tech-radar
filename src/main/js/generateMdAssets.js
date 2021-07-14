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

export const genParamMove = (contexts, intermediate, autoscope) => {
  if (!autoscope) return contexts
  return contexts.map((context) => {
    const { file, data, date } = context

    const validDate = new Date(date)
    if (isNaN(validDate.getDate())) {
      throw new Error(`${file} - invalid date`)
    }
    const findValue = intermediate.find((i) => {
      return i.dir === path.dirname(file)
    })
    if (findValue && findValue.date < validDate) {
      return { ...context, data: modifyData(data, findValue) }
    }
    const interData = {}
    data.data.forEach((item) => {
      interData[item.name.toLowerCase()] = item.ring.toLowerCase()
    })
    if (!findValue) {
      intermediate.push({
        dir: path.dirname(file),
        data: interData,
        date: validDate,
      })
    }
    return context
  })
}

export const modifyData = (data, findValue) => {
  const rings = {
    hold: 0,
    assess: 1,
    trial: 2,
    adopt: 3,
  }
  const modData = data.data.map((item) => {
    const name = item.name.toLowerCase()
    const previousRing = item.ring.toLowerCase()
    if (findValue.data[name] !== previousRing) {
      item.moved = +rings[findValue.data[name]] > +rings[previousRing] ? -1 : 1
      findValue.data[name] = previousRing
    }
    return item
  })
  return { ...data, data: modData }
}
