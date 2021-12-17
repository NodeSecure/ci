#!/usr/bin/env node

import kleur from "kleur";
import { runPipelineChecks } from "../src/main.js";

runPipelineChecks()
  .then(() => {
    console.log(
      kleur.green().bold("[SUCCESS] @nodesecure/ci passed all the checks.")
    );
  })
  .catch((uncaughtException) => {
    console.log(
      kleur.green().bold("[ERROR] @nodesecure/ci unexpectedly exited.")
    );
    console.error(uncaughtException);
    process.exit(1);
  })
  .finally(() => {
    console.log(kleur.yellow().bold("[END] @nodesecure/ci ended."));
  });
