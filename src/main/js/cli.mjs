#!/usr/bin/env node

import meow from 'meow'
import {generateTechRadar} from './index.js'

export const cli = meow(
  `
    Usage:
      techradar  --csv-path /path/to/csv --out-dir /radar --versions 1.00 pathPrefix js
    Options
      --csvPath
      --outDir
      --version
      --pathPrefix
`,
  {
    importMeta: import.meta,
    flags: {
      csvPath: {
        type: 'string',
        isRequired: true,
      },
      outDir: {
        type: 'string',
        isRequired: true,
      },
      version: {
        type: 'string',
      },
      pathPrefix: {
        type: 'string',
      },
    },
  },
)

generateTechRadar(cli.flags)
