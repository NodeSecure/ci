import * as RC from "../nodesecurerc.js";
import { InterpretedPayload } from "../payload";

import { consoleReporter } from "./console/index.js";
import { htmlReporter } from "./html/index.js";

function initializeReporter(reporter: RC.ReporterTarget) {
  return reporter === RC.reporterTarget.CONSOLE
    ? consoleReporter
    : htmlReporter;
}

export async function runReporter(
  payload: InterpretedPayload,
  rc: RC.Configuration
) {
  const reportersTasks = rc.reporters.map((reporter) => {
    const { report } = initializeReporter(reporter);

    return report(payload);
  });

  await Promise.all(reportersTasks);
}
