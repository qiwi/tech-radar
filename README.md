<div align="center">

  <a href="https://qiwi.github.io/tech-radar/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/qiwi/tech-radar/no-zalando/dark.png">
      <img alt="" src="https://raw.githubusercontent.com/qiwi/tech-radar/no-zalando/light.png">
    </picture>
  </a>

## [📡 QIWI](https://qiwi.github.io/tech-radar/) • [Android](https://qiwi.github.io/tech-radar/android/) • [Backend](https://qiwi.github.io/tech-radar/backend/) • [iOS](https://qiwi.github.io/tech-radar/ios/) • [ISEC](https://qiwi.github.io/tech-radar/isec/) • [JS](https://qiwi.github.io/tech-radar/js/) • [OPS](https://qiwi.github.io/tech-radar/ops/) • [QA](https://qiwi.github.io/tech-radar/qa/)

[![CI](https://github.com/qiwi/tech-radar/workflows/CI/badge.svg)](https://github.com/qiwi/tech-radar/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/b04b40063c8974a8ca31/maintainability)](https://codeclimate.com/github/qiwi/tech-radar/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b04b40063c8974a8ca31/test_coverage)](https://codeclimate.com/github/qiwi/tech-radar/test_coverage)
[![npm (scoped)](https://img.shields.io/npm/v/@qiwi/tech-radar?color=09e)](https://www.npmjs.com/package/@qiwi/tech-radar)

Fully automated tech-radar generator.

</div>

## Purpose

[Zalando's answer](https://opensource.zalando.com/tech-radar/):

> The Tech Radar is a tool to inspire and support engineering teams at Zalando to pick the best technologies for new
> projects; it provides a platform to share knowledge and experience in technologies, to reflect on technology decisions
> and continuously evolve our technology landscape. Based on the pioneering work of ThoughtWorks, our Tech Radar sets
> out
> the changes in technologies that are interesting in software development — changes that we think our engineering teams
> should pay attention to and consider using in their projects.

## Usage

### CLI

```
npx @qiwi/tech-radar -i input -o output
```

| Option | Description                                                         |
|--------|---------------------------------------------------------------------|
| input  | Input directory containing radar.json and other stuff (favicon.ico) |
| output | Output directory                                                    |

## Examples

- [Single radar](https://raw.githubusercontent.com/qiwi/tech-radar/no-zalando/src/main/radar/radar.js.json)
- [Separated radars](https://raw.githubusercontent.com/qiwi/tech-radar/no-zalando/src/main/radar/radar.json)

## Customization 🚧

- Sector colors
- Status size and thick
- Almost unlimited number of sectors, statuses and items

## CI/CD

```yaml
name: Release
on:
  push:
    branches:
      - master
jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup
        uses: actions/setup-node@v3
      - name: Build
        run: npx @qiwi/tech-radar -i input -o output
      - name: Publish
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./output
          commit_message: "docs: update tech-radar static"
          allow_empty_commit: true
          enable_jekyll: false
```

## Alternatives

* [https://github.com/aoepeople/aoe_technology_radar](https://github.com/aoepeople/aoe_technology_radar)
* [https://github.com/thoughtworks/build-your-own-radar](https://github.com/thoughtworks/build-your-own-radar)
* [https://github.com/zalando/tech-radar](https://github.com/zalando/tech-radar)
* [https://www.npmjs.com/package/@backstage/plugin-tech-radar](https://www.npmjs.com/package/@backstage/plugin-tech-radar)

## License

[MIT](./LICENSE)
