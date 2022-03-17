import {
  ConsoleMessage,
  ConsoleOutput,
  consolePrinter
} from "../../../../../lib/console-printer/index.js";
import { Nsci } from "../../../../configuration/index.js";
import { Warnings } from "../../../../configuration/standard/nsci";

export function printWarnOrError(
  warningsMode: Warnings
): ConsoleOutput<ConsoleMessage, string> {
  return warningsMode === Nsci.warnings.ERROR
    ? consolePrinter.font.error
    : consolePrinter.font.info;
}

export function buildOutcomeStatsConsoleMessage(
  statsLength: number,
  warningsMode: Warnings
): ConsoleMessage {
  if (statsLength > 0) {
    const printWarnOrErr = printWarnOrError(warningsMode);

    return printWarnOrErr(`${statsLength}`).prefix(printWarnOrErr("✖").message);
  }

  return consolePrinter.font
    .success(`${statsLength}`)
    .prefix(consolePrinter.font.success("✓").message);
}
