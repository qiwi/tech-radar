import {
  CENTER,
  QUADRANT_INDEX,
  QUADRANTS,
  RING_INDEX,
  RINGS,
  SIZE,
  arcPath,
  hashSeed,
  layoutRadar,
  placeEntries,
  polar,
  sectorPath,
} from '../../../src/renderer/aurora/geometry.js'

describe('aurora/geometry', () => {
  describe('constants', () => {
    it('CENTER is half of SIZE', () => {
      expect(CENTER).toBe(SIZE / 2)
    })
    it('has 4 quadrants and 4 rings', () => {
      expect(QUADRANTS).toHaveLength(4)
      expect(RINGS).toHaveLength(4)
    })
    it('builds correct index maps', () => {
      expect(QUADRANT_INDEX).toEqual({ q1: 0, q2: 1, q3: 2, q4: 3 })
      expect(RING_INDEX).toEqual({ adopt: 0, trial: 1, assess: 2, hold: 3 })
    })
    it('ring outer radii grow monotonically', () => {
      for (let i = 1; i < RINGS.length; i++) {
        expect(RINGS[i].outer).toBeGreaterThan(RINGS[i - 1].outer)
      }
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
    it('returns an SVG path starting with M for every quadrant/ring', () => {
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
    it('non-innermost rings do NOT include "M CENTER CENTER"', () => {
      const p = sectorPath(0, 2)
      expect(p).not.toContain(`M ${CENTER} ${CENTER} L`)
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
      // Sweep flag is the second of the two flags in "A r r 0 large sweep".
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

  describe('placeEntries', () => {
    it('is deterministic across runs', () => {
      const entries = [
        { name: 'A', quadrant: 'q1', ring: 'adopt' },
        { name: 'B', quadrant: 'q1', ring: 'adopt' },
      ]
      const a = []
      placeEntries(entries, 0, 0, a)
      const b = []
      placeEntries(entries, 0, 0, b)
      expect(a).toEqual(b)
    })
    it('places blips inside the adopt-ring annulus', () => {
      const entries = [{ name: 'X', quadrant: 'q1', ring: 'adopt' }]
      const placed = []
      placeEntries(entries, 0, 0, placed)
      const p = placed[0]
      const dist = Math.hypot(p.x - CENTER, p.y - CENTER)
      // adopt placement bounds: innerBound=22, outerBound = RINGS[0].outer - 14
      expect(dist).toBeGreaterThanOrEqual(22 - 1)
      expect(dist).toBeLessThanOrEqual(RINGS[0].outer - 14 + 1)
    })
    it('places blips inside the angular wedge of their quadrant', () => {
      // q1: 0..π/2. Place a blip there and verify its polar angle falls
      // inside [angularPad, π/2 - angularPad].
      const entries = [{ name: 'Z', quadrant: 'q1', ring: 'trial' }]
      const placed = []
      placeEntries(entries, 0, 1, placed)
      const p = placed[0]
      const angle = Math.atan2(p.y - CENTER, p.x - CENTER) // (-π, π]
      // q1 spans 0..π/2 with angularPad=0.06
      expect(angle).toBeGreaterThanOrEqual(0.06 - 1e-9)
      expect(angle).toBeLessThanOrEqual(Math.PI / 2 - 0.06 + 1e-9)
    })
  })

  describe('layoutRadar', () => {
    const fixture = () => ({
      document: {
        data: [
          { name: 'TypeScript', quadrant: 'q1', ring: 'adopt' },
          { name: 'Kotlin', quadrant: 'q1', ring: 'trial' },
          { name: 'Scala', quadrant: 'q1', ring: 'hold' },
          { name: 'Rust', quadrant: 'q4', ring: 'assess' },
        ],
      },
    })

    it('numbers entries 1..N', () => {
      const placed = layoutRadar(fixture())
      expect(placed).toHaveLength(4)
      expect(placed.map((p) => p.num).sort((a, b) => a - b)).toEqual([1, 2, 3, 4])
    })
    it('drops entries with unknown quadrant or ring', () => {
      const placed = layoutRadar({
        document: {
          data: [
            { name: 'A', quadrant: 'q1', ring: 'adopt' },
            { name: 'B', quadrant: 'q9', ring: 'adopt' }, // bad quadrant
            { name: 'C', quadrant: 'q1', ring: 'unknown' }, // bad ring
          ],
        },
      })
      expect(placed).toHaveLength(1)
      expect(placed[0].name).toBe('A')
    })
    it('is fully deterministic (stable across regen)', () => {
      const a = layoutRadar(fixture()).map(({ x, y, num }) => ({ x, y, num }))
      const b = layoutRadar(fixture()).map(({ x, y, num }) => ({ x, y, num }))
      expect(a).toEqual(b)
    })
  })
})
