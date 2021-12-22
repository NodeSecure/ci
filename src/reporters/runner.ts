import {
  RuntimeConfiguration,
  reporterTarget,
  ReporterTarget
} from "../nodesecurerc.js";
import { InterpretedPayload } from "../payload";

import { consoleReporter } from "./console/index.js";
import { htmlReporter } from "./html/index.js";

function initializeReporter(reporter: ReporterTarget) {
  return reporter === reporterTarget.CONSOLE ? consoleReporter : htmlReporter;
}

export async function runReporter(
  payload: InterpretedPayload,
  rc: RuntimeConfiguration
) {
  const { report } = initializeReporter(rc.reporter);
  await report(payload);
}
