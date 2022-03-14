import { constants, accessSync } from "fs";
import { resolve } from "path";

import { ValueOf } from "../../lib/types/index.js";
import { Nsci } from "../standard/index.js";

export function adaptDirectory(directory: string): string {
  try {
    accessSync(directory, constants.F_OK);

    return resolve(directory);
  } catch {
    return Nsci.DEFAULT_NSCI_RUNTIME_CONFIGURATION.rootDir;
  }
}

function isValidReporter(
  reporter: string | Nsci.ReporterTarget
): reporter is Nsci.ReporterTarget {
  return Object.values(Nsci.reporterTarget).includes(
    reporter as Nsci.ReporterTarget
  );
}

export function adaptReporters(
  reporters: string | Nsci.ReporterTarget[]
): Nsci.ReporterTarget[] {
  if (Array.isArray(reporters)) {
    const uniqReporters = new Set(reporters);

    return [...uniqReporters].filter(isValidReporter);
  }

  const reportersAsArray = reporters.replace(/\s/g, "").split(",");

  return [...new Set(reportersAsArray)].filter(isValidReporter);
}

function isValidWarning(inputWarning: ValueOf<typeof Nsci.warnings>): boolean {
  return Object.values(Nsci.warnings).includes(inputWarning);
}

export function adaptWarnings(warnings: Nsci.Warnings): Nsci.Warnings {
  if (typeof warnings === "string" && isValidWarning(warnings)) {
    return warnings;
  }

  const warningsRecord = Object.fromEntries(
    Object.entries(warnings).filter(([_warningType, warningValue]) =>
      isValidWarning(warningValue as ValueOf<typeof Nsci.warnings>)
    )
  ) as Nsci.Warnings;

  const hasAtleastOneValidWarningInRecord =
    Object.keys(warningsRecord).length > 0;

  return hasAtleastOneValidWarningInRecord
    ? warningsRecord
    : Nsci.warnings.ERROR;
}

function isValidStrategy(strategy: Nsci.InputStrategy): boolean {
  const validStrategies = Object.keys(Nsci.vulnStrategy);

  return validStrategies.includes(strategy);
}

export function adaptStrategy(
  strategy: Nsci.InputStrategy
): Nsci.OutputStrategy {
  if (isValidStrategy(strategy)) {
    return Nsci.vulnStrategy[strategy];
  }

  return Nsci.vulnStrategy.npm;
}

function isValidSeverity(threshold: Nsci.Severity): boolean {
  return Object.values(Nsci.vulnSeverity).includes(threshold);
}

export function adaptSeverity(
  vulnerabilityThreshold: Nsci.Severity
): Nsci.Severity {
  if (isValidSeverity(vulnerabilityThreshold)) {
    return vulnerabilityThreshold;
  }

  return Nsci.vulnSeverity.MEDIUM;
}
