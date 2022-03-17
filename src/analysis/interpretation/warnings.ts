import type { GlobalWarning } from "@nodesecure/scanner/types/scanner";
import { match } from "ts-pattern";

import { Nsci } from "../../configuration/standard/index.js";
import type { DependencyWarning } from "../../types";

import { fromBooleanToCheckResult, CheckableFunction } from "./checkable.js";

export function checkGlobalWarnings(
  warnings: GlobalWarning[]
): CheckableFunction<GlobalWarning> {
  return {
    result: fromBooleanToCheckResult(warnings.length > 0),
    data: {
      key: "warnings",
      value: warnings
    }
  };
}

export type DependencyWarningWithMode = Omit<DependencyWarning, "warnings"> & {
  warnings: (Omit<JSXRay.BaseWarning, "value"> & {
    mode: Nsci.WarningMode;
  })[];
};

function retrieveAllWarningsWithUniqueMode(
  warnings: DependencyWarning[],
  warningMode: Nsci.WarningMode
): CheckableFunction<DependencyWarningWithMode> {
  const allDependencyWarnings = warnings
    .filter((dependency) => dependency.warnings.length > 0)
    .flatMap((dependencyWarning) => {
      return {
        ...dependencyWarning,
        warnings: dependencyWarning.warnings.map((warning) => {
          return {
            ...warning,
            mode: warningMode
          };
        })
      };
    });

  return {
    result:
      warningMode === Nsci.warnings.ERROR
        ? fromBooleanToCheckResult(allDependencyWarnings.length > 0)
        : fromBooleanToCheckResult(false),
    data: {
      key: "dependencies.warnings",
      value: allDependencyWarnings
    }
  };
}

function groupWarningKindsByWarningMode(
  warningsWithSpecificMode: Record<Nsci.WarningKind, Nsci.WarningMode>
): {
  allWarningsKindsWithErrorMode: Set<Nsci.WarningKind>;
  allWarningsKindsWithWarningMode: Set<Nsci.WarningKind>;
} {
  const warningKindsGroupedByWarningMode = Object.entries(
    warningsWithSpecificMode
  ).reduce(
    (acc, [warningKind, warningValue]) => {
      acc[warningValue] = [
        ...acc[warningValue],
        warningKind as Nsci.WarningKind
      ];

      return acc;
    },
    {
      off: [],
      warning: [],
      error: []
    } as Record<Nsci.WarningMode, Nsci.WarningKind[]>
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

function retrieveAllWarningsWithTheirOwnSpecificMode(
  warnings: DependencyWarning[],
  warningsWithSpecificMode: Record<Nsci.WarningKind, Nsci.WarningMode>
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
    .with(Nsci.warnings.ERROR, () =>
      retrieveAllWarningsWithUniqueMode(
        warnings,
        runtimeConfiguration.warnings as Nsci.WarningMode
      )
    )
    .with(Nsci.warnings.WARNING, () =>
      retrieveAllWarningsWithUniqueMode(
        warnings,
        runtimeConfiguration.warnings as Nsci.WarningMode
      )
    )
    .otherwise(() =>
      retrieveAllWarningsWithTheirOwnSpecificMode(
        warnings,
        runtimeConfiguration.warnings as Record<
          Nsci.WarningKind,
          Nsci.WarningMode
        >
      )
    );
}
