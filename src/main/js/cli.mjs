#!/usr/bin/env node

import meow from 'meow'
import {run} from './index.js'

export const cli = meow(
  `
    Usage:
      techradar  --input /path/to/csv --output /radar --basePrefix tech-radar --autoscope true
    Options
      --input
      --output
      --basePrefix
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
      basePrefix: {
        type: 'string',
      },
      cwd: {
        type: 'string',
      },
      autoscope: {
        type: 'boolean'
      }
    },
  },
)

run(cli.flags)
