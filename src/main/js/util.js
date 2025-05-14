import { nanoid } from 'nanoid'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

export function mkdirp(dirpath) {
  !fs.existsSync(dirpath) && fs.mkdirSync(dirpath, { recursive: true, mode: 0o777 })
  return dirpath
}

export const getDirs = (files) =>
  files.map((f) =>
    f.slice(
      [...files[0]].findIndex((c, i) => files.some((f) => f.charAt(i) !== c)),
    ),
  ).sort()

export const tempDir = async (base) =>
  base
    ? mkdirp(path.join(await base, nanoid(5)))
    : mkdirp(path.join(os.tmpdir(), 'tech-radar', nanoid(5)))

export const asArray = (v) => (Array.isArray(v) ? v : [v])
