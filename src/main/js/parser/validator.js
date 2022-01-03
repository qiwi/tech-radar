import Ajv from 'ajv'

const validators = new Map()
const _validate = (target, schema) => {
  const validator = validators.get(schema)
  if (!validator) {
    validators.set(schema, new Ajv().compile(schema))
    return _validate(target, schema)
  }

  const result = validator(target)
  const error = validator.errors

  if (error) {
    console.error('validation error', error)
  }

  return result
}

export const validate = (radar) => {
  if (!_validate(radar, radarSchema)) {
    throw new Error('Invalid radar')
  }

  return radar
}

export const radarSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quadrant: { type: 'string' },
          ring: { type: 'string' },
          description: { type: ['string', 'null'] },
          moved: { type: ['string', 'integer', 'null'] },
        },
        required: ['name', 'quadrant', 'ring', 'description'],
      },
    },
    meta: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        date: { type: 'string' },
        legend: { type: ['string', 'null'] },
      },
      required: ['title', 'date'],
    },
    quadrantAliases: {
      type: 'object',
    },
  },
  required: ['meta', 'data', 'quadrantAliases'],
}
