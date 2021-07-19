import path from 'path'

export const langAndFw = 'languages-and-frameworks'
export const platforms = 'platforms'
export const tools = 'tools'
export const techniques = 'techniques'

export const tplDir = path.resolve('src/main/tpl')
export const tempDir = 'radar-temp'
export const tplNavPage = path.resolve('src/main/nav-page')
export const defNavTitle = '📡 Tech radars'
export const defNavFooter =
  `<a href="https://github.com/qiwi/tech-radar">Tech-radar generator.</a> 
Based on <a href="https://github.com/zalando/tech-radar">zalando/tech-radar</a> .
Boosted with <a href="https://github.com/11ty/eleventy/">11ty</a>.
<br><a href="https://github.com/qiwi">QIWI</a> ❤️ Open Source.`

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
