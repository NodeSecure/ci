// Import Third-party Dependencies
import { match } from "ts-pattern";

// Import Internal Dependencies
import {
  type ConsoleMessage,
  type ConsoleOutput,
  consolePrinter
} from "../../../../../lib/console-printer/index.js";
import { Nsci } from "../../../../configuration/index.js";
import type { Warnings } from "../../../../configuration/standard/nsci.js";

export function getOutcomeEmoji(warningsMode: Warnings): string {
  return match(warningsMode)
    .with("error", () => "✖")
    .with("off", () => "✓")
    .with("warning", () => "⚠")
    .otherwise(() => "⚠");
}

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
    const outcomeEmoji = getOutcomeEmoji(warningsMode);
    const printWarnOrErr = printWarnOrError(warningsMode);

    return printWarnOrErr(`${statsLength}`)
      .prefix(printWarnOrErr(outcomeEmoji).message)
      .bold();
  }

  return consolePrinter.font
    .success(`${statsLength}`)
    .prefix(consolePrinter.font.success("✓").message)
    .bold();
}
