import {
  ConsoleMessage,
  consolePrinter
} from "../../../../../lib/console-printer/index.js";
import { Nsci } from "../../../../configuration/index.js";
import { Warnings } from "../../../../configuration/standard/nsci";

export function printWarnOrError(warningsMode: Warnings) {
  /**
   * warningsMode is only a string for now. In the future, a Record could be provided
   * in a ESLint manneer. Consequently, this function would need more context
   * to know whether if the warnings should be printed as an error or a warning.
   */
  return warningsMode === Nsci.warnings.ERROR
    ? consolePrinter.font.error
    : consolePrinter.font.info;
}

export function buildOutcomeStatsConsoleMessage(
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
