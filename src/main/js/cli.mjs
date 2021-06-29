#!/usr/bin/env node

import meow from 'meow'
import {startGenerateTechRadars} from './index.js'

export const cli = meow(
  `
    Usage:
      techradar  --csvPath /path/to/csv --outDir /radar
    Options
      --csvPath
      --outDir
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

startGenerateTechRadars(cli.flags)
