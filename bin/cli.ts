#!/usr/bin/env node

import sade from "sade";

import * as RC from "../src/config/nodesecurerc.js";
import { runPipeline } from "../src/pipeline/run.js";

function joinExclusiveList<T>(items: T) {
  return `'${Object.values(items).join(" | ")}'`;
}

const availableVulnThresholds = joinExclusiveList(RC.vulnSeverity);
const availableWarnings = joinExclusiveList(RC.warnings);
const availableStrategies = joinExclusiveList(RC.vulnStrategy);
const availableReporters = joinExclusiveList(RC.reporterTarget);

const program = sade("nsci", true);

program
  .option(
    "-d, --directory",
    "Root directory from which the analyses will be run.",
    process.cwd()
  )
  .example("cli.js --directory=/Users/user1/myproject")

  .option(
    "-s, --strategy",
    `@nodesecure/vuln vulnerability strategy. Can be ${availableStrategies}`,
    RC.vulnStrategy.NPM
  )
  .example("cli.js --strategy=NPM_AUDIT")

  .option(
    "-v, --vulnerability",
    `Vulnerability severity threshold. Can be ${availableVulnThresholds})`,
    RC.vulnSeverity.ALL
  )
  .example("cli.js --severity=all")

  .option(
    "-w, --warnings",
    `Action when detecting warnings. Can be ${availableWarnings}`,
    RC.warnings.ERROR
  )
  .example("cli.js --warnings=off")

  .option(
    "-r, --reporters",
    `Pipeline reporters. Can be ${availableReporters}`,
    RC.reporterTarget.CONSOLE
  )
  .example("cli.js --reporters=console,html")

  .describe(
    "Run @nodesecure pipeline checks to hunt vulnerabilities for both source code and dependencies"
  )
  .action(runPipeline);

program.parse(process.argv);
