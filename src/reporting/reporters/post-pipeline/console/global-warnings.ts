import pluralize from "pluralize";

import {
  ConsoleMessage,
  consolePrinter
} from "../../../../../lib/console-printer/index.js";
import { Nsci } from "../../../../configuration/index.js";

import { buildOutcomeStatsConsoleMessage } from "./util.js";

export function reportGlobalWarnings(warnings: Array<unknown>): void {
  if (warnings.length > 0) {
    consolePrinter.font
      .error(
        `✖ ${warnings.length} global ${pluralize("warning", warnings.length)}`
      )
      .bold()
      .print();
  } else {
    consolePrinter.font.success("✓ 0 global warnings").bold().print();
  }
}

export function buildGlobalWarningsOutcomeMessage(
  numberOfGlobalWarnings: number,
  warningsMode: Nsci.Warnings
): ConsoleMessage {
  return buildOutcomeStatsConsoleMessage(
    "global warnings",
    numberOfGlobalWarnings,
    warningsMode
  );
}
