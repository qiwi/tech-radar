#!/usr/bin/env node

import meow from 'meow'
import {run} from './index.js'

export const cli = meow(
  `
    Usage:
      techradar  --input /path/to/csv --output /radar --base-prefix tech-radar --autoscope true --nav-page true --nav-title title --nav-footer footer --renderer zalando
    Options
      --cwd
      --input
      --output
      --base-prefix
      --autoscope
      --nav-page
      --nav-title
      --nav-footer
      --temp
      --templates
      --renderer  output backend: "zalando" (default, classic d3-style) or "aurora" (pure-SVG)
      --favicon   path to a .ico/.png file to copy as <output>/favicon.ico (overrides the bundled default)
      --about           path to an .md or .html file with radar overview (aurora only)
      --credits         include the generator credit in the legend footer (default true; aurora only)
      --auto-fit-rings  size ring radii by entry density so crowded cells get more room (aurora only)
`,
  {
    importMeta: import.meta,
    flags: {
      input: {
        type: 'string',
      },
      output: {
        type: 'string',
      },
      basePrefix: {
        type: 'string',
      },
      cwd: {
        type: 'string',
      },
      autoscope: {
        type: 'boolean'
      },
      navPage: {
        type: 'boolean'
      },
      navTitle: {
        type: 'string'
      },
      navFooter: {
        type: 'string'
      },
      temp: {
        type: 'string'
      },
      templates: {
        type: 'string',
        shortFlag: 'tpl'
      },
      renderer: {
        type: 'string'
      },
      favicon: {
        type: 'string'
      },
      about: {
        type: 'string'
      },
      credits: {
        type: 'boolean',
        default: true
      },
      autoFitRings: {
        type: 'boolean'
      }
    },
  },
)

run(cli.flags)
