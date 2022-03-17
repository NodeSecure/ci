import type { OutcomePayloadFromPipelineChecks } from "../../analysis";
import { Nsci } from "../../configuration/standard/index.js";

import * as postPipelineReporting from "./post-pipeline/index.js";
import { Reporter } from "./reporter";

function initializeReporter(
  reporter: Nsci.ReporterTarget
): Reporter<OutcomePayloadFromPipelineChecks & Nsci.Configuration, void> {
  return reporter === Nsci.reporterTarget.CONSOLE
    ? postPipelineReporting.consoleReporter
    : postPipelineReporting.htmlReporter;
}

export async function runReporting(
  payload: OutcomePayloadFromPipelineChecks,
  rc: Nsci.Configuration
): Promise<void> {
  const reportersTasks = rc.reporters.map((reporter) => {
    const { report } = initializeReporter(reporter);

    return report({ ...payload, ...rc });
  });

  await Promise.all(reportersTasks);
}
