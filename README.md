# Secure Continuous Integration
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/NodeSecure/ci/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/NodeSecure/ci/commit-activity)
[![Security Responsible Disclosure](https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg)](https://github.com/nodejs/security-wg/blob/master/processes/responsible_disclosure_template.md
)
[![mit](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/NodeSecure/rc/blob/master/LICENSE)

## Installation

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/ci
# or
$ yarn add @nodesecure/ci
```

## Getting Started

@nodesecure/ci brings together a set of tools to identify dependencies vulnerabilities 
and track most common malicious code and patterns.

Before going further, here is an overview of the available features depending on
your project configuration:

| Static Analysis | Compatibility |
|------|--------------|
| JavaScript | ✅ |
| TypeScript | ❌ |

Static Analysis is powered by [@nodesecure/js-x-ray](https://github.com/NodeSecure/js-x-ray) and 
[@nodesecure/scanner](https://github.com/NodeSecure/scanner).

| Vulnerabilities Strategy | package-lock.json | yarn.lock |
|------|--------------|-----------|
| npm | ✅ | ❌ |
| node | ✅ | ✅ |

Vulnerabilities strategies are powered by [@nodesecure/vuln](https://github.com/NodeSecure/vuln).

## Usage example

@nodesecure/ci can be used as a Script or as an API (GitHub action coming soon).

### API

@nodesecure/ci exposes its pipeline runner as an API to allow use in any other combined workflow.

```ts
import { runPipeline } from "@nodesecure/ci";

const optionsExample = {
    directory: process.cwd(),
    strategy: "node",
    vulnerabilities: "all",
    warnings: "error",
    reporters: ["console"]
}

await runPipeline(optionsExample);
// => the process can either exit with error code (1) or no error code (0), depending on the pipeline status.
```

If you need a more fine-grained control over the pipeline process, you can
provide an "autoExitAfterFailure" property to the entry point options to manually 
exit or interpret the returned payload.

```ts
const { status, data } = await runPipeline({ autoExitAfterFailure: false });

if(status === 'success') {
  console.log('Congrats, your code passed all security checks!');
} else {
  console.log('Whoops, the pipeline failed to pass all checks :(');
  interpretData(data);
}
```

### Script

First, add the script in the package.json

```json
{
  "scripts": {
    "nsci": "nsci"
  }
}
```

Then run it

```bash
$ npm run nsci
 ```

Once the script is run, the @nodesecure/ci pipeline will look for dependencies warnings and vulnerabilities in the current working directory.
If any warning or dependency is met, the pipeline will eventually fail depending on the provided .nodesecurerc file.

<p align="center">
    <img src="https://user-images.githubusercontent.com/43391199/147159090-72a5f570-2091-4724-af34-21dd0ee6ca88.gif">
</p>

### Custom configuration

For now, the configuration is managed internally and is configurable through
the CLI (when using the tool as a script).

Add CLI options directly in the package.json script 

```json
{
  "scripts": {
    "nsci": "nsci --directory=/Users/user1/myproject"
  }
}
```

Or provide it from the "npm run [script]" command (don't forget to supply "--") or
the params will be applied to the "npm run [script]" command. 

```bash
$ npm run nsci -- --directory=/Users/user1/myproject
$ npm run nsci -- --strategy=npm
$ npm run nsci -- --vulnerability=all
$ npm run nsci -- --warnings=error
$ npm run nsci -- --reporters=console
```

Or use yarn (params are provided to the target script by default)

```bash
$ yarn nsci --reporters=console
```

To see all available options, you can run:
```bash
$ npm run nsci -- --help
```

In the future, we aim to expose some sort of configuration like this:

```ts
{
  rootDir: string;
  strategy: "npm" | "node" | "snyk" | "none" // any kind of supported strategy by @nodesecure/vuln
  reporters: ("console" | "html")[];
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

To know more about the future configuration, see [@nodesecure/rc](https://github.com/NodeSecure/rc)

## Reporters

Two reporters are targeted to work with the @nodesecure/ci. For now,
only the "Console" reporter is available.
- [x] Console
- [ ] HTML

## Requirements
- [Node.js](https://nodejs.org/en/) v16 or higher

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

## License
MIT
