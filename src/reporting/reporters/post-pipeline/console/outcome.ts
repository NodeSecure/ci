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

  consolePrinter.util
    .concatOutputs([
      globalWarningsOutcomeMsg.bold().message,
      consolePrinter.font.standard("|").message,
      depsWarningsOutcomeMsg.bold().message,
      consolePrinter.font.standard("|").message,
      vulnsConsoleOutcomeMsg.bold().message
    ])
    .print();

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
