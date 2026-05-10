import Ajv from 'ajv'

const validators = new Map()

const getValidator = (schema) => {
  let validator = validators.get(schema)
  if (!validator) {
    validator = new Ajv().compile(schema)
    validators.set(schema, validator)
  }
  return validator
}

export const _validate = (target, schema) => {
  const validator = getValidator(schema)
  const result = validator(target)

  if (validator.errors) {
    console.error('validation error', validator.errors)
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
    quadrantTitles: {
      type: 'object',
      additionalProperties: false,
      patternProperties: {
        '^q[1-4]$': { type: 'string' },
      },
    },
    quadrantAliases: {
      type: 'object',
      patternProperties: {
        '^q[1-4]$': {
          anyOf: [
            { type: 'string', pattern: '^(?!q[1-4]$)' },
            {
              type: 'array',
              items: { type: 'string', pattern: '^(?!q[1-4]$)' },
            },
          ],
        },
        '^(?!q[1-4]$)': { type: 'string', enum: ['q1', 'q2', 'q3', 'q4'] },
      },
      additionalProperties: false,
    },
  },
  required: ['meta', 'data', 'quadrantAliases'],
}
