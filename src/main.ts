import * as vuln from "@nodesecure/vuln";
import * as scanner from "@nodesecure/scanner";
import type { Scanner } from "@nodesecure/scanner";

import {
  DEFAULT_RUNTIME_CONFIGURATION,
  RuntimeConfiguration
} from "./nodesecurerc.js";
import { runPayloadInterpreter } from "./payload/interpret.js";
import { runReporter, reportScannerLoggerEvents } from "./reporters/index.js";
import * as pipeline from "./pipeline.js";

async function runChecks(payload: Scanner.Payload, rc: RuntimeConfiguration) {
  const interpretedPayload = runPayloadInterpreter(payload, rc);
  await runReporter(interpretedPayload, rc);

  if (interpretedPayload.status === pipeline.status.FAILURE) {
    pipeline.fail();
  }
}

export async function runPipelineChecks(): Promise<void> {
  /**
   * For now, the runtime configuration comes from a in-memory constant.
   * In the future, this configuration will come from a .nodesecurerc parsed
   * at runtime.
   */
  try {
    const runtimeConfig = DEFAULT_RUNTIME_CONFIGURATION;
    const { strategy } = await vuln.setStrategy(
      vuln.strategies[runtimeConfig.strategy]
    );
    const logger = new scanner.Logger();

    reportScannerLoggerEvents(logger);

    const payload = await scanner.cwd(
      runtimeConfig.rootDir,
      {
        vulnerabilityStrategy: strategy
      },
      logger
    );

    await runChecks(payload, runtimeConfig);
  } catch {
    process.exit(1);
  }
}
