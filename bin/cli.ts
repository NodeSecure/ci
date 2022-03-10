#!/usr/bin/env node

import sade from "sade";

import { Nsci } from "../src/config/standard/index.js";
import { runPipeline } from "../src/pipeline/run.js";

function joinExclusiveList<T>(items: T) {
  return Object.values(items).join(" | ");
}

const availableVulnThresholds = joinExclusiveList(Nsci.vulnSeverity);
const availableWarnings = joinExclusiveList(Nsci.warnings);
const availableStrategies = joinExclusiveList(Nsci.vulnStrategy);
const availableReporters = joinExclusiveList(Nsci.reporterTarget);

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
    `@nodesecure/vuln vulnerability strategy. Can be '${availableStrategies}'`,
    Nsci.vulnStrategy.npm
  )
  .example("cli.js --strategy=npm")

  .option(
    "-v, --vulnerabilities",
    `Vulnerability severity threshold. Can be '${availableVulnThresholds})'`,
    Nsci.vulnSeverity.MEDIUM
  )
  .example("cli.js --vulnerabilities=medium")

  .option(
    "-w, --warnings",
    `Action when detecting warnings. Can be '${availableWarnings}'`,
    Nsci.warnings.ERROR
  )
  .example("cli.js --warnings=off")

  .option(
    "-r, --reporters",
    `Pipeline reporters. Can be '${availableReporters}'`,
    Nsci.reporterTarget.CONSOLE
  )
  .example("cli.js --reporters=console,html")

  .describe(
    "Run @nodesecure pipeline checks to hunt vulnerabilities for both source code and dependencies"
  )
  .action(runPipeline);

program.parse(process.argv);
