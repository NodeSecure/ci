#!/usr/bin/env node

import { runPipelineChecks } from "../src/main.js";

try {
  await runPipelineChecks()
} catch {}
