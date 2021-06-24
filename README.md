# @qiwi/tech-radar

Tech radar generator

## Usage

```
yarn add @qiwi/tech-radar
techradar  --csv-path /path/to/csv --out-dir /radar --versions 1.00 --pathPrefix js
```
or
```
npx @qiwi/tech-radar --csvPath /path/to/csv --outDir /radar --versions 1.00 --pathPrefix js
```

| Args | description |
|---|---
| csvPath | path to csv file
| outDir |
| versions |
| pathPrefix |

## 🧑🏼‍💻 Development
| | Command |
|---|---
| Install | `yarn install`
| Edit | Specifically have a look at `.eleventy.js` to see if you want to configure
| Build | `yarn build` or just `eleventy`
| Preview | `eleventy --serve`
| Debug | `DEBUG=* eleventy`
