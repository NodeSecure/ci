#!/usr/bin/env node

import sade from "sade";

import { runPipeline } from "../src/main.js";

const program = sade("nsci", true);

program
  .describe(
    "Run @nodesecure pipeline checks for source code or dependencies vulnerabilities"
  )
  .action(runPipeline);

program.parse(process.argv);
