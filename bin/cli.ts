#!/usr/bin/env node

// Import Third-party Dependencies
import sade from "sade";

// Import Internal Dependencies
import { generateDefaultNodeSecureConfig } from "../src/configuration/index.js";
import { Nsci } from "../src/configuration/standard/index.js";
import { runPipeline } from "../src/reporting/run.js";

function joinExclusiveList<T extends Record<string, string>>(items: T): string {
  return Object.values(items).join(" | ");
}

const availableVulnThresholds = joinExclusiveList(Nsci.vulnSeverity);
const availableWarnings = joinExclusiveList(Nsci.warnings);
const availableStrategies = joinExclusiveList(Nsci.vulnStrategy);
const availableReporters = joinExclusiveList(Nsci.reporterTarget);

const program = sade("nsci");

program
  .command("init")
  .example("cli.js init")
  .action(generateDefaultNodeSecureConfig);

program
  .command("run")
  .option(
    "-d, --directory",
    "Root directory from which the analyses will be run.",
    process.cwd()
  )
  .example("cli.js run --directory=/Users/user1/myproject")

  .option(
    "-s, --strategy",
    `@nodesecure/vuln vulnerability strategy. Can be '${availableStrategies}'`,
    Nsci.vulnStrategy.npm
  )
  .example("cli.js run --strategy=npm")

  .option(
    "-v, --vulnerabilities",
    `Vulnerability severity threshold. Can be '${availableVulnThresholds})'`,
    Nsci.vulnSeverity.MEDIUM
  )
  .example("cli.js run --vulnerabilities=medium")

  .option(
    "-w, --warnings",
    `Action when detecting warnings. Can be '${availableWarnings}'`,
    Nsci.warnings.ERROR
  )
  .example("cli.js run --warnings=off")

  .option(
    "-r, --reporters",
    `Pipeline reporters. Can be '${availableReporters}'`,
    Nsci.reporterTarget.CONSOLE
  )
  .example("cli.js run --reporters=console,html")

  .describe(
    "Run @nodesecure pipeline checks to hunt vulnerabilities for both source code and dependencies"
  )
  .action(runPipeline);

program.parse(process.argv);
