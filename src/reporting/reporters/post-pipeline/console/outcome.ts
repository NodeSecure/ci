import pluralize from "pluralize";

import type { CompactedScannerPayload } from "../../../../analysis";
import { Warnings } from "../../../../config/standard/nsci.js";
import {
  ConsoleMessage,
  consolePrinter
} from "../../../../lib/console-printer/index.js";
import { pipeline } from "../../../index.js";

import { printWarnOrError } from "./util.js";

function getStatsConsoleMessage(
  message: string,
  statsLength: number,
  warningsMode: Warnings
): ConsoleMessage {
  if (statsLength > 0) {
    const printWarnOrErr = printWarnOrError(warningsMode);

    return printWarnOrErr(`${statsLength} ${message}`).prefix(
      printWarnOrErr("✖").message
    );
  }

  return consolePrinter.font
    .success(`${statsLength} ${message}`)
    .prefix(consolePrinter.font.success("✓").message);
}

export function printPipelineOutcome(
  payload: CompactedScannerPayload,
  status: pipeline.Status,
  warningsMode: Warnings
): void {
  const {
    warnings: globalWarnings,
    dependencies: { warnings, vulnerabilities }
  } = payload;

  const globalWarningsConsoleMsg = getStatsConsoleMessage(
    "global warnings",
    globalWarnings.length,
    warningsMode
  );

  const numberOfDependencyWarnings = warnings.reduce(
    (accumulatedNumberOfWarnings, dependencyWarning) =>
      accumulatedNumberOfWarnings + dependencyWarning.warnings.length,
    0
  );

  const depsWarningsConsoleMsg =
    warningsMode === "off"
      ? consolePrinter.font.info("⚠ dependency warnings skipped")
      : getStatsConsoleMessage(
          `dependency ${pluralize("warning", numberOfDependencyWarnings)}`,
          numberOfDependencyWarnings,
          warningsMode
        );

  const vulnConsoleMsg = getStatsConsoleMessage(
    pluralize("vulnerability", vulnerabilities.length),
    vulnerabilities.length,
    "error"
  );

  consolePrinter.util
    .concatOutputs([
      globalWarningsConsoleMsg.bold().message,
      consolePrinter.font.standard("|").message,
      depsWarningsConsoleMsg.bold().message,
      consolePrinter.font.standard("|").message,
      vulnConsoleMsg.bold().message
    ])
    .print();

  if (status === pipeline.status.SUCCESS) {
    consolePrinter.font
      .highlightedSuccess("[SUCCESS] Pipeline successful")
      .bold()
      .print();
  } else {
    consolePrinter.font.highlightedError("[FAILURE] Pipeline failed").print();
  }

  consolePrinter.util.emptyLine();
}
