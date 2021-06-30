#!/usr/bin/env node

import meow from 'meow'
import {generateTechRadar} from './index.js'

export const cli = meow(
  `
    Usage:
      techradar  --input /path/to/csv --outDir /radar
    Options
      --input
      --outDir
`,
  {
    importMeta: import.meta,
    flags: {
      input: {
        type: 'string',
        isRequired: true,
      },
      outDir: {
        type: 'string',
        isRequired: true,
      },
    },
  },
)

generateTechRadar(cli.flags)
