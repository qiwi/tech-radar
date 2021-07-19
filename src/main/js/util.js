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

export const normalizeCsv = (fileContent) =>
  fileContent
    .split(/("[^"]+")/g)
    .map((item) => {
      if (item[0] === '"') return item
      return item
        .split(',')
        .map((i) => i.replace(/^ *| *$/gm, ''))
        .join(',')
    })
    .join('')

export const getDirs = (sources) => {
  const _a = sources.map((item) => item.split(path.sep))
  while (true) {
    if (_a.length === 0 || _a.length === 1) return
    const checkArray = _a.every((item) => {
      return item[0] === _a[0][0]
    })
    if (checkArray) {
      _a.forEach((item) => {
        item.shift()
        return item
      })
    } else {
      return _a.map((item) => item.join('-'))
    }
  }
}

export const sortContextsByDate = (a, b) =>
  a.date > b.date ? -1 : a.date === b.date ? 0 : 1
