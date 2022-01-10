import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

export const rootDir = dirname(fileURLToPath(import.meta.url))
export const tplDir = path.resolve(rootDir, '../tpl')
