import pluralize from "pluralize";
import { match } from "ts-pattern";

import {
  ConsoleMessage,
  consolePrinter
} from "../../../../../lib/console-printer/index.js";
import { DependencyWarningWithMode } from "../../../../analysis/interpretation/warnings.js";
import { Nsci } from "../../../../configuration/index.js";

import { buildOutcomeStatsConsoleMessage, printWarnOrError } from "./util.js";

function printDependencyWarnings(
  dependenciesWarnings: DependencyWarningWithMode[]
): {
  warningsWithWarningMode: DependencyWarningWithMode[];
  warningsWithErrorMode: DependencyWarningWithMode[];
} {
  const warningsWithErrorMode = [];
  const warningsWithWarningMode = [];

  for (const dependencyWarning of dependenciesWarnings) {
    for (const warning of dependencyWarning.warnings) {
      /**
       * Collect information about "warning" and "error" stats that can be used
       * in the reporting process
       */
      if (warning.mode === Nsci.warnings.ERROR) {
        warningsWithErrorMode.push(dependencyWarning);
      } else {
        warningsWithWarningMode.push(dependencyWarning);
      }

      let warningLocation;
      let warningPath;

      if (warning.file) {
        warningPath = consolePrinter.font.standard(
          `${dependencyWarning.package ?? "."}/${warning.file}`
        ).message;

        warningLocation = consolePrinter.font.info(
          `${warning.location.flatMap((location) => location.join(":"))}`
        ).message;
      }

      consolePrinter.util
        .concatOutputs([
          printWarnOrError(warning.mode)(warning.kind).bold().underline()
            .message,
          warningLocation && warningPath
            ? `${warningPath}:${warningLocation}`
            : ""
        ])
        .print();
    }
  }

  return { warningsWithErrorMode, warningsWithWarningMode };
}

export function reportDependencyWarnings(
  warnings: DependencyWarningWithMode[],
  warningsMode: Nsci.Warnings
): void {
  const numberOfDependencyWarnings = warnings.reduce(
    (accumulatedNumberOfWarnings, dependencyWarning) =>
      accumulatedNumberOfWarnings + dependencyWarning.warnings.length,
    0
  );

  const { warningsWithErrorMode } = printDependencyWarnings(warnings);

  if (numberOfDependencyWarnings === 0) {
    consolePrinter.font.success(`✓ 0 dependency warnings`).bold().print();

    return;
  }

  if (warningsMode === Nsci.warnings.OFF) {
    consolePrinter.font
      .info(`⚠ dependency warnings were skipped`)
      .bold()
      .print();

    return;
  }

  if (
    warningsMode === Nsci.warnings.ERROR ||
    warningsMode === Nsci.warnings.WARNING
  ) {
    printWarnOrError(warningsMode)(
      `✖ ${numberOfDependencyWarnings} dependency ${pluralize(
        "warning",
        numberOfDependencyWarnings
      )}`
    )
      .bold()
      .print();
  }

  /**
   * The last specific warning mode to display is the Record mode:
   * If there is atleast one "error" warning defined in the Record that is
   * encountered, the whole message will be printed in Error (red). Otherwise if
   * there is no "error" warning, the whole message will be printed in Warning (yellow).
   */
  printWarnOrError(
    warningsWithErrorMode.length > 0
      ? Nsci.warnings.ERROR
      : Nsci.warnings.WARNING
  )(
    `✖ ${numberOfDependencyWarnings} dependency ${pluralize(
      "warning",
      numberOfDependencyWarnings
    )}`
  )
    .bold()
    .print();
}

function collectNumberOfWarningsWithError(
  dependencyWarning: DependencyWarningWithMode
): number {
  return dependencyWarning.warnings.filter(
    (warning) => warning.mode === Nsci.warnings.ERROR
  ).length;
}

function collectDependencyWarningsStats(
  warnings: DependencyWarningWithMode[]
): {
  allWarnings: number;
  warningsWithError: number;
} {
  const dependencyWarningsStats = warnings.reduce(
    (accumulatedWarningsStats, dependencyWarning) => {
      return {
        allWarnings:
          accumulatedWarningsStats.allWarnings +
          dependencyWarning.warnings.length,
        warningsWithError:
          accumulatedWarningsStats.warningsWithError +
          collectNumberOfWarningsWithError(dependencyWarning)
      };
    },
    { allWarnings: 0, warningsWithError: 0 }
  );

  return dependencyWarningsStats;
}

export function buildDependenciesWarningsOutcomeMessage(
  warnings: DependencyWarningWithMode[],
  warningsMode: Nsci.Warnings
): ConsoleMessage {
  const { allWarnings, warningsWithError } =
    collectDependencyWarningsStats(warnings);

  const dependencyWarningsMessage = `dependency ${pluralize(
    "warning",
    allWarnings
  )}`;

  return match(warningsMode)
    .with(Nsci.warnings.OFF, () =>
      consolePrinter.font.info("⚠ dependency warnings skipped")
    )
    .with(Nsci.warnings.ERROR, () =>
      buildOutcomeStatsConsoleMessage(
        dependencyWarningsMessage,
        allWarnings,
        Nsci.warnings.ERROR
      )
    )
    .with(Nsci.warnings.WARNING, () =>
      buildOutcomeStatsConsoleMessage(
        dependencyWarningsMessage,
        allWarnings,
        Nsci.warnings.WARNING
      )
    )
    .otherwise(() =>
      buildOutcomeStatsConsoleMessage(
        dependencyWarningsMessage,
        allWarnings,
        warningsWithError > 0 ? Nsci.warnings.ERROR : Nsci.warnings.OFF
      )
    );
}
