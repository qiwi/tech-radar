import path from 'path'

export const langAndFw = 'languages-and-frameworks'
export const platforms = 'platforms'
export const tools = 'tools'
export const techniques = 'techniques'

export const quadrantAliases = {
  [langAndFw]: langAndFw,
  'languages-and-framework': langAndFw,
  language: langAndFw,
  lang: langAndFw,
  lf: langAndFw,
  fw: langAndFw,
  framework: langAndFw,

  [platforms]: platforms,
  platform: platforms,
  pf: platforms,

  [tools]: tools,
  tool: tools,

  [techniques]: techniques,
  tech: techniques,
}

export const tplDir = path.resolve('src/main/tpl')

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
  },
}
