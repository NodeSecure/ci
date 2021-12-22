# Secure Continuous Integration
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/NodeSecure/ci/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/NodeSecure/ci/commit-activity)
[![Security Responsible Disclosure](https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg)](https://github.com/nodejs/security-wg/blob/master/processes/responsible_disclosure_template.md
)
[![mit](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/NodeSecure/rc/blob/master/LICENSE)

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/ci
# or
$ yarn add @nodesecure/ci
```

## Usage example

```bash
$ npm run nsci
```

Once the script is run, the @nodesecure/ci pipeline will look for dependencies warnings and vulnerabilities in the current working directory.
If any warning or dependency is met, the pipeline will eventually fail depending on the provided .nodesecurerc file.

<p align="center">
    <img src="https://user-images.githubusercontent.com/43391199/147159090-72a5f570-2091-4724-af34-21dd0ee6ca88.gif">
</p>

## Custom configuration

For now, the configuration is managed internally and is not yet configurable.
However, we aim to expose some sort of configuration like this:

```ts
{
  rootDir: string;
  strategy: "npm" | "node" // any kind of supported strategy by @nodesecure/vuln
  reporter: "console" | "html";
  rules: {
    vulnerabilities: {
        severity: "all" | "high" | "critical" | "medium" | "low" 
    },
    warnings: {
        "obfuscated-code": "error"
    } // by default, any warning caught by @nodesecure/scanner will fail the pipeline.
  }
};
```

## Reporters

For now, two reporters are targeted to work with the @nodesecure/ci.
- [x] Console
- [ ] HTML

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/antoine-coulon"><img src="https://avatars.githubusercontent.com/u/43391199?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Antoine</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=antoine-coulon" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Requirements
- [Node.js](https://nodejs.org/en/) >= v16

## License
MIT
