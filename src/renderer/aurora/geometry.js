// Pure geometry — radius, sector angles, deterministic entry placement.
// Coordinate convention: SVG viewBox `0 0 SIZE SIZE`, centre at SIZE/2.
// SVG y is down, so sectors are laid out CLOCKWISE starting from the
// +x axis (angle 0 → bottom-right corner of the radar).

export const SIZE = 1100
export const CENTER = SIZE / 2
/** Max radar radius. Leaves a ~50 px viewBox margin for corner labels. */
export const MAX_RADIUS = 500

/**
 * Historical hand-tuned hues for the 4-sector layout. Preserved verbatim
 * so existing legacy radars keep their teal/violet/amber/sky look (q4 is
 * the recognizable sky-blue the radar has shipped with since v1).
 */
export const LEGACY_4_HUES = [165, 280, 38, 200]

/**
 * Starting hue used by the even-rotation rainbow distribution for any
 * sector count ≠ 4. Sky-blue 200° leads so the brightest, friendliest
 * colour anchors the first slot. Adjacent sectors step by 360/N giving
 * a smooth chromatic sweep around the radar instead of curated jumps.
 */
export const BASE_HUE = 200

/**
 * Build the full geometry of M rings — outer radius + label per ring.
 * Equal-width rings by default (`outer` divided into M slices). If an
 * input ring already carries `outer` (e.g. via `fitRingOuters`), the
 * value is preserved so callers can override the layout.
 */
export const buildRings = (rings) => {
  if (!rings || !rings.length) return []
  const step = MAX_RADIUS / rings.length
  return rings.map((r, i) => ({
    ...r,
    outer: r.outer ?? Math.round((i + 1) * step),
    label: String(r.title || r.id).toUpperCase(),
  }))
}

/**
 * Density-aware outer-radius assignment. For each ring, count the
 * MAXIMUM (sector, ring) cell density across all sectors; that becomes
 * the ring's "weight". Widths = `1 + α × maxCount`, normalised so the
 * cumulative outer of the last ring equals MAX_RADIUS. Empty rings
 * still get a baseline slice. The result is a new array of rings each
 * carrying an `outer` value — feed into `buildRings`.
 *
 * @param rings        Array<{id,title,...}> ordered inner → outer.
 * @param sectorCount  Number of sectors (only used for stable hashing
 *                     when counting; the formula is sector-agnostic).
 * @param data         Entry list — items have `sector` and `ring` ids.
 */
export const fitRingOuters = (rings, sectorCount, data) => {
  if (!rings || !rings.length) return []
  // Density coefficient — α=0 collapses to equal widths, α=1 makes the
  // densest ring N×wider than an empty one. 0.4 is a compromise that
  // gives crowded rings noticeable but not extreme growth.
  const ALPHA = 0.4
  const countsPerRing = rings.map(() => new Map())
  for (const e of data || []) {
    const rIdx = rings.findIndex((r) => r.id === e.ring)
    if (rIdx === -1) continue
    const m = countsPerRing[rIdx]
    m.set(e.sector, (m.get(e.sector) || 0) + 1)
  }
  const maxPerRing = countsPerRing.map((m) => {
    let max = 0
    for (const v of m.values()) if (v > max) max = v
    return max
  })
  const weights = maxPerRing.map((c) => 1 + ALPHA * c)
  const sum = weights.reduce((a, b) => a + b, 0)
  const scale = MAX_RADIUS / sum
  let acc = 0
  return rings.map((r, i) => {
    acc += weights[i] * scale
    return { ...r, outer: Math.round(acc) }
  })
}

/**
 * Build the full geometry of N sectors — start/end angles + accent hue.
 * Sectors share an equal angular sweep `2π/N`. Hue assignment:
 *   - N === 4 → historical LEGACY_4_HUES (teal/violet/amber/sky)
 *   - any other N → rainbow: BASE_HUE + i × 360/N, so adjacent sectors
 *     sit adjacent on the colour wheel and the whole rim reads as a
 *     smooth chromatic sweep.
 * Sectors that already carry an explicit `accent` keep it untouched.
 */
export const buildSectors = (sectors) => {
  if (!sectors || !sectors.length) return []
  const n = sectors.length
  const sweep = (2 * Math.PI) / n
  const hueStep = 360 / n
  const hueFor = n === 4
    ? (i) => LEGACY_4_HUES[i]
    : (i) => (BASE_HUE + i * hueStep + 360) % 360
  return sectors.map((s, i) => ({
    ...s,
    start: i * sweep,
    end: (i + 1) * sweep,
    accent: s.accent ?? hueFor(i),
  }))
}

// ── Legacy 4×4 defaults ─────────────────────────────────────────────
// Kept as named exports so callers that haven't migrated to the
// buildRings/buildSectors API still get the historical look. New code
// should drive geometry from the parsed radar.document.{sectors,rings}.
const DEFAULT_RINGS = [
  { id: 'adopt', title: 'Adopt' },
  { id: 'trial', title: 'Trial' },
  { id: 'assess', title: 'Assess' },
  { id: 'hold', title: 'Hold' },
]
const DEFAULT_QUADRANTS = [
  { id: 'q1', title: 'Q1' },
  { id: 'q2', title: 'Q2' },
  { id: 'q3', title: 'Q3' },
  { id: 'q4', title: 'Q4' },
]
// Legacy QUADRANTS keep `qN` ids (not `sN`) so any holdout caller using
// the constant directly sees the historical shape. Accent hues are
// already SECTOR_HUE_PALETTE[0..3] = teal/violet/amber/sky.
export const RINGS = buildRings(DEFAULT_RINGS)
export const QUADRANTS = buildSectors(DEFAULT_QUADRANTS).map((q, i) => ({
  ...q,
  id: `q${i + 1}`,
}))
export const QUADRANT_INDEX = Object.fromEntries(
  QUADRANTS.map((q, i) => [q.id, i]),
)
export const RING_INDEX = Object.fromEntries(RINGS.map((r, i) => [r.id, i]))

/** Polar → cartesian, centred at CENTER. */
export const polar = (angle, radius) => ({
  x: CENTER + Math.cos(angle) * radius,
  y: CENTER + Math.sin(angle) * radius,
})

/**
 * Annulus-segment SVG path (one sector × one ring). `ctx` carries the
 * resolved sectors/rings arrays — defaults to the legacy 4×4 geometry.
 */
export const sectorPath = (
  qIdx,
  rIdx,
  { sectors = QUADRANTS, rings = RINGS } = {},
) => {
  const q = sectors[qIdx]
  const innerR = rIdx === 0 ? 0 : rings[rIdx - 1].outer
  const outerR = rings[rIdx].outer
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

/** Arc-only path (for textPath alongside ring boundary or rim). */
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

const MIN_DIST = 34 // ≈ 2× blip radius (14) + breathing gap
const MAX_ATTEMPTS = 28

/**
 * Deterministic-random placement with collision avoidance. Each entry
 * seeds its own PRNG by name, samples up to N candidates inside the
 * sector annulus and picks the first one that respects MIN_DIST from
 * every blip already placed (across all sectors — passed via `placed`).
 * Falls back to the candidate that maximised the nearest-neighbour gap
 * if no perfect fit found. Stable across renders.
 */
export const placeEntries = (
  entries,
  qIdx,
  rIdx,
  placed,
  { sectors = QUADRANTS, rings = RINGS } = {},
) => {
  const q = sectors[qIdx]
  const innerBound = rIdx === 0 ? 22 : rings[rIdx - 1].outer + 14
  const outerBound = rings[rIdx].outer - 14
  const angularPad = 0.06
  const a0 = q.start + angularPad
  const a1 = q.end - angularPad

  const sorted = entries.toSorted((x, y) => x.name.localeCompare(y.name))
  for (const entry of sorted) {
    const rand = mulberry32(hashSeed(entry.name))
    let best = null
    let bestGap = -1
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const angle = a0 + rand() * (a1 - a0)
      const radius = innerBound + rand() * (outerBound - innerBound)
      const { x, y } = polar(angle, radius)
      let nearest = Infinity
      for (const p of placed) {
        const d = Math.hypot(x - p.x, y - p.y)
        if (d < nearest) nearest = d
      }
      if (nearest >= MIN_DIST) {
        best = { ...entry, x, y, angle, radius }
        break
      }
      if (nearest > bestGap) {
        bestGap = nearest
        best = { ...entry, x, y, angle, radius }
      }
    }
    if (best) placed.push(best)
  }
}

/**
 * Pull sectors+rings out of the parsed radar document, fall back to the
 * legacy 4-sector / 4-ring defaults when absent. Pre-normalised radars
 * (post-`normalizeEntries`) always have both fields populated.
 *
 * When `autoFitRings` is set, ring outer radii are sized by entry
 * density (densest cell expands the ring) instead of evenly distributed
 * across MAX_RADIUS.
 */
const geometryFor = (radar, { autoFitRings = false } = {}) => {
  const sectorsSrc = radar.document.sectors || DEFAULT_QUADRANTS
  let ringsSrc = radar.document.rings || DEFAULT_RINGS
  if (autoFitRings) {
    ringsSrc = fitRingOuters(ringsSrc, sectorsSrc.length, radar.document.data)
  }
  return {
    sectors: buildSectors(sectorsSrc),
    rings: buildRings(ringsSrc),
  }
}

/**
 * Group radar entries by (sector, ring) and place each cell, sharing a
 * single `placed` array so blips in adjacent cells don't collide either.
 * Numbering walks sector-major, ring-major (inner → outer) for stable
 * output. Returns `{ entries, sectors, rings }` — page rendering reuses
 * the resolved geometry rather than rebuilding it.
 */
export const layoutRadar = (radar, options = {}) => {
  const { sectors, rings } = geometryFor(radar, options)
  const M = rings.length
  const sIndex = Object.fromEntries(sectors.map((s, i) => [s.id, i]))
  const rIndex = Object.fromEntries(rings.map((r, i) => [r.id, i]))

  const cells = new Map()
  for (const entry of radar.document.data) {
    // Accept either the canonical `sector` id or the legacy `quadrant` id —
    // ring is always the canonical id after normalisation, but tolerate
    // pre-normalised inputs (geometry tests construct fixtures by hand).
    const sid = entry.sector ?? entry.quadrant
    const qIdx = sIndex[String(sid).toLowerCase()]
    const rIdx = rIndex[String(entry.ring).toLowerCase()]
    if (qIdx === undefined || rIdx === undefined) continue
    const key = qIdx * M + rIdx
    if (!cells.has(key)) cells.set(key, [])
    cells.get(key).push({ ...entry, qIdx, rIdx, sector: sectors[qIdx].id })
  }
  const placed = []
  for (let qIdx = 0; qIdx < sectors.length; qIdx++) {
    for (let rIdx = 0; rIdx < rings.length; rIdx++) {
      const list = cells.get(qIdx * M + rIdx)
      if (!list) continue
      placeEntries(list, qIdx, rIdx, placed, { sectors, rings })
    }
  }
  return {
    entries: placed.map((p, i) => ({ ...p, num: i + 1 })),
    sectors,
    rings,
  }
}
