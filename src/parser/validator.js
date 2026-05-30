import Ajv from 'ajv'

const validators = new Map()

// `allowUnionTypes`: silence the strict-mode warning on
// `moved: { type: ['string','integer','null'] }` — the union is intentional.
const getValidator = (schema) => {
  let validator = validators.get(schema)
  if (!validator) {
    validator = new Ajv({ allowUnionTypes: true }).compile(schema)
    validators.set(schema, validator)
  }
  return validator
}

export const _validate = (target, schema, { quiet = false } = {}) => {
  const validator = getValidator(schema)
  const result = validator(target)

  if (validator.errors && !quiet) {
    console.error('validation error', validator.errors)
  }

  return result
}

/**
 * Validate a parsed radar against the strictest schema it satisfies.
 * Tags the radar with `_schema` (`'4x4'` | `'flex'`) so the dispatch layer
 * can route by capability — zalando only accepts `4x4`, aurora accepts both.
 *
 * The first probe (4x4) is quiet so a Flex radar doesn't dump a spurious
 * validation diff into stderr on every parse.
 */
export const validate = (radar) => {
  if (_validate(radar, radarSchema4x4, { quiet: true })) {
    radar._schema = '4x4'
    return radar
  }
  if (_validate(radar, radarSchemaFlex)) {
    radar._schema = 'flex'
    return radar
  }
  throw new Error('Invalid radar')
}

/** True if `radar` satisfies the named schema's capability. A 4x4 radar
 *  always passes Flex (it's a strict subset); the reverse does not hold. */
export const matchesSchema = (radar, name) => {
  if (name === 'flex') return radar._schema === '4x4' || radar._schema === 'flex'
  return radar._schema === name
}

// ── Shared sub-schemas ─────────────────────────────────────────────
const dataItem = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    // Entries may use either the legacy `quadrant` field or the new
    // `sector` field; the parser normalises one onto the other before
    // validation. Both are accepted here so partial pipelines still work.
    quadrant: { type: 'string' },
    sector: { type: 'string' },
    ring: { type: 'string' },
    description: { type: ['string', 'null'] },
    moved: { type: ['string', 'integer', 'null'] },
  },
  // `description` is optional — renderer treats missing/null as ''.
  required: ['name', 'ring'],
}

const meta = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    date: { type: 'string' },
    legend: { type: ['string', 'null'] },
  },
  required: ['title', 'date'],
}

/** Legacy strict schema — exactly 4 quadrants `q1..q4`. Zalando-only. */
export const radarSchema4x4 = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: { ...dataItem, required: ['name', 'quadrant', 'ring'] },
    },
    meta,
    quadrantTitles: {
      type: 'object',
      additionalProperties: false,
      patternProperties: { '^q[1-4]$': { type: 'string' } },
    },
    quadrantAliases: {
      type: 'object',
      patternProperties: {
        '^q[1-4]$': {
          anyOf: [
            { type: 'string', pattern: '^(?!q[1-4]$)' },
            { type: 'array', items: { type: 'string', pattern: '^(?!q[1-4]$)' } },
          ],
        },
        '^(?!q[1-4]$)': { type: 'string', enum: ['q1', 'q2', 'q3', 'q4'] },
      },
      additionalProperties: false,
    },
  },
  required: ['meta', 'data', 'quadrantAliases'],
}

/**
 * Flex schema — 2–8 sectors, 2–8 rings, arbitrary ids/titles.
 * Aurora-only. Sectors expressed as `sN`; legacy `qN` is mapped to `sN`
 * at parse time. `rings` is an ORDERED list inner → outer.
 */
export const radarSchemaFlex = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: { ...dataItem, required: ['name', 'sector', 'ring'] },
    },
    meta,
    sectors: {
      type: 'array',
      minItems: 2,
      maxItems: 8,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^s[1-8]$' },
          title: { type: 'string' },
          aliases: { type: 'array', items: { type: 'string' } },
        },
        required: ['id', 'title'],
        additionalProperties: false,
      },
    },
    rings: {
      type: 'array',
      minItems: 2,
      maxItems: 8,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^r[1-8]$' },
          title: { type: 'string' },
        },
        required: ['id', 'title'],
        additionalProperties: false,
      },
    },
  },
  required: ['meta', 'data', 'sectors', 'rings'],
}

// Back-compat alias — keep the previous export name available.
export const radarSchema = radarSchema4x4
