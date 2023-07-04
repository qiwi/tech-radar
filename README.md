<p align="center">
  <a href="https://qiwi.github.io/tech-radar/">
    <img alt="Tech-radar" src="https://github.com/qiwi/tech-radar/blob/master/img/radar.png?raw=true?raw=true" width="546">
  </a>
</p>

<div align="center"><h2>

[📡 QIWI](https://qiwi.github.io/tech-radar/) • [Android](https://qiwi.github.io/tech-radar/android/) • [Backend](https://qiwi.github.io/tech-radar/backend/) • [iOS](https://qiwi.github.io/tech-radar/ios/) • [ISEC](https://qiwi.github.io/tech-radar/isec/) • [JS](https://qiwi.github.io/tech-radar/js/) • [OPS](https://qiwi.github.io/tech-radar/ops/) • [QA](https://qiwi.github.io/tech-radar/qa/)
</h2>

[![CI](https://github.com/qiwi/tech-radar/workflows/CI/badge.svg)](https://github.com/qiwi/tech-radar/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/b04b40063c8974a8ca31/maintainability)](https://codeclimate.com/github/qiwi/tech-radar/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b04b40063c8974a8ca31/test_coverage)](https://codeclimate.com/github/qiwi/tech-radar/test_coverage)
[![npm (scoped)](https://img.shields.io/npm/v/@qiwi/tech-radar?color=09e)](https://www.npmjs.com/package/@qiwi/tech-radar)

Fully automated tech-radar generator. Based on [zalando/tech-radar](https://github.com/zalando/tech-radar). Boosted with [11ty](https://github.com/11ty/eleventy/)
</div>

## Purpose
[Zalando's answer](https://opensource.zalando.com/tech-radar/):
> The Tech Radar is a tool to inspire and support engineering teams at Zalando to pick the best technologies for new projects; it provides a platform to share knowledge and experience in technologies, to reflect on technology decisions and continuously evolve our technology landscape. Based on the pioneering work of ThoughtWorks, our Tech Radar sets out the changes in technologies that are interesting in software development — changes that we think our engineering teams should pay attention to and consider using in their projects.

We've just _slightly_ modified [the original implementation](https://github.com/zalando/tech-radar) for our bloody enterprise requirements.

## Table of contents
- [Getting started](#getting-started)
  - [Key features](#key-features)
  - [Requirements](#requirements)
  - [Install](#install)
  - [Usage](#usage)
    - [CLI](#cli)
    - [JS API](#js-api)
    - [Input-examples](#input-examples)
    - [CI/CD](#cicd)
  - [Customization](#customization)
- [Contributing](#contributing)
  - [Add new data](#add-new-radar-data)
  - [Enhance the generator](#enhance-the-generator)
- [Alternatives](#alternatives)
- [License](#license)

## Key features
* Builds radars by `csv`, `json` or `yaml` data
* Renders a separate description page for each radar entry
* Compares radars of the same scope with each other and shows the movement of points
* Assembles all the radars refs on the main navigation page
* Redirects scope urls to the latest version of their radars
* CLI / JS / TS API

## Requirements
* Node.js >= 14.13
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

| Option      | Description                                                                                                       | Default                                                      |
|-------------|-------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|
| cwd         | Current working dir                                                                                               | `process.cwd()`                                              |
| input       | [glob pattern](https://github.com/mrmlnc/fast-glob) to find radar data: csv/json/yml                              | `<cwd>/data/**/*.{json,csv,yml}`                             |
| output      | Output directory                                                                                                  | `<cwd>/radar`                                                |
| autoscope   | identify same-scoped files as subversions of a single radar                                                       | `false`                                                      |
| base-prefix | base context path for web statics                                                                                 | `tech-radar`                                                 |
| nav-page    | create navigation page                                                                                            | `false`                                                      |
| nav-title   | navigation page title                                                                                             | `📡 Tech radars`                                             |
| nav-footer  | navigation page footer                                                                                            |                                                              |
| temp        | temporary assets dir                                                                                              | [`tempy.directory()`](https://github.com/sindresorhus/tempy) |
| templates   | custom `11ty/nunjucks` compatible templates directory. Its contents will be merged into the default templates dir |

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
  <summary>release_radar action</summary>

```yaml
  release_radar:
    name: Publish radar to gh-pages
    # https://github.community/t/trigger-job-on-tag-push-only/18076
    if: github.event_name == 'push' && github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Checkuout
        uses: actions/checkout@v2

      - name: Setup NodeJS
        uses: actions/setup-node@v2
        with:
          node-version: 16

      - name: Install deps
        run: yarn

      - name: Generate
        run: yarn generate

      - name: Publish gh-pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          commit_message: "docs: update tech-radar static"
          allow_empty_commit: true
          enable_jekyll: false
```
</details>
<details>
  <summary>generator script</summary>

```json
"scripts": {
  "generate": "node ./src/main/js/cli.mjs --input \"data/**/*.{csv,json,yml}\"  --output dist --base-prefix tech-radar --autoscope true --nav-page true && touch dist/.nojekyll"
},
```
</details>

## Customization
### Group labels
Every radar document provides its own definition of what each `quadrant` does represent. Change if necessary.
```csv
quadrant,   title
q1,         Languages and frameworks
q2,         Platforms
q3,         Tools
q4,         Techniques
```

### Ring colors
The easiest way to tweak up the look of your radar is by adding an alternative color scheme. `renderSettings` option is exactly for that:
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

### Templates
For advanced view modification, you can use your own templates. Pass `template` option to navigate the dir, where your own custom `.njk` files are placed. Expected structure:
```
assets
  favicon.ico
  radar.css
  radar.js
_data/
  settings.json
_includes
  footer.njk
_layouts
  entries.njk
  page.njk
  radar.njk
  redirect.njk
  root.njk
```

## Contributing
Feel free to open new issues: bug reports, feature requests or questions.
You're always welcome to suggest a PR. Just fork this repo, write some code, add some tests and push your changes.
Any feedback is appreciated.

### Update the radar data
1. Clone the repo: `git clone git@github.com:qiwi/tech-radar.git`
2. Install deps: `yarn install`
3. Place a new radar data file to `data/<scope>/<date>.{csv|json|yaml}`
4. Fill it as shown in [examples](#input-examples) / [its siblings](https://github.com/qiwi/tech-radar/tree/master/data)
5. Run `yarn generate && yarn preview`
6. Follow [http://localhost:3000/](http://localhost:3000/). Assess the result
7. Push commit and create a pull request

### Enhance the generator
1. Clone the repo: `git clone git@github.com:qiwi/tech-radar.git`
2. Install deps: `yarn install`
3. Make some changes in `src/main/js`
4. Put some tests to `src/test/js`
5. Run `yarn test`
6. Repeat if necessary steps 1 to 3
7. Push commit and create a pull request

## Alternatives
* [https://github.com/thoughtworks/build-your-own-radar](https://github.com/thoughtworks/build-your-own-radar)
* [https://github.com/zalando/tech-radar](https://github.com/zalando/tech-radar)
* [https://www.npmjs.com/package/@backstage/plugin-tech-radar](https://www.npmjs.com/package/@backstage/plugin-tech-radar)

## License
[MIT](./LICENSE)
