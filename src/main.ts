import * as vuln from "@nodesecure/vuln";
import * as scanner from "@nodesecure/scanner";
import type { Scanner } from "@nodesecure/scanner";
import kleur from "kleur";

import {
  DEFAULT_RUNTIME_CONFIGURATION,
  RuntimeConfiguration
} from "./nodesecurerc.js";
import { PipelineStatus, runPayloadInterpreter } from "./payload/interpret.js";
import { initializeReporter } from "./reporters/reporter.js";
import { exitWithErrorCode } from "./pipeline/utils.js";

async function runChecks(payload: Scanner.Payload, rc: RuntimeConfiguration) {
  const interpretedPayload = runPayloadInterpreter(payload, rc);
  const { report } = initializeReporter(rc.reporter);
  await report(interpretedPayload);

  if (interpretedPayload.status === PipelineStatus.FAILURE) {
    // TODO: Move this Console print elsewhere
    console.log(kleur.red().bold("[FAILURE] @nodesecure/ci checks failed."));
    exitWithErrorCode();
  }
}

export async function runPipelineChecks(): Promise<void> {
  /**
   * For now, the runtime configuration comes from a in-memory constant.
   * In the future, this configuration will come from a .nodesecurerc parsed
   * at runtime.
   */
  const runtimeConfig = DEFAULT_RUNTIME_CONFIGURATION;
  const { strategy } = await vuln.setStrategy(
    vuln.strategies[runtimeConfig.strategy]
  );
  const payload = await scanner.cwd(runtimeConfig.rootDir, {
    vulnerabilityStrategy: strategy
  });
  await runChecks(payload, runtimeConfig);
}
