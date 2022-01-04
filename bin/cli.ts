#!/usr/bin/env node

import sade from "sade";

import { runPipeline } from "../src/pipeline/run.js";

const program = sade("nsci", true);

program
  .describe(
    "Run @nodesecure pipeline checks to hunt vulnerabilities for both source code and dependencies"
  )
  .action(runPipeline);

program.parse(process.argv);
