import pluralize from "pluralize";

import { consolePrinter } from "../../../lib/console-printer/index.js";
import type { DependencyWarning } from "../../../lib/types";
import { Warnings } from "../../../nodesecurerc.js";

import { printWarnOrError } from "./util.js";

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

function printDependencyWarnings(
  warnings: DependencyWarning[],
  warningsMode: Warnings
): void {
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
          printWarnOrError(warningsMode)(details.kind).bold().underline()
            .message,
          `${warningPath}:${warningLocation}`
        ])
        .print();
    }
  }
}

export function reportDependencyWarnings(
  warnings: DependencyWarning[],
  warningsMode: Warnings
): void {
  const numberOfDependencyWarnings = warnings.reduce(
    (accumulatedNumberOfWarnings, dependencyWarning) =>
      accumulatedNumberOfWarnings + dependencyWarning.warnings.length,
    0
  );

  if (numberOfDependencyWarnings > 0) {
    printDependencyWarnings(warnings, warningsMode);

    printWarnOrError(warningsMode)(
      `✖ ${numberOfDependencyWarnings} dependency ${pluralize(
        "warning",
        numberOfDependencyWarnings
      )}`
    )
      .bold()
      .print();
  } else {
    consolePrinter.font.success(`✓ 0 dependency warnings`).bold().print();
  }
}
