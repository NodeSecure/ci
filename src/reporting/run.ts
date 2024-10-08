// Import Third-party Dependencies
import * as Scanner from "@nodesecure/scanner";
import * as Vulnera from "@nodesecure/vulnera";

// Import Internal Dependencies
import { consolePrinter } from "../../lib/console-printer/index.js";
import {
  type OutcomePayloadFromPipelineChecks,
  runPayloadInterpreter
} from "../analysis/index.js";
import {
  type ApiConfig,
  type CliConfig,
  defaultExternalConfigOptions,
  useRuntimeConfig,
  Nsci
} from "../configuration/index.js";
import type { Maybe } from "../types/index.js";

import { scannerReporter, runReporting } from "./reporters/index.js";
import { status } from "./status.js";

async function runScannerAnalysis(
  runtimeConfig: Nsci.Configuration
): Promise<Scanner.Payload> {
  const { strategy } = await Vulnera.setStrategy(
    Vulnera.strategies[runtimeConfig.strategy]
  );

  /**
   * Using a Generator here allows to centralize different reporting steps that
   * should occur at a different moments in time, in a controlled way and in
   * a deterministic order. At any given moment in time we can Push the required
   * data for reporting to the Generator.
   */
  const initScannerReporter = scannerReporter.report(void 0);
  const logger = new Scanner.Logger();
  const sequentialReporterWithLogger = initScannerReporter(logger);

  // First step of the reporting
  sequentialReporterWithLogger.next();

  const payload = await Scanner.cwd(
    runtimeConfig.rootDir,
    {
      vulnerabilityStrategy: strategy
    },
    logger
  );

  /**
   * Second step of the reporting, providing the reporter returned payload
   * from scanner cwd() function.
   */
  sequentialReporterWithLogger.next(payload);
  sequentialReporterWithLogger.return(void 0);

  return payload;
}

function provideErrorCodeToProcess(): void {
  /**
   * Rather than exiting manually with process.exit() which could result in
   * async operations being aborted, we set the exitCode to 1 (native error code).
   * Consequently, the process can exit gracefully when all tasks are done,
   * whatever the exitCode is.
   */
  process.exitCode = 1;
}

async function runPayloadChecks(
  payload: Scanner.Payload,
  rc: Nsci.Configuration,
  autoExitAfterFailure: boolean
): Promise<Maybe<OutcomePayloadFromPipelineChecks>> {
  const interpretedPayload = runPayloadInterpreter(payload, rc);
  await runReporting(interpretedPayload, rc);

  if (interpretedPayload.status === status.FAILURE && autoExitAfterFailure) {
    provideErrorCodeToProcess();
  }

  return interpretedPayload;
}

type PipelineOptions = (ApiConfig | CliConfig) & {
  autoExitAfterFailure: boolean;
};

export async function runPipeline(
  options: PipelineOptions = {
    ...defaultExternalConfigOptions,
    autoExitAfterFailure: true
  }
): Promise<Maybe<OutcomePayloadFromPipelineChecks>> {
  try {
    const defaultAutoExitAfterFailure =
      (options && options.autoExitAfterFailure) ?? true;
    const runtimeConfig = await useRuntimeConfig(options);
    const analysisPayload = await runScannerAnalysis(runtimeConfig);

    /**
     * Once the payload generated by the scanner analysis is available, we can
     * now run the interpreter and use the config to determine whether the
     * pipeline should fail or be successful.
     */
    return await runPayloadChecks(
      analysisPayload,
      runtimeConfig,
      defaultAutoExitAfterFailure
    );
  }
  catch (uncaughtError: any) {
    consolePrinter.font
      .standard(uncaughtError.message)
      .prefix(consolePrinter.font.highlightedError("error").message)
      .printWithEmptyLine();

    provideErrorCodeToProcess();

    return void 0;
  }
}
