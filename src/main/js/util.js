// import findCacheDir from 'find-cache-dir'
import crypto from 'crypto'
import fs from 'fs'
import { ensureDirSync } from 'fs-extra'
import path from 'path'

import { settings as defaultSettings } from './constants.js'

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

export const getQuadrant = (quadrant, doc) => {
  const lowQuadrant = quadrant.toLowerCase()
  return doc.quadrantAliases[lowQuadrant] || lowQuadrant
}

export const writeSettings = ({data: doc, output, title, pathPrefix, temp, date}) => {
  const quadrants = []
  quadrants.push({ name: doc.quadrantTitles.q1 || 'Q1', id: 'q1' })
  quadrants.push({ name: doc.quadrantTitles.q2 || 'Q2', id: 'q2' })
  quadrants.push({ name: doc.quadrantTitles.q3 || 'Q3', id: 'q3' })
  quadrants.push({ name: doc.quadrantTitles.q4 || 'Q4', id: 'q4' })

  const extra = { output, title, pathPrefix, temp, date }
  const settins = {...defaultSettings, extra, quadrants}
  const settingsPath = path.join(temp, '_data/settins.json')
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

export const getDirs = (files) =>
  files.map(f => f.slice([...(files[0])].findIndex((c, i) => files.some(f => f.charAt(i) !== c))))

export const sortContextsByDate = (a, b) =>
  a.date > b.date ? -1 : a.date === b.date ? 0 : 1
