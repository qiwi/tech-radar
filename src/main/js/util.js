// import findCacheDir from 'find-cache-dir'
import crypto from 'crypto'
import fs from 'fs'
import { ensureDirSync } from 'fs-extra'
import path from 'path'

import { defQuadrantAlias, settings } from './constants.js'

export const reverse = (arr) => {
  const _arr = [...arr]
  _arr.reverse()

  return _arr
}

export const makeUniq = (arr) => {
  const counters = {}
  const getCount = (k) => (counters[k] = (counters[k] || 0) + 1)

  return arr.map((k) => {
    const count = getCount(k)

    return count === 1 ? k : `${k}-${count}`
  })
}

export const ensureDir = (dir) => {
  ensureDirSync(dir)

  return dir
}
/**
 *  return unique name temp directory
 * @param cwd
 * @param temp
 * @returns {string}
 */
export const getTemp = (cwd, temp) => {
  if (temp) {
    return ensureDir(path.resolve(temp))
  }

  const id = crypto.randomBytes(16).toString('hex')
  // const cacheDir = findCacheDir({ name: '@qiwi__tech-radar', cwd }) + ''
  // const tempDir = path.join(cacheDir, id)
  const tempDir = id
  return ensureDir(tempDir)
}
export const getQuadrant = (quadrant, doc) => {
  if (!('quadrantAliases' in doc))
    return defQuadrantAlias[quadrant.toLowerCase()]
  if (Object.values(doc.quadrantAliases).includes(quadrant))
    return Object.keys(doc.quadrantAliases)[
      Object.values(doc.quadrantAliases).indexOf(quadrant)
    ]
  return doc.quadrantAliases[quadrant.toLowerCase()]
    ? doc.quadrantAliases[quadrant.toLowerCase()]
    : quadrant.toLowerCase()
}

export const writeSettings = (doc, output, isTitle) => {
  const quadrants = []
  if (isTitle) {
    quadrants.push({ name: doc.quadrantTitle.q1, id: 'q1' })
    quadrants.push({ name: doc.quadrantTitle.q2, id: 'q2' })
    quadrants.push({ name: doc.quadrantTitle.q3, id: 'q3' })
    quadrants.push({ name: doc.quadrantTitle.q4, id: 'q4' })
  } else {
    quadrants.push({ name: 'Languages and frameworks', id: 'q1' })
    quadrants.push({ name: 'Platforms', id: 'q2' })
    quadrants.push({ name: 'Techniques', id: 'q3' })
    quadrants.push({ name: 'Tools', id: 'q4' })
  }

  const settins = {}
  Object.assign(settins, settings)
  settins.quadrants = quadrants
  const settingsPath = path.join(output, '_data/settins.json')
  fs.writeFileSync(settingsPath, JSON.stringify(settins))
}
