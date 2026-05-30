import fse from 'fs-extra'
import { nanoid } from 'nanoid'
import path from 'node:path'
import tempRoot from 'temp-dir'

export const mkdirp = async (dir) => {
  await fse.mkdir(dir, { recursive: true })
  return dir
}

// Strip the longest common character prefix shared by every path, then
// sort. Callers map the result through path.dirname to derive each file's
// scope. A single file collapses to '' (→ scope '.').
export const getDirs = (files) => {
  if (files.length === 0) return []
  const ref = files[0]
  let prefix = ref.length
  for (const f of files) {
    let i = 0
    while (i < prefix && f[i] === ref[i]) i++
    prefix = i
  }
  return files.map((f) => f.slice(prefix)).toSorted()
}

export const tempDir = async (base) =>
  base
    ? mkdirp(path.join(await base, nanoid(5)))
    : path.join(tempRoot, `tech-radar-${nanoid(5)}`)

export const asArray = (v) => (Array.isArray(v) ? v : [v])
