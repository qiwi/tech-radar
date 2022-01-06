import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

export const __dirname = dirname(fileURLToPath(import.meta.url))
export const tplDir = path.resolve(__dirname, '../../tpl')

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
