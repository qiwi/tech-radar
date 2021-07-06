// import findCacheDir from 'find-cache-dir'
import crypto from 'crypto'
import { ensureDirSync } from 'fs-extra'
import path from 'path'

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
