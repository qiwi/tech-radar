import fse from 'fs-extra'
import { nanoid } from 'nanoid'
import path from 'path'
import tempy from 'tempy'

export const mkdirp = async (dir) =>
  (await fse.mkdir(dir, { recursive: true })) && dir

export const getDirs = (files) =>
  files.map((f) =>
    f.slice(
      [...files[0]].findIndex((c, i) => files.some((f) => f.charAt(i) !== c)),
    ),
  )

export const tempDir = async (base) =>
  base
    ? mkdirp(path.join(await base, nanoid(5)))
    : path.join(tempy.root, `tech-radar-${nanoid(5)}`)
