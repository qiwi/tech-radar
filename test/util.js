import path from 'node:path'

import { asArray, getDirs } from '../src/util.js'

describe('util/getDirs', () => {
  it('returns [] for no files', () => {
    expect(getDirs([])).toEqual([])
  })
  it('collapses a single file to "" (→ scope ".")', () => {
    const dirs = getDirs(['/data/backend/2021.csv'])
    expect(dirs).toEqual([''])
    expect(dirs.map((d) => path.dirname(d))).toEqual(['.'])
  })
  it('strips the common prefix across scopes', () => {
    const dirs = getDirs(['/data/backend/2021.csv', '/data/ios/2022.csv'])
    expect(dirs.map((d) => path.dirname(d))).toEqual(['backend', 'ios'])
  })
  it('treats a single-scope, multi-date set as root scope ".".', () => {
    const dirs = getDirs(['/data/backend/2021.csv', '/data/backend/2022.csv'])
    expect(dirs.map((d) => path.dirname(d))).toEqual(['.', '.'])
  })
  it('does not mutate the input array', () => {
    const input = ['/d/b/y.csv', '/d/a/x.csv']
    const copy = [...input]
    getDirs(input)
    expect(input).toEqual(copy)
  })
})

describe('util/asArray', () => {
  it('wraps a scalar', () => {
    expect(asArray('x')).toEqual(['x'])
  })
  it('passes an array through', () => {
    expect(asArray(['x', 'y'])).toEqual(['x', 'y'])
  })
})
