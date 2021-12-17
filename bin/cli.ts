#!/usr/bin/env node

import kleur from "kleur";
import { runPipelineChecks } from "../src/main.js";

runPipelineChecks()
  .then(() => {
    console.log(
      kleur.green().bold("[SUCCESS] @nodesecure/ci passed all the checks.")
    );
  })
  .catch(() => {
    console.log(
      kleur.red().bold("[ERROR] @nodesecure/ci unexpected error caught.")
    );
  })
  .finally(() => {
    console.log(kleur.yellow().bold("[END] @nodesecure/ci ended."));
  });
