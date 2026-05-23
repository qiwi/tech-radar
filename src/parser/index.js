import { globby } from 'globby'
import path from 'node:path'

import { asArray } from '../util.js'
import { parseCsvRadar } from './csv.js'
import { parseJsonRadar } from './json.js'
import { validate } from './validator.js'
import { parseYamlRadar } from './yaml.js'

export { parseCsvRadar } from './csv.js'
export { parseJsonRadar } from './json.js'
export { parseYamlRadar } from './yaml.js'

/**
 * Parse radarDocument
 * @param filePath
 * @returns {Promise<{data: any[], meta: {}, quadrantAliases?: {}}>} radarDocument
 */
export const parse = async (filePath) => {
  try {
    const reader = getReader(path.extname(filePath))
    const document = await reader(filePath)
    const radar = normalizeEntries(document)

    return validate(radar)
  } catch (err) {
    console.error('filePath:', filePath, err)
    return {}
  }
}
const READERS = {
  '.csv': parseCsvRadar,
  '.json': parseJsonRadar,
  '.yml': parseYamlRadar,
  '.yaml': parseYamlRadar,
}

/**
 * selection of the reading function depending on the extension
 * @param ext
 * @returns {(function(*=): {data: any[], meta: {}})}
 */
export const getReader = (ext) => {
  const reader = READERS[ext]
  if (!reader) throw new Error(`Unsupported format: ${ext}`)
  return reader
}

/**
 * Returns absolute files paths by glob pattern
 * @param {string|string[]} pattern - glob pattern
 * @param cwd - cwd
 * @returns {Promise<string[]>}
 */
export const getSources = async (pattern, cwd) =>
  globby([pattern], {
    onlyFiles: true,
    absolute: true,
    cwd,
  })

export const normalizeQuadrantAliases = (aliases) =>
  Object.entries(aliases || {}).reduce((m, [k, v]) => {
    if (/^q[1-4]$/.test(k)) {
      asArray(v).forEach((_v) => {
        m[_v] = k
      })
    } else {
      m[k] = v
    }

    return m
  }, {})

export const normalizeQuadrantTitles = (titles) => ({
  q1: 'Q1',
  q2: 'Q2',
  q3: 'Q3',
  q4: 'Q4',
  ...titles,
})

const LEGACY_RING_IDS = ['adopt', 'trial', 'assess', 'hold']
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s)

/** True iff the parsed radar has 4 sectors AND 4 rings whose ids match the
 *  legacy adopt/trial/assess/hold ordering. Used to decide whether to
 *  emit the legacy `quadrant*` view alongside the canonical sectors/rings
 *  arrays — only then can the zalando renderer consume the doc. */
const canBe4x4 = (sectors, rings) =>
  sectors.length === 4 &&
  rings.length === 4 &&
  rings.every((r, i) => r.id === LEGACY_RING_IDS[i])

/** Flatten `{ alias: 'sN' }` map → array of aliases for a given sector. */
const aliasesFor = (sid, aliasMap) =>
  Object.entries(aliasMap || {})
    .filter(([, v]) => v === sid)
    .map(([k]) => k)

/** Build the canonical `sectors` array. Inputs (in priority order):
 *   1. doc.sectors — Flex array form
 *   2. doc.sectorTitles + sectorAliases — Flex CSV form
 *   3. doc.quadrantTitles + quadrantAliases — legacy 4x4
 *  Output items are `{ id: 'sN', title, aliases: [...] }`, ordered by id. */
const computeSectors = (doc) => {
  if (Array.isArray(doc.sectors) && doc.sectors.length) {
    return doc.sectors.map((s, i) => ({
      id: s.id || `s${i + 1}`,
      title: s.title,
      aliases: s.aliases || [],
    }))
  }
  if (doc.sectorTitles && Object.keys(doc.sectorTitles).length) {
    return Object.keys(doc.sectorTitles)
      .toSorted()
      .map((id) => ({
        id,
        title: doc.sectorTitles[id],
        aliases: aliasesFor(id, doc.sectorAliases),
      }))
  }
  // Legacy: derive s1..s4 from quadrantTitles + quadrantAliases.
  const qTitles = normalizeQuadrantTitles(doc.quadrantTitles || {})
  const qAliases = normalizeQuadrantAliases(doc.quadrantAliases || {})
  return ['q1', 'q2', 'q3', 'q4'].map((qid, i) => ({
    id: `s${i + 1}`,
    title: qTitles[qid],
    aliases: aliasesFor(qid, qAliases),
  }))
}

/** Build the canonical `rings` array. Inputs:
 *   1. doc.rings — Flex array form
 *   2. doc.ringTitles — Flex CSV form
 *   3. Auto-derive from entries: if all entry rings match the legacy
 *      adopt/trial/assess/hold names → use the legacy order; otherwise
 *      first-seen order with `r1..rN` ids. */
const computeRings = (doc) => {
  if (Array.isArray(doc.rings) && doc.rings.length) {
    return doc.rings.map((r, i) => ({ id: r.id || `r${i + 1}`, title: r.title }))
  }
  if (doc.ringTitles && Object.keys(doc.ringTitles).length) {
    return Object.keys(doc.ringTitles)
      .toSorted()
      .map((id) => ({ id, title: doc.ringTitles[id] }))
  }
  const seen = []
  for (const e of doc.data) {
    const n = String(e.ring || '').toLowerCase()
    if (n && !seen.includes(n)) seen.push(n)
  }
  const allLegacy = seen.length > 0 && seen.every((n) => LEGACY_RING_IDS.includes(n))
  if (allLegacy) {
    return LEGACY_RING_IDS.map((id) => ({ id, title: cap(id) }))
  }
  return seen.map((name, i) => ({ id: `r${i + 1}`, title: cap(name) }))
}

/** Resolve a raw sector reference (sN, qN, alias, title) → canonical sN id. */
const resolveSectorId = (raw, sectors) => {
  const norm = String(raw || '').toLowerCase()
  // Direct sN id
  const direct = sectors.find((s) => s.id === norm)
  if (direct) return direct.id
  // Legacy quadrant id qN → sN by position
  if (/^q[1-8]$/.test(norm)) {
    const sid = `s${norm.slice(1)}`
    if (sectors.find((s) => s.id === sid)) return sid
  }
  // Alias (case-insensitive)
  const viaAlias = sectors.find((s) =>
    (s.aliases || []).some((a) => a.toLowerCase() === norm),
  )
  if (viaAlias) return viaAlias.id
  // Title (case-insensitive)
  const byTitle = sectors.find((s) => String(s.title).toLowerCase() === norm)
  if (byTitle) return byTitle.id
  return norm
}

/** Resolve a raw ring reference (rN, name, title) → canonical rN id. */
const resolveRingId = (raw, rings) => {
  const norm = String(raw || '').toLowerCase()
  const direct = rings.find((r) => r.id === norm)
  if (direct) return direct.id
  const byTitle = rings.find((r) => String(r.title).toLowerCase() === norm)
  if (byTitle) return byTitle.id
  return norm
}

/**
 * Build the unified internal model:
 *   - doc.sectors / doc.rings   — canonical arrays (always)
 *   - doc.data[*].sector / .ring — resolved to canonical ids
 *   - doc.quadrant{Titles,Aliases} + entry.quadrant — ONLY when the radar
 *     is structurally 4x4 with the legacy adopt/trial/assess/hold rings;
 *     gives zalando its expected view, lets aurora share the same doc.
 */
export const normalizeEntries = (doc) => {
  const sectors = computeSectors(doc)
  const rings = computeRings(doc)
  const legacyCompat = canBe4x4(sectors, rings)

  doc.data.forEach((entry) => {
    const rawSector = entry.sector ?? entry.quadrant
    entry.sector = resolveSectorId(rawSector, sectors)
    entry.ring = resolveRingId(entry.ring, rings)
    entry.moved = +entry.moved || 0
  })
  doc.data.sort((a, b) => (a.name > b.name ? 1 : -1))

  doc.sectors = sectors
  doc.rings = rings

  if (legacyCompat) {
    // Mirror sectors → q1..q4 for the legacy renderer + 4x4 validator.
    doc.quadrantTitles = Object.fromEntries(
      sectors.map((s, i) => [`q${i + 1}`, s.title]),
    )
    doc.quadrantAliases = sectors.reduce((m, s, i) => {
      const qid = `q${i + 1}`
      ;(s.aliases || []).forEach((a) => {
        m[String(a).toLowerCase()] = qid
      })
      return m
    }, {})
    doc.data.forEach((entry) => {
      entry.quadrant = entry.sector.replace(/^s/, 'q')
      entry.quadrantTitle = doc.quadrantTitles[entry.quadrant]
    })
  } else {
    // Non-4x4 radar — strip the legacy view so the 4x4 schema rejects it
    // and the dispatch routes the doc strictly through aurora.
    delete doc.quadrantTitles
    delete doc.quadrantAliases
  }
  // CSV scaffolding fields aren't part of either output schema.
  delete doc.sectorTitles
  delete doc.sectorAliases
  delete doc.ringTitles

  return doc
}

export const getQuadrant = (quadrant, quadrantAliases) => {
  const lowQuadrant = quadrant.toLowerCase()
  return quadrantAliases[lowQuadrant] || lowQuadrant
}
