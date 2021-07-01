<p align="center">
  <a href="https://yarnpkg.com/">
    <img alt="Tech-radar" src="https://github.com/qiwi/tech-radar/blob/master/img/radar.png?raw=true?raw=true" width="546">
  </a>
</p>

<h2 align="center">
  @qiwi/tech-radar
</h2>

Tech-radar generator. Based on [zalando/tech-radar](https://github.com/zalando/tech-radar). Boosted with [11ty](https://github.com/11ty/eleventy/)

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
| temp | Temporary assets folder | `node_modules/.cache/@qiwi__tech-radar/<random>`

## JS API
```js
import {run} from '@qiwi/tech-radar'

await run({
  temp: './temp',
  input: 'data/*.csv'
})
```

## License
MIT
