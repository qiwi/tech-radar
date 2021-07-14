<p align="center">
  <a href="https://github.com/qiwi">
    <img alt="Tech-radar" src="https://github.com/qiwi/tech-radar/blob/master/img/radar.png?raw=true?raw=true" width="546">
  </a>
</p>

<h2 align="center">
  @qiwi/tech-radar
</h2>

Tech-radar generator. Based on [zalando/tech-radar](https://github.com/zalando/tech-radar). Boosted with [11ty](https://github.com/11ty/eleventy/)

## QIWI radars:
* [iOS Tech Radar](https://qiwi.github.io/tech-radar/ios-2021-06-21/) 

* [JS Tech Radar](https://qiwi.github.io/tech-radar/js-2021-06-21/)

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

## JS API
```js
import {run} from '@qiwi/tech-radar'

await run({
  input : 'data/*.{csv,json,yml}',
  output : 'dist',
  basePrefix: 'your project',
  autoscope: false
})
```

## License
MIT
