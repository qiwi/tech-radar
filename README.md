<p align="center">
  <a href="https://github.com/qiwi">
    <img alt="Tech-radar" src="https://github.com/qiwi/tech-radar/blob/master/img/radar.png?raw=true?raw=true" width="546">
  </a>
</p>

<center>
<h2>
  @qiwi/tech-radar
</h2>

[![CI](https://github.com/qiwi/tech-radar/workflows/CI/badge.svg)](https://github.com/qiwi/tech-radar/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/b04b40063c8974a8ca31/maintainability)](https://codeclimate.com/github/qiwi/tech-radar/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b04b40063c8974a8ca31/test_coverage)](https://codeclimate.com/github/qiwi/tech-radar/test_coverage)  
Fully automated tech-radar generator. Based on [zalando/tech-radar](https://github.com/zalando/tech-radar). Boosted with [11ty](https://github.com/11ty/eleventy/)
</center>


## 📡 Radars
* [QIWI Tech Radars](https://qiwi.github.io/tech-radar/)
  * [iOS](https://qiwi.github.io/tech-radar/ios/)
  * [JS](https://qiwi.github.io/tech-radar/js/)
  * [Backend](https://qiwi.github.io/tech-radar/backend/)
  * [QA](https://qiwi.github.io/tech-radar/qa/)

## Requirements
* Node.js >= 12.20 (esm)
* Mac / linux

## Install
```shell
yarn add @qiwi/tech-radar
```

## Usage
### CLI
```
techradar --input "/path/to/files/*.{json, csv, yml}" --output /radar
npx @qiwi/tech-radar --input "/path/to/files/*.{json, csv, yml}" --output /radar
```

| Option | Description | Default
|---|---|---
| cwd | Current working dir | `process.cwd()`
| input | [glob pattern](https://github.com/mrmlnc/fast-glob) to find radar data: csv/json/yml | `<cwd>/data/**/*.{json,csv,yml}`
| output | Output directory | `<cwd>/radar`
| autoscope | idenfify same-scoped files as subversions of a single radar | `false`
| base-prefix | base context path for web statics | `tech-radar`
| nav-page | create navigation page | `false`
| nav-title | navigation page title | 
| nav-footer | navigation page footer |
| temp | temporary assets dir | [`tempy.directory()`](https://github.com/sindresorhus/tempy)

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
### Examples of input files
#### json
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
    "languages-and-frameworks": "q1",
    "platforms": "q2",
    "tools": "q3",
    "techniques": "q4"
  },
  "quadrantTitles": {
    "q1": "Languages and frameworks",
    "q2": "Platforms",
    "q3": "Tools",
    "q4" :"Techniques"
  }
}
```
#### yaml
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
  languages-and-frameworks: q1
  platforms: q2
  tools: q3
  techniques: q4
quadrantTitles:
  q1: Languages and frameworks
  q2: Platforms
  q3: Tools
  q4: Techniques
```
#### csv
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

## License
MIT
