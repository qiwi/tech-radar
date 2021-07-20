import { uniq } from 'lodash-es'
import path from 'path'

import { read } from './reader.js'
import { getDirs } from './util.js'

/**
 * add param file to context
 * @param sources
 * @returns contexts
 */
export const init = (sources) => sources.map((s) => ({ file: s }))
/**
 * add param data to context
 * @param contexts
 * @returns contexts
 */
export const readFiles = (contexts) =>
  contexts.map((c) => ({
    ...c,
    data: read(c.file),
  }))
/**
 * add param base to context
 * @param contexts
 * @returns contexts
 */
export const resolveBases = (contexts) => {
  const dates = contexts.map(({ data }) => data.meta.date)
  if (contexts.length === 1)
    return [
      {
        ...contexts[0],
        date: contexts[0].data.meta.date,
        base: contexts[0].data.meta.date,
      },
    ]
  const filesWithNoExt = contexts.map(({ file }, i) =>
    path.join(file.slice(0, -path.basename(file).length), dates[i]),
  )

  if (uniq(filesWithNoExt).length !== filesWithNoExt.length) {
    throw new Error('same dates in one directory')
  }
  return getDirs(filesWithNoExt).map((base, i) => ({
    ...contexts[i],
    date: dates[i],
    base,
  }))
}
/**
 * sort contexts with path and date
 * @param contexts
 * @returns contexts
 */
export const sortContexts = (contexts) => {
  if (contexts.length === 1) return contexts
  return contexts.sort((a, b) => {
    if (path.dirname(a.file) > path.dirname(b.file)) return 1
    if (path.dirname(a.file) < path.dirname(b.file)) return -1
    if (a.date > b.date) return 1
    if (a.date < b.date) return -1
    return 0
  })
}
