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
    <img src="https://user-images.githubusercontent.com/43391199/147015582-d343511a-1147-4176-b589-d4a48546e9ff.gif">
</p>

## Requirements
- [Node.js](https://nodejs.org/en/) >= v16

## License
MIT
