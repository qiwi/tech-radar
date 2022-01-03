import fse from 'fs-extra'

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

export const mkdirp = async (dir) =>
  (await fse.mkdir(dir, { recursive: true })) && dir

export const getDirs = (files) =>
  files.map((f) =>
    f.slice(
      [...files[0]].findIndex((c, i) => files.some((f) => f.charAt(i) !== c)),
    ),
  )
