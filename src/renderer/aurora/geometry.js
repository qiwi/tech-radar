// Pure geometry — radius, quadrant angles, deterministic entry placement.
// Coordinate convention: SVG viewBox `0 0 SIZE SIZE`, centre at SIZE/2.
// SVG y is down, so quadrant labels in this file follow SVG positions:
//   q1 → bottom-right, q2 → bottom-left, q3 → top-left, q4 → top-right.

export const SIZE = 1100
export const CENTER = SIZE / 2

// Outer radius of each ring (concentric, adopt innermost).
// Total radar radius = 480, leaves 70px viewBox margin for labels & glow.
export const RINGS = [
  { id: 'adopt', outer: 180, label: 'ADOPT' },
  { id: 'trial', outer: 280, label: 'TRIAL' },
  { id: 'assess', outer: 380, label: 'ASSESS' },
  { id: 'hold', outer: 480, label: 'HOLD' },
]

// Quadrant angular ranges (radians, SVG convention).
// `accent` is a hue (0-360) used for sector fills, entries and ring labels.
export const QUADRANTS = [
  { id: 'q1', start: 0, end: Math.PI / 2, accent: 165 }, // bottom-right — teal
  { id: 'q2', start: Math.PI / 2, end: Math.PI, accent: 280 }, // bottom-left — violet
  { id: 'q3', start: Math.PI, end: (3 * Math.PI) / 2, accent: 38 }, // top-left — amber
  { id: 'q4', start: (3 * Math.PI) / 2, end: 2 * Math.PI, accent: 200 }, // top-right — sky
]

export const QUADRANT_INDEX = Object.fromEntries(
  QUADRANTS.map((q, i) => [q.id, i]),
)

export const RING_INDEX = Object.fromEntries(RINGS.map((r, i) => [r.id, i]))

/** Polar → cartesian, centred at CENTER. */
export const polar = (angle, radius) => ({
  x: CENTER + Math.cos(angle) * radius,
  y: CENTER + Math.sin(angle) * radius,
})

/** Annulus-segment SVG path (one quadrant × one ring). */
export const sectorPath = (qIdx, rIdx) => {
  const q = QUADRANTS[qIdx]
  const innerR = rIdx === 0 ? 0 : RINGS[rIdx - 1].outer
  const outerR = RINGS[rIdx].outer
  const p0 = polar(q.start, outerR)
  const p1 = polar(q.end, outerR)
  const p2 = polar(q.end, innerR)
  const p3 = polar(q.start, innerR)
  const sweep = q.end - q.start
  const largeArc = sweep > Math.PI ? 1 : 0
  if (innerR === 0) {
    return `M ${CENTER} ${CENTER} L ${p0.x} ${p0.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${p1.x} ${p1.y} Z`
  }
  return `M ${p0.x} ${p0.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${p3.x} ${p3.y} Z`
}

/** Arc-only path (for textPath alongside ring boundary or quadrant outer rim). */
export const arcPath = (angleStart, angleEnd, radius) => {
  const p0 = polar(angleStart, radius)
  const p1 = polar(angleEnd, radius)
  const largeArc = Math.abs(angleEnd - angleStart) > Math.PI ? 1 : 0
  const sweep = angleEnd > angleStart ? 1 : 0
  return `M ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${p1.x} ${p1.y}`
}

/** FNV-1a hash → 32-bit unsigned int. Used to seed the entry-placement PRNG. */
export const hashSeed = (s) => {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) >>> 0
    h = Math.imul(h, 16777619) >>> 0
  }
  return h
}

/** Mulberry32 — fast deterministic PRNG. */
const mulberry32 = (seed) => () => {
  seed = (seed + 0x6d2b79f5) >>> 0
  let t = seed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/**
 * Deterministic placement: same entries land in the same spots across renders,
 * which means timeline transitions only animate the ones that actually moved.
 * Up to 6 entries → single row; 7+ → two staggered rows.
 */
export const placeEntries = (entries, qIdx, rIdx) => {
  const q = QUADRANTS[qIdx]
  const innerBound = rIdx === 0 ? 22 : RINGS[rIdx - 1].outer + 14
  const outerBound = RINGS[rIdx].outer - 14
  const angularPad = 0.05
  const a0 = q.start + angularPad
  const a1 = q.end - angularPad

  const sorted = entries.toSorted((x, y) => x.name.localeCompare(y.name))
  const N = sorted.length
  const twoRows = N > 6
  const slots = twoRows ? Math.ceil(N / 2) : N

  return sorted.map((entry, i) => {
    const rand = mulberry32(hashSeed(entry.name))
    const slot = twoRows ? Math.floor(i / 2) : i
    const rowBias = twoRows ? (i % 2 === 0 ? 0.32 : 0.68) : 0.5
    const tAngular = (slot + 0.5) / Math.max(slots, 1)
    const angle = a0 + tAngular * (a1 - a0) + (rand() - 0.5) * 0.025
    const radius =
      innerBound + (outerBound - innerBound) * (rowBias + (rand() - 0.5) * 0.08)
    const { x, y } = polar(angle, radius)
    return { ...entry, x, y, angle, radius }
  })
}

/** Group radar entries by (quadrant, ring) and run placement for each cell.
 *  Numbering walks quadrant-major, ring-major (adopt → hold) for stable output. */
export const layoutRadar = (radar) => {
  const cells = new Map()
  for (const entry of radar.document.data) {
    const qIdx = QUADRANT_INDEX[entry.quadrant]
    const rIdx = RING_INDEX[entry.ring.toLowerCase()]
    if (qIdx === undefined || rIdx === undefined) continue
    const key = qIdx * 4 + rIdx
    if (!cells.has(key)) cells.set(key, [])
    cells.get(key).push({ ...entry, qIdx, rIdx })
  }
  const placed = []
  let counter = 1
  for (let qIdx = 0; qIdx < QUADRANTS.length; qIdx++) {
    for (let rIdx = 0; rIdx < RINGS.length; rIdx++) {
      const list = cells.get(qIdx * 4 + rIdx)
      if (!list) continue
      for (const entry of placeEntries(list, qIdx, rIdx)) {
        placed.push({ ...entry, num: counter++ })
      }
    }
  }
  return placed
}
