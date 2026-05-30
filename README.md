# 📡 @qiwi/tech-radar

[![CI](https://github.com/qiwi/tech-radar/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/qiwi/tech-radar/actions/workflows/ci.yaml)
[![Maintainability](https://qlty.sh/gh/qiwi/projects/tech-radar/maintainability.svg)](https://qlty.sh/gh/qiwi/projects/tech-radar)
[![Code Coverage](https://qlty.sh/gh/qiwi/projects/tech-radar/coverage.svg)](https://qlty.sh/gh/qiwi/projects/tech-radar)
[![npm (scoped)](https://img.shields.io/npm/v/@qiwi/tech-radar?color=09e)](https://www.npmjs.com/package/@qiwi/tech-radar)

Fully automated tech-radar generator. Two output styles from the same input: a classic Zalando-style radar (built on top of [zalando/tech-radar](https://github.com/zalando/tech-radar) + [11ty](https://github.com/11ty/eleventy/)) and **Aurora** — a self-contained pure-SVG renderer with theming, a per-scope snapshot timeline and an optional About page.

## Purpose
[Zalando's answer](https://opensource.zalando.com/tech-radar/):
> The Tech Radar is a tool to inspire and support engineering teams at Zalando to pick the best technologies for new projects; it provides a platform to share knowledge and experience in technologies, to reflect on technology decisions and continuously evolve our technology landscape. Based on the pioneering work of ThoughtWorks, our Tech Radar sets out the changes in technologies that are interesting in software development — changes that we think our engineering teams should pay attention to and consider using in their projects.

We've just _slightly_ modified [the original implementation](https://github.com/zalando/tech-radar) for our bloody enterprise requirements.

## Demo

<table align="center">
  <tr>
    <td width="50%" align="center">
      <a href="https://qiwi.github.io/tech-radar/v2/">
        <img alt="Aurora demo" src="https://github.com/qiwi/tech-radar/blob/master/img/radar-v2.png?raw=true" width="100%">
      </a>
    </td>
    <td width="50%" align="center">
      <a href="https://qiwi.github.io/tech-radar/v1/">
        <img alt="Zalando-style demo" src="https://github.com/qiwi/tech-radar/blob/master/img/radar.png?raw=true" width="100%">
      </a>
    </td>
  </tr>
  <tr>
    <td align="center"><a href="https://qiwi.github.io/tech-radar/v2/"><b>v2 — Aurora</b></a></td>
    <td align="center"><a href="https://qiwi.github.io/tech-radar/v1/"><b>v1 — Zalando</b></a></td>
  </tr>
</table>


## Table of contents
- [Key features](#key-features)
- [Requirements](#requirements)
- [Install](#install)
- [Usage](#usage)
  - [CLI](#cli)
  - [JS API](#js-api)
  - [Input examples](#input-examples)
  - [CI/CD](#cicd)
- [Customization](#customization)
  - [Renderers](#renderers)
  - [Sectors and rings *(aurora — NxM)*](#sectors-and-rings)
  - [Group labels](#group-labels)
  - [Ring colors *(zalando)*](#ring-colors)
  - [Templates *(zalando)*](#templates)
  - [Aurora theming](#aurora-theming)
- [Contributing](#contributing)
  - [Update the radar data](#update-the-radar-data)
  - [Enhance the generator](#enhance-the-generator)
- [Alternatives](#alternatives)
- [License](#license)

## Key features
Common (any renderer):
* Reads radar data from `csv`, `json` or `yaml`
* Renders one snapshot per `(scope, date)` pair, with a separate description page per entry
* Auto-derives the `moved` indicator across snapshots of the same scope (`autoscope`)
* Redirects each scope URL to its latest snapshot
* CLI / JS / TS API

Per renderer:
* **`zalando`** — Zalando-style d3 radar via 11ty; a top-level navigation page lists all scopes; templates are user-overridable. Strict 4 sectors × 4 rings (`adopt/trial/assess/hold`).
* **`aurora`** — pure-SVG, no client-side d3 or runtime; dark/light themes + colour/mono toggle; built-in per-scope snapshot timeline; sidebar legend with cross-highlight; optional Markdown-driven About page. **Variable layout — any 2–8 sectors × 2–8 rings**.

## Requirements
* Node.js >= 22
* macOS / linux

## Install

```shell
# yarn
yarn add @qiwi/tech-radar

# npm
npm i @qiwi/tech-radar
```

## Usage
### CLI
```shell
# via local dep
techradar --input "/path/to/files/*.{json, csv, yml}" --output /radar

# through npx
npx @qiwi/tech-radar --input "/path/to/files/*.{json, csv, yml}" --output /radar
```

The table groups options by scope: common ones first, then zalando-specific, then aurora-specific. A renderer-scoped flag is silently ignored when running the other backend.

| Option      | Renderer  | Description                                                                                                                                                  | Default                                                                  |
|-------------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| cwd         |           | Current working dir                                                                                                                                          | `process.cwd()`                                                          |
| input       |           | [glob pattern](https://github.com/mrmlnc/fast-glob) to find radar data: csv/json/yml                                                                         | `<cwd>/data/**/*.{json,csv,yml}`                                         |
| output      |           | Output directory                                                                                                                                             | `<cwd>/radar`                                                            |
| autoscope   |           | identify same-scoped files as subversions of a single radar; derive each entry `moved` indicator from the previous snapshot of the same scope (auto-trail)   | `false`                                                                  |
| nav-title   |           | site / topbar title                                                                                                                                          | `📡 Tech radars`                                                         |
| nav-footer  |           | page footer (`<footer>` on each generated page)                                                                                                              |                                                                          |
| temp        |           | temporary assets dir                                                                                                                                         | [`temp-dir`](https://github.com/sindresorhus/temp-dir) + random subfolder |
| renderer    |           | output backend: `zalando` (classic d3 radar) or `aurora` (pure-SVG dark-themed renderer with a built-in snapshot timeline)                                   | `zalando`                                                                |
| favicon     |           | path to a custom favicon (`.ico` / `.png`). Copied to `<output>/favicon.ico` and overrides the bundled default in both renderers.                            |                                                                          |
| base-prefix | `zalando` | base context for assets. Path-shaped (`tech-radar`, empty) → relative URLs at any mount; URL-shaped (`https://cdn…`, `//cdn…`) → kept as absolute (CDN case). Aurora always emits relative URLs and ignores this. | `'/'`                                                                    |
| nav-page    | `zalando` | generate a top-level navigation page listing all scopes. Aurora exposes scopes via the in-radar topbar tabs instead.                                         | `false`                                                                  |
| templates   | `zalando` | custom `11ty/nunjucks` compatible templates directory. Its contents will be merged into the default templates dir. Aurora is not template-customisable.      |                                                                          |
| about       | `aurora`  | path to an `.md` or `.html` file with radar overview. When set, aurora renders a global About page at `<output>/about/` and surfaces a `?` link in the legend footer. Markdown supports h1–h3, paragraphs, unordered lists, `**bold**`, and `[text](url)` — anything fancier should be authored as HTML. |                                                                          |
| credits     | `aurora`  | include the generator credit (`QIWI ❤ Open Source`, with the trailing words linking back to the generator repo) in the legend footer. Set to `false` to suppress on deployments where it isn't wanted. | `true`                                                                   |
| auto-fit-rings | `aurora` | size ring radii by entry density — the most crowded `(sector, ring)` cell expands its ring, the rest shrink. Off by default (equal widths); turn on for radars with uneven distributions where dense cells would otherwise cram blips on top of each other. | `false`                                                                  |

### JS API
```js
import {run} from '@qiwi/tech-radar'

await run({
  input : 'data/*.{csv,json,yml}',
  output : 'dist',
  basePrefix: 'your project',
  autoscope: false
})
```
[JSDoc reference](https://qiwi.github.io/tech-radar/docs)

### Input examples
<details>
  <summary>json</summary>

```json
{
  "meta":{
    "title": "tech radar js",
    "date": "2021-06-12"
  },
  "data":[
    {
      "name": "TypeScript",
      "quadrant": "languages-and-frameworks",
      "ring": "Adopt",
      "description": "Статически типизированный ЖС",
      "moved": "1"
    },
    {
      "name": "Nodejs",
      "quadrant": "Platforms",
      "ring": "Adopt",
      "description": "",
      "moved": ""
    },
    {
      "name": "codeclimate",
      "quadrant": "tools",
      "ring": "Trial",
      "description": "Статический анализатор кода",
      "moved": "0"
    },
    {
      "name": "Гексагональная архитектура",
      "quadrant": "Techniques",
      "ring": "Assess",
      "description": "Унификации контракта интерфейсов различных слоев приложений",
      "moved": "-1"
    }
  ],
  "quadrantAliases": {
    "q1": "languages-and-frameworks",
    "q2": "platforms",
    "q3": "tools",
    "q4": "techniques" 
  },
  "quadrantTitles": {
    "q1": "Languages and frameworks",
    "q2": "Platforms",
    "q3": "Tools",
    "q4" :"Techniques"
  }
}
```
</details>
<details>
  <summary>yaml</summary>

```yaml
meta:
  title: tech radar js
  date: "2021-06-11"
data:
  -
    name: TypeScript
    quadrant: languages-and-frameworks
    ring: Adopt
    description: Статически типизированный ЖС
    moved: 1
  -
    name: Nodejs
    quadrant: Platforms
    ring: Adopt
    description:
    moved:
  -
    name: codeclimate
    quadrant: tools
    ring: Trial
    description: Статический анализатор кода
    moved: 0
  -
    name: Гексагональная архитектура
    quadrant: Techniques
    ring: Assess
    description: Унификации контракта интерфейсов различных слоев приложений
    moved: -1
quadrantAliases:
  q1: 
    - languages-and-frameworks
    - lnf
    - lang
    - framework
  q2: platforms
  q3: tools
  q4: techniques
quadrantTitles:
  q1: Languages and frameworks
  q2: Platforms
  q3: Tools
  q4: Techniques
```

</details>
<details>
  <summary>csv</summary>

```
title
tech radar js
===
date
2021-06-18
===
name,                       quadrant,   ring,   description,                                                    moved
TypeScript,                 language,   Adopt,  "Статически, типизированный ЖС",                                1
Nodejs,                     Platforms,  Adopt,  ,
codeclimate,                tools,      Trial,  Статический анализатор кода,                                    0
Гексагональная архитектура, Techniques, Assess, Унификации контракта интерфейсов различных слоев приложений,    -1
===
quadrant,   alias
q1,         language
q1,         Languages-and-frameworks
q2,         Platforms
q3,         Tools
q4,         Techniques
===
quadrant,   title
q1,         Languages and frameworks
q2,         Platforms
q3,         Tools
q4,         Techniques
```
</details>

### CI/CD
Follow [gh-action usage example](https://github.com/qiwi/tech-radar/blob/master/.github/workflows/ci.yaml):
<details>
  <summary>publish radar to gh-pages</summary>

```yaml
jobs:
  publish:
    if: github.event_name == 'push' && github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup NodeJS
        uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm

      - name: Install deps
        run: npm ci

      - name: Generate
        run: npm run generate

      # Pushes dist/ to the gh-pages branch via ggcp (no third-party action).
      - name: Push to gh-pages
        env:
          GIT_COMMITTER_NAME: ${{ secrets.GIT_COMMITTER_NAME }}
          GIT_COMMITTER_EMAIL: ${{ secrets.GIT_COMMITTER_EMAIL }}
        run: |
          npx ggcp 'dist>**/*' https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}.git/gh-pages --message='docs: update tech-radar static'
```
</details>
<details>
  <summary>generator scripts (single renderer)</summary>

```json
// Zalando — needs base-prefix matching the deployment path and an explicit
// nav-page if you want the scope listing at the root.
"scripts": {
  "generate": "node ./src/cli.mjs --renderer zalando --input \"data/**/*.{csv,json,yml}\" --output dist --base-prefix tech-radar --autoscope true --nav-page true && touch dist/.nojekyll"
}

// Aurora — relative URLs, no nav-page (scope tabs are built in); an optional
// --about file enables the overview screen.
"scripts": {
  "generate": "node ./src/cli.mjs --renderer aurora --input \"data/**/*.{csv,json,yml}\" --output dist --autoscope true --about data/about.md && touch dist/.nojekyll"
}
```
</details>

<details>
  <summary>generator scripts (dual-renderer demo — this repo)</summary>

This repo deploys both renderers side-by-side under one gh-pages site. Each lands in its own subfolder; the root and old per-scope URLs forward to v2 (the maintained default) so any external link to the pre-dual-renderer layout still resolves.

```json
"scripts": {
  "generate":      "npm run gen:zalando && npm run gen:aurora && npm run gen:redirects && touch dist/.nojekyll",
  "gen:zalando":   "node ./src/cli.mjs --renderer zalando --input \"data/**/*.{csv,json,yml}\" --output dist/v1 --base-prefix tech-radar/v1 --autoscope true --nav-page true",
  "gen:aurora":    "node ./src/cli.mjs --renderer aurora  --input \"data/**/*.{csv,json,yml}\" --output dist/v2 --autoscope true --about data/about.md",
  "gen:redirects": "node scripts/redirects.mjs"
}
```

Notes:
- **`--base-prefix tech-radar/v1`** matches the deployment path. The classic renderer bakes the prefix into absolute links it builds at runtime, so it has to know the subfolder. Aurora uses relative URLs only and doesn't need a prefix.
- **`--about data/about.md`** turns on the radar-overview page on the aurora demo (markdown is fine; `.html` files are embedded as-is).
- **`dist/.nojekyll`** is created once at the end so gh-pages doesn't run jekyll on the output.
- **`scripts/redirects.mjs`** writes a single meta-refresh stub at `dist/index.html` pointing at `v2/`, so external links to the gh-pages root keep landing on a working radar.

</details>

## Customization

### Renderers
The same input data can be rendered into two different output styles. Pick one with the `renderer` option (or `--renderer` flag) — the rest of the Customization subsections call out which renderer they apply to.

| `renderer`            | Schema       | Description                                                                                                                                                                                                                       |
|-----------------------|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `zalando` *(default)* | `4x4` only   | Classic Zalando-style radar built via 11ty + d3. Customisable through `renderSettings` and a templates directory (see below). Fixed at 4 quadrants × 4 rings (`adopt/trial/assess/hold`) — radars in any other shape are rejected at dispatch time. |
| `aurora`              | `4x4` + flex | Self-contained pure-SVG renderer. Dark/light themes + colour/mono chroma cycled via a single topbar toggle, deterministic entry placement, built-in per-scope timeline, hover details, sidebar legend, optional About page. Accepts any 2–8 sectors × 2–8 rings layout (see *Sectors and rings*). No client-side d3, no runtime. |

```shell
# Zalando (default) — generate a nav-page and the classic d3 radar
techradar --input "data/**" --output dist --autoscope --nav-page

# Aurora — overview page, no generator credit in the legend
techradar --input "data/**" --output dist --renderer aurora --autoscope \
          --about ./docs/about.md --credits false
```

```js
await run({
  input: 'data/**',
  output: 'dist',
  renderer: 'aurora',
  autoscope: true,
  about: './docs/about.md', // optional radar overview, surfaced via the `?` icon
  credits: false,           // suppress "QIWI ❤ Open Source"
})
```

### Sectors and rings
*Applies to: **`aurora`** for any count; **`zalando`** is restricted to the 4×4 case.*

Aurora supports variable shapes — **2 to 8 sectors × 2 to 8 rings**. The data file declares them via two optional sections; both are mirrored on the existing `quadrant,*` and ring conventions so legacy radars keep working.

**Declare sectors** with `sector,title` rows (id is `s1..s8`, in order). Aliases follow the same pattern as legacy `quadrant,alias`:

```csv
sector, title
s1,     Backend
s2,     Frontend
s3,     Mobile
s4,     Data
s5,     Infra
s6,     QA

sector, alias
s1,     backend-platform
```

**Declare rings** with `ring,title` rows (id is `r1..r8`, ordered inner → outer):

```csv
ring,   title
r1,     Use
r2,     Try
r3,     Stop
```

Then entries reference either ids or titles (case-insensitive):

```csv
name,      sector,   ring,   description,            moved
Java,      s1,       Use,    Backend lang,           0
React,     frontend, Try,    UI library,             1
```

JSON/YAML use the same shape — `sectors: [{ id, title, aliases? }]` and `rings: [{ id, title }]`.

**If the data uses only the legacy `quadrant,*` sections + standard ring names (`adopt`, `trial`, `assess`, `hold`)**, the parser produces both the new `sectors/rings` arrays AND the legacy `quadrantTitles/quadrantAliases` view — that radar can be rendered by either backend. The dispatch layer (`src/renderer/index.js`) rejects flex radars from zalando with a clear error pointing at aurora.

**Ring auto-derivation.** If a radar has no explicit `ring,title` section, rings are inferred from the unique values in the entries' `ring` column. When all match the legacy set, the canonical adopt/trial/assess/hold order is preserved. Otherwise: first-seen order with `r1..rN` ids.

### Group labels
*Applies to: **any** renderer.* Every radar document provides its own definition of what each section represents — override the titles per radar. Legacy `quadrant,*` syntax for the 4-sector case:

```csv
quadrant,   title
q1,         Languages and frameworks
q2,         Platforms
q3,         Tools
q4,         Techniques
```

New `sector,*` syntax for the same effect (or for non-4 layouts):

```csv
sector, title
s1,     Languages and frameworks
s2,     Platforms
s3,     Tools
s4,     Techniques
```

### Ring colors
*Applies to: **`zalando`** only.* The classic renderer reads a `renderSettings` object that the underlying d3 radar consumes for sector fills, ring labels and canvas size:
```json
{
  "svg_id": "radar",
  "width": 1450,
  "height": 1100,
  "colors": {
    "background": "#fff",
    "grid": "#bbb",
    "inactive": "#ddd"
  },
  "rings": [
    { "name": "ADOPT", "color": "#93c47d", "id": "adopt" },
    { "name": "TRIAL", "color": "#93d2c2", "id": "trial" },
    { "name": "ASSESS", "color": "#fbdb84", "id": "assess" },
    { "name": "HOLD", "color": "#efafa9", "id": "hold" }
  ],
  "print_layout": true
}
```

Aurora ignores `renderSettings` — its palette is theme-driven (CSS custom properties); see *Aurora theming* below.

### Templates
*Applies to: **`zalando`** only.* For advanced view modification, point the `templates` option at a directory of njk/11ty files. The directory is merged on top of the bundled templates (matching files override). Expected structure:
```
assets/
  favicon.ico
  radar.css
  radar.js
_data/
  settings.json
_includes/
  footer.njk
  legend.njk
_layouts/
  entries.njk
  page.njk
  radar.njk
  redirect.njk
  root.njk
  table.njk
entries/
  entries.11tydata.json   # applies to all entry .md files (layout, tags)
  q1/q1.11tydata.json     # quadrant index per directory: { "quadrant": 0 }
  q2/q2.11tydata.json     # ...                                       1
  q3/q3.11tydata.json     # ...                                       2
  q4/q4.11tydata.json     # ...                                       3
```

### Aurora theming
*Applies to: **`aurora`** only.* The renderer ships its own CSS and JS as static assets (`<output>/aurora.css`, `<output>/aurora.js`) and is **not** template-customisable. To tweak the visuals:

- **Global tokens** live in [`src/renderer/aurora/styles.js`](src/renderer/aurora/styles.js) — surface colours (`--bg`, `--fg`, `--accent`, `--line` …), spacing, theme-specific overrides (`[data-theme="light"]`, `[data-chroma="mono"]`), legend/timeline/topbar styling.
- **Per-sector colours** are computed per radar and emitted as a `<style>` block inside the page itself (see `renderPalette()` in [`pages.js`](src/renderer/aurora/pages.js)). Tokens: `--s{N}-accent` (labels/strokes), `--s{N}-fill` (blip body — same as accent on dark, vivid on light+colour), `--s{N}-grad-0/1` (sector wash gradient stops). The base hue rotates `360°/N` between sectors starting from `BASE_HUE` in [`geometry.js`](src/renderer/aurora/geometry.js); change `BASE_HUE` to shift the whole palette.
- **Geometry** also lives in `geometry.js` — `buildRings()` lays out M rings evenly across `MAX_RADIUS`, `buildSectors()` distributes N angular slices. Blip placement constants (`MIN_DIST`, `MAX_ATTEMPTS`) are in the same file.

The theme/chroma user choice is persisted in `localStorage.aurora-prefs` and applied via inline `<script>` before the stylesheet runs, so there is no FOUC.

## Contributing
Feel free to open new issues: bug reports, feature requests or questions.
You're always welcome to suggest a PR. Just fork this repo, write some code, add some tests and push your changes.
Any feedback is appreciated.

### Update the radar data
1. Clone the repo: `git clone git@github.com:qiwi/tech-radar.git`
2. Install deps: `npm install`
3. Place a new radar data file to `data/<scope>/<date>.{csv|json|yaml}`
4. Fill it as shown in [examples](#input-examples) / [its siblings](https://github.com/qiwi/tech-radar/tree/master/data)
5. Run `npm run generate && npm run preview`
6. Follow [http://localhost:3000/](http://localhost:3000/). Assess the result
7. Push commit and create a pull request

### Enhance the generator
1. Clone the repo: `git clone git@github.com:qiwi/tech-radar.git`
2. Install deps: `npm install`
3. Make some changes in `src/`
4. Put some tests to `test/`
5. Run `npm test`
6. Repeat if necessary steps 1 to 3
7. Push commit and create a pull request

## Alternatives
* [https://github.com/thoughtworks/build-your-own-radar](https://github.com/thoughtworks/build-your-own-radar)
* [https://github.com/zalando/tech-radar](https://github.com/zalando/tech-radar)
* [https://www.npmjs.com/package/@backstage/plugin-tech-radar](https://www.npmjs.com/package/@backstage/plugin-tech-radar)

## License
[MIT](./LICENSE)
