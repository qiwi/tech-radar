#!/usr/bin/env node

import meow from 'meow'
import {run} from './generator.js'

export const cli = meow(
  `
    Usage:
      techradar  --input /path/to/csv --output /radar
    Options
      --input
      --output
`,
  {
    importMeta: import.meta,
    flags: {
      input: {
        type: 'string',
        isRequired: true,
      },
      output: {
        type: 'string',
        isRequired: true,
      },
      cwd: {
        type: 'string',
      },
    },
  },
)

run(cli.flags)
