import * as RC from "../config/internal/nsci.js";
import type { OutcomePayloadFromPipelineChecks } from "../payload";

import * as postPipelineReporting from "./post-pipeline/index.js";

function initializeReporter(reporter: RC.ReporterTarget) {
  return reporter === RC.reporterTarget.CONSOLE
    ? postPipelineReporting.consoleReporter
    : postPipelineReporting.htmlReporter;
}

export async function runReporting(
  payload: OutcomePayloadFromPipelineChecks,
  rc: RC.Configuration
): Promise<void> {
  const reportersTasks = rc.reporters.map((reporter) => {
    const { report } = initializeReporter(reporter);

    return report({ ...payload, ...rc });
  });

  await Promise.all(reportersTasks);
}
