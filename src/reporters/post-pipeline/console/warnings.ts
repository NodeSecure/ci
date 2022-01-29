import pluralize from "pluralize";

import { consolePrinter } from "../../../lib/console-printer/index.js";
import type { DependencyWarning } from "../../../lib/types";

export function reportGlobalWarnings(warnings: Array<unknown>): void {
  if (warnings.length > 0) {
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.error("[GLOBAL WARNING]:").bold().message,
        consolePrinter.font.error(`${warnings.length} global warnings found`)
          .message
      ])
      .print();
  }
}

export function reportDependencyWarnings(warnings: DependencyWarning[]): void {
  const numberOfDependencyWarnings = warnings.reduce(
    (accumulatedNumberOfWarnings, dependencyWarning) =>
      accumulatedNumberOfWarnings + dependencyWarning.warnings.length,
    0
  );

  if (numberOfDependencyWarnings > 0) {
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.error("[DEPENDENCY WARNINGS]:").bold().message,
        consolePrinter.font.error(`${numberOfDependencyWarnings}`).bold()
          .message,
        consolePrinter.font.error(
          `${pluralize("warning", numberOfDependencyWarnings)} found`
        ).message
      ])
      .print();

    for (const warning of warnings) {
      for (const details of warning.warnings) {
        const warningPath = consolePrinter.font.standard(
          `${details.file ? `${warning.package}/${details.file}` : ""}`
        ).message;

        const warningLocation = consolePrinter.font.info(
          `${
            details.file
              ? `${details.location.flatMap((location) => location.join(":"))}`
              : ""
          }`
        ).message;

        consolePrinter.util
          .concatOutputs([
            consolePrinter.font.error(details.kind).bold().underline().message,
            `${warningPath}:${warningLocation}`
          ])
          .print();
      }
    }
  }
}
