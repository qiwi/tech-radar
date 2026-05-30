import { genRadarSettings } from '../../../src/renderer/zalando/index.js'

describe('zalando/genRadarSettings', () => {
  const base = {
    title: 'Backend',
    basePrefix: 'tech-radar',
    date: '2021-07-16',
    scope: 'backend',
    document: { quadrantTitles: { q1: 'A', q2: 'B', q3: 'C', q4: 'D' } },
    renderSettings: {},
  }

  it('builds the asset-depth target with POSIX separators (win32-safe)', () => {
    const { extra } = genRadarSettings(base)
    // config.cjs counts depth via target.split('/'); a backslash from
    // path.join on win32 would mis-count and break ../ asset prefixes.
    expect(extra.target).toBe('backend/2021-07-16')
    expect(extra.target).not.toContain('\\')
  })

  it('handles the root scope "." without leaking it into the target', () => {
    const { extra } = genRadarSettings({ ...base, scope: '.' })
    expect(extra.target).toBe('2021-07-16')
  })

  it('maps quadrantTitles into {name,id} pairs', () => {
    const { quadrants } = genRadarSettings(base)
    expect(quadrants).toEqual([
      { id: 'q1', name: 'A' },
      { id: 'q2', name: 'B' },
      { id: 'q3', name: 'C' },
      { id: 'q4', name: 'D' },
    ])
  })
})
