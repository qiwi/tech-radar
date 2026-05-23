// Focused tests for the parser's Flex-schema paths: JSON/YAML array form
// of `sectors`/`rings`, ring auto-derivation, sector alias/title
// resolution, and the `matchesSchema` helper.

import { normalizeEntries } from '../../src/parser/index.js'
import {
  _validate,
  matchesSchema,
  radarSchema4x4,
  radarSchemaFlex,
} from '../../src/parser/validator.js'

describe('parser/flex', () => {
  describe('computeSectors', () => {
    it('honours an explicit `sectors` array (Flex JSON/YAML form)', () => {
      const doc = normalizeEntries({
        meta: { title: 't', date: '2026-01-01' },
        sectors: [
          { id: 's1', title: 'Backend', aliases: ['be'] },
          { id: 's2', title: 'Frontend' },
        ],
        rings: [
          { id: 'r1', title: 'Use' },
          { id: 'r2', title: 'Stop' },
        ],
        data: [
          { name: 'X', sector: 'be', ring: 'use', description: '' },
          { name: 'Y', sector: 'Frontend', ring: 'r2', description: '' },
        ],
      })
      expect(doc.sectors).toHaveLength(2)
      expect(doc.sectors[0].title).toBe('Backend')
      // Alias-resolved (case-insensitive) and title-resolved entries land
      // on the right sector.
      expect(doc.data.find((e) => e.name === 'X').sector).toBe('s1')
      expect(doc.data.find((e) => e.name === 'Y').sector).toBe('s2')
    })

    it('resolves an `sN` id directly even when an alias map is absent', () => {
      const doc = normalizeEntries({
        meta: { title: 't', date: '2026-01-01' },
        sectors: [
          { id: 's1', title: 'A' },
          { id: 's2', title: 'B' },
          { id: 's3', title: 'C' },
        ],
        rings: [
          { id: 'r1', title: 'Use' },
          { id: 'r2', title: 'Stop' },
        ],
        data: [{ name: 'Z', sector: 's3', ring: 'r1', description: '' }],
      })
      expect(doc.data[0].sector).toBe('s3')
    })
  })

  describe('computeRings', () => {
    it('auto-derives rings from entries in first-seen order when no section is declared', () => {
      // Non-legacy ring names — should land in first-seen order (NOT
      // the legacy adopt/trial/assess/hold ordering).
      const doc = normalizeEntries({
        meta: { title: 't', date: '2026-01-01' },
        sectors: [
          { id: 's1', title: 'A' },
          { id: 's2', title: 'B' },
        ],
        data: [
          { name: 'X', sector: 's1', ring: 'Use', description: '' },
          { name: 'Y', sector: 's1', ring: 'Hold', description: '' },
          { name: 'Z', sector: 's2', ring: 'Try', description: '' },
        ],
      })
      expect(doc.rings.map((r) => r.title)).toEqual(['Use', 'Hold', 'Try'])
      expect(doc.rings.map((r) => r.id)).toEqual(['r1', 'r2', 'r3'])
    })

    it('uses an explicit `rings` array if provided (Flex JSON/YAML form)', () => {
      const doc = normalizeEntries({
        meta: { title: 't', date: '2026-01-01' },
        sectors: [{ id: 's1', title: 'A' }, { id: 's2', title: 'B' }],
        rings: [
          { id: 'r1', title: 'Standard' },
          { id: 'r2', title: 'Trial' },
          { id: 'r3', title: 'Forbidden' },
        ],
        data: [{ name: 'X', sector: 's1', ring: 'r2', description: '' }],
      })
      expect(doc.rings.map((r) => r.title)).toEqual(['Standard', 'Trial', 'Forbidden'])
    })
  })

  describe('matchesSchema', () => {
    it('a 4×4 radar matches both 4x4 and flex', () => {
      const radar = { _schema: '4x4' }
      expect(matchesSchema(radar, '4x4')).toBe(true)
      expect(matchesSchema(radar, 'flex')).toBe(true)
    })
    it('a flex radar matches flex but not 4x4', () => {
      const radar = { _schema: 'flex' }
      expect(matchesSchema(radar, '4x4')).toBe(false)
      expect(matchesSchema(radar, 'flex')).toBe(true)
    })
  })

  describe('schema acceptance', () => {
    it('Flex schema rejects an empty radar', () => {
      expect(_validate({}, radarSchemaFlex, { quiet: true })).toBe(false)
    })
    it('4x4 schema rejects a Flex radar with sectors/rings arrays', () => {
      const flexDoc = {
        meta: { title: 't', date: '2026-01-01' },
        sectors: [{ id: 's1', title: 'A' }, { id: 's2', title: 'B' }],
        rings: [{ id: 'r1', title: 'Use' }, { id: 'r2', title: 'Stop' }],
        data: [{ name: 'X', sector: 's1', ring: 'r1', description: '' }],
      }
      expect(_validate(flexDoc, radarSchema4x4, { quiet: true })).toBe(false)
      expect(_validate(flexDoc, radarSchemaFlex, { quiet: true })).toBe(true)
    })
  })
})
