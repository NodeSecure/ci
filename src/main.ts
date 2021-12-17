import * as vuln from "@nodesecure/vuln";
import * as scanner from "@nodesecure/scanner";
import type { Scanner } from "@nodesecure/scanner";

import {
  DEFAULT_RUNTIME_CONFIGURATION,
  RuntimeConfiguration
} from "./nodesecurerc.js";
import { PipelineStatus, runPayloadInterpreter } from "./payload/interpret.js";
import { initializeReporter } from "./reporters/reporter.js";
import { exitWithErrorCode } from "./pipeline/utils.js";

async function runChecks(payload: Scanner.Payload, rc: RuntimeConfiguration) {
  const interpretedPayload = runPayloadInterpreter(payload, rc);
  const reporter = initializeReporter(rc.reporter);
  reporter.report(interpretedPayload);

  if (interpretedPayload.status === PipelineStatus.FAILURE) {
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
