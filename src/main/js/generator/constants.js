import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

export const langAndFw = 'languages-and-frameworks'
export const platforms = 'platforms'
export const tools = 'tools'
export const techniques = 'techniques'

export const __dirname = dirname(fileURLToPath(import.meta.url))
export const tplDir = path.resolve(__dirname, '../../tpl')

export const defNavTitle = '📡 Tech radars'
// TODO move to templates
export const defNavFooter = `<div style="width: 100%; text-align: center; margin: 30px 0 10px 0; font-size: 80%">
<a href="https://github.com/qiwi/tech-radar">Tech-radar generator</a>.
Based on <a href="https://github.com/zalando/tech-radar">zalando/tech-radar</a>.
Boosted with <a href="https://github.com/11ty/eleventy/">11ty</a>
<br/><a class="link" href="https://github.com/qiwi">QIWI ❤️ Open Source</a></div>`

export const settings = {
  svg_id: 'radar',
  width: 1450,
  height: 1050,
  colors: {
    background: '#fff',
    grid: '#dddde0',
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
