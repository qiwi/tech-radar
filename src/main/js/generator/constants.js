import path from 'path'

export const langAndFw = 'languages-and-frameworks'
export const platforms = 'platforms'
export const tools = 'tools'
export const techniques = 'techniques'

export const tplDir = path.resolve('src/main/tpl')
export const tplNavPage = path.resolve('src/main/nav-page')
export const defNavTitle = '📡 Tech radars'
export const defNavFooter = `<a href="https://github.com/qiwi/tech-radar">Tech-radar generator.</a> 
Based on <a href="https://github.com/zalando/tech-radar">zalando/tech-radar</a> .
Boosted with <a href="https://github.com/11ty/eleventy/">11ty</a>.
<br><a class="link" href="https://github.com/qiwi">QIWI ❤️ Open Source.</a> `


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
