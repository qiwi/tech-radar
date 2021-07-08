import path from 'path'

export const langAndFw = 'languages-and-frameworks'
export const platforms = 'platforms'
export const tools = 'tools'
export const techniques = 'techniques'

export const tplDir = path.resolve('src/main/tpl')
export const tempDir = 'radar-temp'

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
export const settings = {
  svg_id: 'radar',
  width: 1450,
  height: 1100,
  colors: {
    background: '#fff',
    grid: '#bbb',
    inactive: '#ddd',
  },
  rings: [
    { name: 'ADOPT', color: '#93c47d', id: 'adopt' },
    { name: 'TRIAL', color: '#93d2c2', id: 'trial' },
    { name: 'ASSESS', color: '#fbdb84', id: 'assess' },
    { name: 'HOLD', color: '#efafa9', id: 'hold' },
  ],
  print_layout: true,
}
