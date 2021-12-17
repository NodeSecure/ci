import { consoleReporter } from "./console/console.js";
import { htmlReporter } from "./html/html.js";
import { ReporterTarget } from "./index.js";

export function initializeReporter(reporter: ReporterTarget) {
  return reporter === ReporterTarget.CONSOLE ? consoleReporter : htmlReporter;
}
