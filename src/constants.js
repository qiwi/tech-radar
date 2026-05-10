import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const rootDir = dirname(fileURLToPath(import.meta.url))
export const tplDir = path.resolve(rootDir, 'renderer/eleventy/templates')
