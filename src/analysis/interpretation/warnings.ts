// Import Third-party Dependencies
import type { Warning } from "@nodesecure/js-x-ray";
import { match } from "ts-pattern";

// Import Internal Dependencies
import { Nsci } from "../../configuration/standard/index.js";
import type { WarningMode } from "../../configuration/standard/nsci.js";
import type { DependencyWarning } from "../types/index.js";

import { fromBooleanToCheckResult, type CheckableFunction } from "./checkable.js";

export function checkGlobalWarnings(
  warnings: string[]
): CheckableFunction<string> {
  return {
    result: fromBooleanToCheckResult(warnings.length > 0),
    data: {
      key: "warnings",
      value: warnings
    }
  };
}

export type DependencyWarningWithMode = Omit<DependencyWarning, "warnings"> & {
  warnings: (Warning & {
    mode: Nsci.WarningMode;
  })[];
};

function hasAtleastOneWarning(dependencyWarning: DependencyWarning): boolean {
  return dependencyWarning.warnings.length > 0;
}

function addModeForEachDependencyWarning(warningMode: WarningMode) {
  return (dependencyWarning: DependencyWarning): DependencyWarningWithMode => {
    return {
      ...dependencyWarning,
      warnings: dependencyWarning.warnings.map((warningWithoutMode) => {
        return {
          ...warningWithoutMode,
          mode: warningMode
        };
      })
    };
  };
}

function retrieveAllWarningsWithSharedMode(
  warnings: DependencyWarning[],
  warningMode: Nsci.WarningMode
): CheckableFunction<DependencyWarningWithMode> {
  const addModeToWarning = addModeForEachDependencyWarning(warningMode);
  const allDependencyWarningsWithMode = warnings
    .filter(hasAtleastOneWarning)
    .map(addModeToWarning);

  return {
    result:
      warningMode === Nsci.warnings.ERROR
        ? fromBooleanToCheckResult(allDependencyWarningsWithMode.length > 0)
        : fromBooleanToCheckResult(false),
    data: {
      key: "dependencies.warnings",
      value: allDependencyWarningsWithMode
    }
  };
}

function groupWarningKindsByWarningMode(
  warningsWithSpecificMode: Record<Nsci.WarningName, Nsci.WarningMode>
): {
    allWarningsKindsWithErrorMode: Set<Nsci.WarningName>;
    allWarningsKindsWithWarningMode: Set<Nsci.WarningName>;
  } {
  const warningKindsGroupedByWarningMode = Object.entries(
    warningsWithSpecificMode
  ).reduce(
    (warningsGroupedByMode, [warningKind, warningValue]) => {
      warningsGroupedByMode[warningValue] = [
        ...warningsGroupedByMode[warningValue],
        warningKind as Nsci.WarningName
      ];

      return warningsGroupedByMode;
    },
    {
      off: [],
      warning: [],
      error: []
    } as Record<Nsci.WarningMode, Nsci.WarningName[]>
  );

  // All warnings defined with the "error" mode
  const allWarningsKindsWithErrorMode = new Set(
    warningKindsGroupedByWarningMode.error
  );

  // All warnings defined with the "warning" mode
  const allWarningsKindsWithWarningMode = new Set(
    warningKindsGroupedByWarningMode.warning
  );

  return {
    allWarningsKindsWithErrorMode,
    allWarningsKindsWithWarningMode
  };
}

function retrieveAllWarningsWithSpecificMode(
  warnings: DependencyWarning[],
  warningsWithSpecificMode: Record<Nsci.WarningName, Nsci.WarningMode>
): CheckableFunction<DependencyWarningWithMode> {
  const { allWarningsKindsWithErrorMode, allWarningsKindsWithWarningMode } =
    groupWarningKindsByWarningMode(warningsWithSpecificMode);

  /**
   * The only condition for this step to fail or success is based on the fact that there
   * are "error" warnings. Consequently, we must keep track of "error" warnings
   * encountered during the analysis.
   */
  let numberOfWarningsWithErrorMode = 0;

  const dependencyWarningsWithErrorOrWarningModes = warnings.map(
    (dependency) => {
      /**
       * Here, we need to add a "mode" for each warning in order to differentiate
       * warnings that should be reported as "error" and the ones that should be
       * reported as "warning" ("off" ones are ignored by definition).
       */
      const warningsWithErrorOrWarningModes = dependency.warnings
        .map((dependencyWarning) => {
          if (allWarningsKindsWithErrorMode.has(dependencyWarning.kind)) {
            numberOfWarningsWithErrorMode += 1;

            return { ...dependencyWarning, mode: Nsci.warnings.ERROR };
          }

          if (allWarningsKindsWithWarningMode.has(dependencyWarning.kind)) {
            return { ...dependencyWarning, mode: Nsci.warnings.WARNING };
          }

          return { ...dependencyWarning, mode: Nsci.warnings.OFF };
        })
        // Ignore "off" warnings as they won't be used in the reporting step
        .filter((warning) => warning.mode !== Nsci.warnings.OFF);

      return {
        ...dependency,
        warnings: warningsWithErrorOrWarningModes
      };
    }
  );

  return {
    result: fromBooleanToCheckResult(numberOfWarningsWithErrorMode > 0),
    data: {
      key: "dependencies.warnings",
      value: dependencyWarningsWithErrorOrWarningModes
    }
  };
}

export function checkDependenciesWarnings(
  warnings: DependencyWarning[],
  runtimeConfiguration: Nsci.Configuration
): CheckableFunction<DependencyWarningWithMode> {
  return match(runtimeConfiguration.warnings)
    .with(Nsci.warnings.OFF, () => {
      return {
        result: fromBooleanToCheckResult(false),
        data: {
          key: "dependencies.warnings",
          value: []
        }
      };
    })
    .with(Nsci.warnings.ERROR, () => retrieveAllWarningsWithSharedMode(
      warnings,
      runtimeConfiguration.warnings as Nsci.WarningMode
    )
    )
    .with(Nsci.warnings.WARNING, () => retrieveAllWarningsWithSharedMode(
      warnings,
      runtimeConfiguration.warnings as Nsci.WarningMode
    )
    )
    .otherwise(() => retrieveAllWarningsWithSpecificMode(
      warnings,
      runtimeConfiguration.warnings as Record<
        Nsci.WarningName,
        Nsci.WarningMode
      >
    )
    );
}
