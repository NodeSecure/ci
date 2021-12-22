import * as vuln from "@nodesecure/vuln";
import * as scanner from "@nodesecure/scanner";
import type { Scanner } from "@nodesecure/scanner";

import {
  DEFAULT_RUNTIME_CONFIGURATION,
  RuntimeConfiguration
} from "./nodesecurerc.js";
import { runPayloadInterpreter } from "./payload/interpret.js";
import { initializeReporter } from "./reporters/reporter.js";
import { ReporterTarget } from "./reporters/index.js";
import { reportScannerLoggerEvents } from "./reporters/console/console.js";
import * as pipeline from "./pipeline.js";

async function runChecks(payload: Scanner.Payload, rc: RuntimeConfiguration) {
  const interpretedPayload = runPayloadInterpreter(payload, rc);
  const { report } = initializeReporter(rc.reporter);
  await report(interpretedPayload);

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

    if (runtimeConfig.reporter === ReporterTarget.CONSOLE) {
      reportScannerLoggerEvents(logger);
    }

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
