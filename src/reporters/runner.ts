import { RuntimeConfiguration } from "../nodesecurerc.js";
import { InterpretedPayload } from "../payload/interpret.js";
import { consoleReporter } from "./console/console.js";
import { htmlReporter } from "./html/html.js";
import { reporterTarget, ReporterTarget } from "./report.js";

export function initializeReporter(reporter: ReporterTarget) {
  return reporter === reporterTarget.CONSOLE ? consoleReporter : htmlReporter;
}

export async function runReporter(
  payload: InterpretedPayload,
  rc: RuntimeConfiguration
) {
  const { report } = initializeReporter(rc.reporter);
  await report(payload);
}
