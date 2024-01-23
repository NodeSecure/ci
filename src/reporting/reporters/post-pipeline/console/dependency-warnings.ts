// Import Third-party Dependencies
import pluralize from "pluralize";
import { match } from "ts-pattern";

// Import Internal Dependencies
import {
  ConsoleMessage,
  consolePrinter
} from "../../../../../lib/console-printer/index.js";
import { DependencyWarningWithMode } from "../../../../analysis/interpretation/warnings.js";
import { Nsci } from "../../../../configuration/index.js";

import {
  buildOutcomeStatsConsoleMessage,
  getOutcomeEmoji,
  printWarnOrError
} from "./util.js";

type CollectedDependencyWarningsStats = {
  warningsWithWarningMode: DependencyWarningWithMode[];
  warningsWithErrorMode: DependencyWarningWithMode[];
  printAllWarnings: () => void;
};

function collectDependencyWarningsConsoleMessages(
  dependenciesWarnings: DependencyWarningWithMode[]
): CollectedDependencyWarningsStats {
  const warningsWithErrorMode: DependencyWarningWithMode[] = [];
  const warningsWithWarningMode: DependencyWarningWithMode[] = [];
  const warningsToPrint: ConsoleMessage[] = [];

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
          `${warning.location!.flatMap((location) => location.join(":"))}`
        ).message;
      }

      // Don't directly print messages to defer the console rendering at
      // another point in time
      warningsToPrint.push(
        consolePrinter.util.concatOutputs([
          printWarnOrError(warning.mode)(warning.kind).bold().underline()
            .message,
          warningLocation && warningPath
            ? `${warningPath}:${warningLocation}`
            : ""
        ])
      );
    }
  }

  function printAllWarnings(): void {
    warningsToPrint.forEach((warning) => warning.printWithEmptyLine());
  }

  return {
    warningsWithErrorMode,
    warningsWithWarningMode,
    printAllWarnings
  };
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
  const { warningsWithErrorMode, printAllWarnings } =
    collectDependencyWarningsConsoleMessages(warnings);

  if (warningsMode === Nsci.warnings.OFF) {
    consolePrinter.font
      .info(`⚠ dependency warnings were skipped`)
      .bold()
      .printWithEmptyLine();

    return;
  }

  if (numberOfDependencyWarnings === 0) {
    consolePrinter.font
      .success(`✓ 0 dependency warnings`)
      .bold()
      .printWithEmptyLine();

    return;
  }

  const dependencyWarningsOutcome = `${numberOfDependencyWarnings} dependency ${pluralize(
    "warning",
    numberOfDependencyWarnings
  )}`;

  if (
    warningsMode === Nsci.warnings.ERROR ||
    warningsMode === Nsci.warnings.WARNING
  ) {
    const outcomeEmoji = getOutcomeEmoji(warningsMode);
    printWarnOrError(warningsMode)(
      `${outcomeEmoji} ${dependencyWarningsOutcome}`
    )
      .bold()
      .printWithEmptyLine();
    printAllWarnings();

    return;
  }

  /**
   * The last specific warning mode to display is the Record mode:
   * If there is atleast one "error" warning defined in the Record that is
   * encountered, the whole message will be printed in Error (red). Otherwise if
   * there is no "error" warning, the whole message will be printed in Warning (yellow).
   */
  const warningOrErrorMode =
    warningsWithErrorMode.length > 0
      ? Nsci.warnings.ERROR
      : Nsci.warnings.WARNING;
  const outcomeEmoji = getOutcomeEmoji(warningOrErrorMode);

  printWarnOrError(warningOrErrorMode)(
    `${outcomeEmoji} ${dependencyWarningsOutcome}`
  )
    .bold()
    .printWithEmptyLine();

  printAllWarnings();
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

  return match(warningsMode)
    .with(Nsci.warnings.OFF, () =>
      consolePrinter.font.info("⚠ dependency warnings skipped")
    )
    .with(Nsci.warnings.ERROR, () =>
      buildOutcomeStatsConsoleMessage(allWarnings, Nsci.warnings.ERROR)
    )
    .with(Nsci.warnings.WARNING, () =>
      buildOutcomeStatsConsoleMessage(allWarnings, Nsci.warnings.WARNING)
    )
    .otherwise(() =>
      buildOutcomeStatsConsoleMessage(
        allWarnings,
        /* eslint-disable no-nested-ternary */
        /* eslint-disable prettier/prettier */
        warningsWithError > 0
          ? Nsci.warnings.ERROR
          : allWarnings > 0
          ? Nsci.warnings.WARNING
          : Nsci.warnings.OFF
      )
    );
}
