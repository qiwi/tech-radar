import {
  BASE_HUE,
  CENTER,
  LEGACY_4_HUES,
  MAX_RADIUS,
  QUADRANT_INDEX,
  QUADRANTS,
  RING_INDEX,
  RINGS,
  SIZE,
  arcPath,
  buildRings,
  buildSectors,
  hashSeed,
  layoutRadar,
  placeEntries,
  polar,
  sectorPath,
} from '../../../src/renderer/aurora/geometry.js'

describe('aurora/geometry', () => {
  describe('constants', () => {
    it('CENTER is half of SIZE, MAX_RADIUS fits with margin', () => {
      expect(CENTER).toBe(SIZE / 2)
      expect(MAX_RADIUS).toBeLessThan(CENTER)
    })
    it('legacy 4×4 defaults: 4 quadrants and 4 rings', () => {
      expect(QUADRANTS).toHaveLength(4)
      expect(RINGS).toHaveLength(4)
    })
    it('builds correct index maps for the legacy default', () => {
      expect(QUADRANT_INDEX).toEqual({ q1: 0, q2: 1, q3: 2, q4: 3 })
      expect(RING_INDEX).toEqual({ adopt: 0, trial: 1, assess: 2, hold: 3 })
    })
    it('ring outer radii grow monotonically', () => {
      for (let i = 1; i < RINGS.length; i++) {
        expect(RINGS[i].outer).toBeGreaterThan(RINGS[i - 1].outer)
      }
    })
  })

  describe('buildRings / buildSectors', () => {
    it('buildRings spaces M rings evenly across MAX_RADIUS', () => {
      const rings = buildRings([
        { id: 'r1', title: 'Use' },
        { id: 'r2', title: 'Try' },
        { id: 'r3', title: 'Stop' },
      ])
      expect(rings).toHaveLength(3)
      expect(rings[rings.length - 1].outer).toBe(MAX_RADIUS)
      // Roughly equal step
      const step = MAX_RADIUS / 3
      rings.forEach((r, i) => {
        expect(Math.abs(r.outer - (i + 1) * step)).toBeLessThanOrEqual(1)
      })
    })
    it('buildSectors gives N sectors equal angular slices', () => {
      const sectors = buildSectors([
        { id: 's1', title: 'A' },
        { id: 's2', title: 'B' },
        { id: 's3', title: 'C' },
        { id: 's4', title: 'D' },
        { id: 's5', title: 'E' },
      ])
      expect(sectors).toHaveLength(5)
      const sweep = (2 * Math.PI) / 5
      sectors.forEach((s, i) => {
        expect(s.start).toBeCloseTo(i * sweep)
        expect(s.end).toBeCloseTo((i + 1) * sweep)
      })
    })
    it('buildSectors rotates hues evenly from BASE_HUE for N ≠ 4 (rainbow)', () => {
      const sectors = buildSectors([
        { id: 's1', title: 'A' },
        { id: 's2', title: 'B' },
        { id: 's3', title: 'C' },
      ])
      expect(sectors[0].accent).toBe(BASE_HUE)
      const step = 360 / sectors.length
      sectors.forEach((s, i) => {
        expect(s.accent).toBe((BASE_HUE + i * step) % 360)
      })
    })
    it('buildSectors keeps the historical 4-sector palette for N === 4', () => {
      const sectors = buildSectors([
        { id: 's1', title: 'A' },
        { id: 's2', title: 'B' },
        { id: 's3', title: 'C' },
        { id: 's4', title: 'D' },
      ])
      sectors.forEach((s, i) => {
        expect(s.accent).toBe(LEGACY_4_HUES[i])
      })
    })
    it('preserves an explicit `accent` hue if provided on the input', () => {
      const sectors = buildSectors([
        { id: 's1', title: 'A', accent: 42 },
        { id: 's2', title: 'B' },
        { id: 's3', title: 'C' },
      ])
      expect(sectors[0].accent).toBe(42)
      expect(sectors[1].accent).toBe(BASE_HUE + 360 / 3)
    })
    it('returns empty arrays for empty inputs', () => {
      expect(buildRings([])).toEqual([])
      expect(buildSectors([])).toEqual([])
    })
  })

  describe('polar', () => {
    it('returns CENTER at radius 0 regardless of angle', () => {
      expect(polar(0, 0)).toEqual({ x: CENTER, y: CENTER })
      expect(polar(Math.PI / 2, 0)).toEqual({ x: CENTER, y: CENTER })
    })
    it('angle 0 → +x axis', () => {
      const p = polar(0, 100)
      expect(p.x).toBeCloseTo(CENTER + 100)
      expect(p.y).toBeCloseTo(CENTER)
    })
    it('angle π/2 → +y axis (SVG y goes down)', () => {
      const p = polar(Math.PI / 2, 100)
      expect(p.x).toBeCloseTo(CENTER)
      expect(p.y).toBeCloseTo(CENTER + 100)
    })
  })

  describe('sectorPath', () => {
    it('returns an SVG path starting with M for every quadrant/ring (legacy default)', () => {
      for (let q = 0; q < 4; q++) {
        for (let r = 0; r < 4; r++) {
          expect(sectorPath(q, r)).toMatch(/^M /)
        }
      }
    })
    it('innermost ring (adopt) starts the path at the centre', () => {
      const p = sectorPath(0, 0)
      expect(p).toContain(`M ${CENTER} ${CENTER}`)
    })
    it('non-innermost rings do NOT include "M CENTER CENTER L"', () => {
      const p = sectorPath(0, 2)
      expect(p).not.toContain(`M ${CENTER} ${CENTER} L`)
    })
    it('accepts custom geometry via the {sectors,rings} context', () => {
      const sectors = buildSectors([
        { id: 's1', title: 'A' },
        { id: 's2', title: 'B' },
        { id: 's3', title: 'C' },
      ])
      const rings = buildRings([{ id: 'r1', title: 'Use' }, { id: 'r2', title: 'Stop' }])
      const p = sectorPath(1, 0, { sectors, rings })
      expect(p).toMatch(/^M /)
      expect(p).toContain(`M ${CENTER} ${CENTER}`)
    })
  })

  describe('arcPath', () => {
    it('has shape M x y A r r 0 large sweep x1 y1', () => {
      const p = arcPath(0, Math.PI / 4, 100)
      expect(p).toMatch(/^M [\d.]+ [\d.]+ A 100 100 0 \d \d [\d.]+ [\d.]+$/)
    })
    it('sweep flag flips when endAngle < startAngle', () => {
      const forward = arcPath(0, 1, 100)
      const backward = arcPath(1, 0, 100)
      const sweepF = forward.match(/A \d+ \d+ 0 (\d) (\d)/)[2]
      const sweepB = backward.match(/A \d+ \d+ 0 (\d) (\d)/)[2]
      expect(sweepF).not.toBe(sweepB)
    })
  })

  describe('hashSeed', () => {
    it('is deterministic for the same input', () => {
      expect(hashSeed('TypeScript')).toBe(hashSeed('TypeScript'))
    })
    it('differs across different inputs', () => {
      expect(hashSeed('a')).not.toBe(hashSeed('b'))
    })
    it('returns an unsigned 32-bit int', () => {
      const h = hashSeed('Hello')
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThan(2 ** 32)
      expect(Number.isInteger(h)).toBe(true)
    })
  })

  describe('placeEntries (legacy 4×4 defaults)', () => {
    it('is deterministic across runs', () => {
      const entries = [
        { name: 'A', sector: 'q1', ring: 'adopt' },
        { name: 'B', sector: 'q1', ring: 'adopt' },
      ]
      const a = []
      placeEntries(entries, 0, 0, a)
      const b = []
      placeEntries(entries, 0, 0, b)
      expect(a).toEqual(b)
    })
    it('places blips inside the adopt-ring annulus', () => {
      const entries = [{ name: 'X', sector: 'q1', ring: 'adopt' }]
      const placed = []
      placeEntries(entries, 0, 0, placed)
      const p = placed[0]
      const dist = Math.hypot(p.x - CENTER, p.y - CENTER)
      expect(dist).toBeGreaterThanOrEqual(22 - 1)
      expect(dist).toBeLessThanOrEqual(RINGS[0].outer - 14 + 1)
    })
    it('places blips inside the angular wedge of their sector', () => {
      const entries = [{ name: 'Z', sector: 'q1', ring: 'trial' }]
      const placed = []
      placeEntries(entries, 0, 1, placed)
      const p = placed[0]
      const angle = Math.atan2(p.y - CENTER, p.x - CENTER)
      expect(angle).toBeGreaterThanOrEqual(0.06 - 1e-9)
      expect(angle).toBeLessThanOrEqual(Math.PI / 2 - 0.06 + 1e-9)
    })
  })

  describe('layoutRadar — legacy 4×4 (quadrant + adopt/trial/assess/hold)', () => {
    // Mirrors a post-normalize doc with the legacy view present.
    const fixture = () => ({
      document: {
        data: [
          { name: 'TypeScript', quadrant: 'q1', sector: 's1', ring: 'adopt' },
          { name: 'Kotlin', quadrant: 'q1', sector: 's1', ring: 'trial' },
          { name: 'Scala', quadrant: 'q1', sector: 's1', ring: 'hold' },
          { name: 'Rust', quadrant: 'q4', sector: 's4', ring: 'assess' },
        ],
        sectors: [
          { id: 's1', title: 'Languages' },
          { id: 's2', title: 'Platforms' },
          { id: 's3', title: 'Tools' },
          { id: 's4', title: 'Techniques' },
        ],
        rings: [
          { id: 'adopt', title: 'Adopt' },
          { id: 'trial', title: 'Trial' },
          { id: 'assess', title: 'Assess' },
          { id: 'hold', title: 'Hold' },
        ],
      },
    })

    it('numbers entries 1..N', () => {
      const { entries } = layoutRadar(fixture())
      expect(entries).toHaveLength(4)
      expect(entries.map((p) => p.num).toSorted((a, b) => a - b)).toEqual([1, 2, 3, 4])
    })
    it('returns the resolved sectors and rings alongside entries', () => {
      const { sectors, rings } = layoutRadar(fixture())
      expect(sectors).toHaveLength(4)
      expect(rings).toHaveLength(4)
      expect(rings[0].id).toBe('adopt')
    })
    it('drops entries with unknown sector or ring', () => {
      const { entries } = layoutRadar({
        document: {
          data: [
            { name: 'A', sector: 's1', ring: 'adopt' },
            { name: 'B', sector: 's9', ring: 'adopt' }, // bad sector
            { name: 'C', sector: 's1', ring: 'unknown' }, // bad ring
          ],
          sectors: [
            { id: 's1', title: 'X' },
            { id: 's2', title: 'Y' },
            { id: 's3', title: 'Z' },
            { id: 's4', title: 'W' },
          ],
          rings: [
            { id: 'adopt', title: 'Adopt' },
            { id: 'trial', title: 'Trial' },
            { id: 'assess', title: 'Assess' },
            { id: 'hold', title: 'Hold' },
          ],
        },
      })
      expect(entries).toHaveLength(1)
      expect(entries[0].name).toBe('A')
    })
    it('is fully deterministic (stable across regen)', () => {
      const a = layoutRadar(fixture()).entries.map(({ x, y, num }) => ({ x, y, num }))
      const b = layoutRadar(fixture()).entries.map(({ x, y, num }) => ({ x, y, num }))
      expect(a).toEqual(b)
    })
  })

  describe('layoutRadar — Flex 6×3', () => {
    const fixture = () => ({
      document: {
        sectors: Array.from({ length: 6 }, (_, i) => ({
          id: `s${i + 1}`,
          title: `Sector ${i + 1}`,
        })),
        rings: [
          { id: 'r1', title: 'Use' },
          { id: 'r2', title: 'Try' },
          { id: 'r3', title: 'Stop' },
        ],
        data: [
          { name: 'A', sector: 's1', ring: 'r1' },
          { name: 'B', sector: 's3', ring: 'r2' },
          { name: 'C', sector: 's6', ring: 'r3' },
        ],
      },
    })

    it('places all entries with sequential numbers', () => {
      const { entries, sectors, rings } = layoutRadar(fixture())
      expect(entries).toHaveLength(3)
      expect(sectors).toHaveLength(6)
      expect(rings).toHaveLength(3)
      expect(entries.map((p) => p.num)).toEqual([1, 2, 3])
    })
  })
})

describe('fitRingOuters', () => {
  it('expands rings whose densest cell has more entries', async () => {
    const { fitRingOuters, MAX_RADIUS } = await import('../../../src/renderer/aurora/geometry.js')
    const rings = [
      { id: 'r1', title: 'A' },
      { id: 'r2', title: 'B' },
      { id: 'r3', title: 'C' },
    ]
    const data = [
      // r1 in s1 has 10 entries — densest
      ...Array.from({ length: 10 }, (_, i) => ({ name: `x${i}`, sector: 's1', ring: 'r1' })),
      // r2 in s2 has 2 entries
      { name: 'y1', sector: 's2', ring: 'r2' },
      { name: 'y2', sector: 's2', ring: 'r2' },
      // r3 has none
    ]
    const fitted = fitRingOuters(rings, 2, data)
    expect(fitted).toHaveLength(3)
    expect(fitted[fitted.length - 1].outer).toBe(MAX_RADIUS)
    // r1's annulus width (0 → fitted[0].outer) should be bigger than r2's.
    const r1w = fitted[0].outer
    const r2w = fitted[1].outer - fitted[0].outer
    expect(r1w).toBeGreaterThan(r2w)
  })

  it('falls back to equal spread when all cells have the same density', async () => {
    const { fitRingOuters, MAX_RADIUS } = await import('../../../src/renderer/aurora/geometry.js')
    const rings = [
      { id: 'r1', title: 'A' },
      { id: 'r2', title: 'B' },
    ]
    const data = [
      { name: 'x', sector: 's1', ring: 'r1' },
      { name: 'y', sector: 's1', ring: 'r2' },
    ]
    const fitted = fitRingOuters(rings, 1, data)
    expect(fitted[fitted.length - 1].outer).toBe(MAX_RADIUS)
    // Both rings have demand 1 → equal widths.
    const r1w = fitted[0].outer
    const r2w = fitted[1].outer - fitted[0].outer
    expect(Math.abs(r1w - r2w)).toBeLessThanOrEqual(1)
  })

  it('returns the empty list for no rings', async () => {
    const { fitRingOuters } = await import('../../../src/renderer/aurora/geometry.js')
    expect(fitRingOuters([], 4, [])).toEqual([])
  })
})
