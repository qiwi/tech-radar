import fse from 'fs-extra'

export const mkdirp = async (dir) =>
  (await fse.mkdir(dir, { recursive: true })) && dir

export const getDirs = (files) =>
  files.map((f) =>
    f.slice(
      [...files[0]].findIndex((c, i) => files.some((f) => f.charAt(i) !== c)),
    ),
  )
