import fse from 'fs-extra'
import { nanoid } from 'nanoid'
import path from 'node:path'
import tempRoot from 'temp-dir'

export const mkdirp = async (dir) =>
  (await fse.mkdir(dir, { recursive: true })) && dir

export const getDirs = (files) =>
  files.map((f) =>
    f.slice(
      [...files[0]].findIndex((c, i) => files.some((f) => f.charAt(i) !== c)),
    ),
  ).sort()

export const tempDir = async (base) =>
  base
    ? mkdirp(path.join(await base, nanoid(5)))
    : path.join(tempRoot, `tech-radar-${nanoid(5)}`)

export const asArray = (v) => (Array.isArray(v) ? v : [v])
