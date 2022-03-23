// Import Internal Dependencies
import { consolePrinter } from "../../../../lib/console-printer/index.js";
import { SelectedRuntimeConfig } from "../../../configuration/manage.js";
import { Nsci } from "../../../configuration/standard/index.js";
import { Reporter } from "../reporter.js";

import { invertRecord } from "./util.js";

function dumpInputCommand(rc: Nsci.Configuration): void {
  const inputStrategy = invertRecord(Nsci.vulnStrategy)[rc.strategy];
  const inputVulnerability = rc.vulnerabilitySeverity;
  const inputWarnings =
    typeof rc.warnings === "string" ? rc.warnings : "[object Object]";
  const reporters =
    rc.reporters.length === 0 ? undefined : rc.reporters.join(", ");

  consolePrinter.util
    .concatOutputs([
      consolePrinter.font.standard(`--strategy=${inputStrategy} `).message,
      consolePrinter.font.standard(`--vulnerabilities=${inputVulnerability} `)
        .message,
      consolePrinter.font.standard(`--warnings=${inputWarnings}`).message,
      consolePrinter.font.standard(reporters ? `--reporters=${reporters}` : "")
        .message
    ])
    .prefix(consolePrinter.font.info("$ node_modules/.bin/nsci").message)
    .printWithEmptyLine();
}

function printSelectedRuntimeConfiguration({
  configMode,
  runtimeConfig
}: SelectedRuntimeConfig): void {
  if (configMode === "raw") {
    consolePrinter.font
      .highlight(".nodesecurerc")
      .suffix(
        consolePrinter.font.standard(
          "not found or invalid. The raw config provided will be used instead"
        ).message
      )
      .prefix(consolePrinter.font.info("info").message)
      .printWithEmptyLine();

    dumpInputCommand(runtimeConfig);
  } else {
    consolePrinter.font
      .standard("was found")
      .prefix(consolePrinter.font.highlight(".nodesecurerc").message)
      .prefix(consolePrinter.font.info("info").message)
      .printWithEmptyLine();
  }
}

function reportRuntimeConfiguration(
  runtimeConfig: SelectedRuntimeConfig
): void {
  printSelectedRuntimeConfiguration(runtimeConfig);
}

export const runtimeConfigurationReporter: Reporter<SelectedRuntimeConfig> = {
  type: Nsci.reporterTarget.CONSOLE,
  report: reportRuntimeConfiguration
};
