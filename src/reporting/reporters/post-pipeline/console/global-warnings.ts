// Import Third-party Dependencies
import pluralize from "pluralize";

// Import Internal Dependencies
import {
  type ConsoleMessage,
  consolePrinter
} from "../../../../../lib/console-printer/index.js";
import { Nsci } from "../../../../configuration/index.js";

import { buildOutcomeStatsConsoleMessage } from "./util.js";

export function reportGlobalWarnings(warnings: string[]): void {
  if (warnings.length > 0) {
    consolePrinter.font
      .error(
        `✖ ${warnings.length} global ${pluralize("warning", warnings.length)}`
      )
      .bold()
      .printWithEmptyLine();

    warnings.forEach((warning) => {
      consolePrinter.font
        .standard(warning)
        .prefix(consolePrinter.font.error(">>").message)
        .bold()
        .printWithEmptyLine();
    });

    return;
  }

  consolePrinter.font
    .success("✓ 0 global warnings")
    .bold()
    .printWithEmptyLine();
}

export function buildGlobalWarningsOutcomeMessage(
  numberOfGlobalWarnings: number,
  warningsMode: Nsci.Warnings
): ConsoleMessage {
  return buildOutcomeStatsConsoleMessage(numberOfGlobalWarnings, warningsMode);
}
