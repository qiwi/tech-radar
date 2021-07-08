// import findCacheDir from 'find-cache-dir'
import crypto from 'crypto'
import fs from 'fs'
import { ensureDirSync } from 'fs-extra'
import path from 'path'

import { settings } from './constants.js'

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
  const lowQuadrant = quadrant.toLowerCase()
  return doc.quadrantAliases[lowQuadrant] || lowQuadrant
}

export const writeSettings = (doc, output) => {
  const quadrants = []

  quadrants.push({ name: doc.quadrantTitles.q1 || 'Q1', id: 'q1' })
  quadrants.push({ name: doc.quadrantTitles.q2 || 'Q2', id: 'q2' })
  quadrants.push({ name: doc.quadrantTitles.q3 || 'Q3', id: 'q3' })
  quadrants.push({ name: doc.quadrantTitles.q4 || 'Q4', id: 'q4' })

  const settins = {}
  Object.assign(settins, settings)
  settins.quadrants = quadrants
  const settingsPath = path.join(output, '_data/settins.json')
  fs.writeFileSync(settingsPath, JSON.stringify(settins))
}

export const trim = (elem) => {
  return typeof elem === 'string' ? elem.trim() : elem
}
