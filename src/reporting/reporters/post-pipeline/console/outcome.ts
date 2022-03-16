import { table, TableUserConfig } from "table";

import { consolePrinter } from "../../../../../lib/console-printer/index.js";
import type { InterpretedScannerPayload } from "../../../../analysis";
import { Warnings } from "../../../../configuration/standard/nsci.js";
import { pipeline } from "../../../index.js";

import { buildDependenciesWarningsOutcomeMessage } from "./dependency-warnings.js";
import { buildGlobalWarningsOutcomeMessage } from "./global-warnings.js";
import { buildVulnerabilitiesOutcomeMessage } from "./vulnerabilities.js";

export function printPipelineOutcome(
  payload: InterpretedScannerPayload,
  status: pipeline.Status,
  warningsMode: Warnings
): void {
  const {
    warnings: globalWarnings,
    dependencies: { warnings, vulnerabilities }
  } = payload;

  const globalWarningsOutcomeMsg = buildGlobalWarningsOutcomeMessage(
    globalWarnings.length,
    warningsMode
  );

  const depsWarningsOutcomeMsg = buildDependenciesWarningsOutcomeMessage(
    warnings,
    warningsMode
  );

  const vulnsConsoleOutcomeMsg = buildVulnerabilitiesOutcomeMessage(
    vulnerabilities.length
  );

  const tableConfig: TableUserConfig = {
    columns: [
      { alignment: "center" },
      { alignment: "center" },
      { alignment: "center" }
    ]
  };

  const tableData = [
    [
      consolePrinter.font.standard("Global Warnings").bold().message,
      consolePrinter.font.standard("Dependency Warnings").bold().message,
      consolePrinter.font.standard("Vulnerabilities").bold().message
    ],
    [
      globalWarningsOutcomeMsg.message,
      depsWarningsOutcomeMsg.message,
      vulnsConsoleOutcomeMsg.message
    ]
  ];

  consolePrinter.util.emptyLine();

  consolePrinter.font.standard(table(tableData, tableConfig)).print();

  if (status === pipeline.status.SUCCESS) {
    consolePrinter.font
      .highlightedSuccess("✓ [SUCCESS] Pipeline successful ")
      .bold()
      .print();
  } else {
    consolePrinter.font.highlightedError("✖ [FAILURE] Pipeline failed").print();
  }

  consolePrinter.util.emptyLine();
}
