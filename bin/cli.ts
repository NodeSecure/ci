#!/usr/bin/env node

import sade from "sade";

import { runPipelineChecks } from "../src/main.js";

const program = sade("nci");

program
  .command("run")
  .describe(
    "Run @nodesecure pipeline checks for source code or dependencies vulnerabilities"
  )
  .action(runPipelineChecks);

program.parse(process.argv);
