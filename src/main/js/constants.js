import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const rootDir = path.dirname(fileURLToPath(import.meta.url))
export const tplDir = path.resolve(rootDir, '../tpl')
