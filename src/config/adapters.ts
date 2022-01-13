import { constants, accessSync } from "fs";
import { resolve } from "path";

import * as RC from "../nodesecurerc.js";

function isValidRootDirectory(directory: string): string {
  try {
    accessSync(directory, constants.F_OK);

    return resolve(directory);
  } catch {
    return RC.DEFAULT_RUNTIME_CONFIGURATION.rootDir;
  }
}

export function adaptDirectory(directory: string): string {
  return isValidRootDirectory(directory);
}

function isValidReporter(
  reporter: string | RC.ReporterTarget
): reporter is RC.ReporterTarget {
  return Object.values(RC.reporterTarget).includes(
    reporter as RC.ReporterTarget
  );
}

export function adaptReporters(
  reporters: string | RC.ReporterTarget[]
): RC.ReporterTarget[] {
  if (Array.isArray(reporters)) {
    const uniqReporters = new Set(reporters);

    return [...uniqReporters].filter(isValidReporter);
  }

  const reportersAsArray = reporters.replace(/\s/g, "").split(",");

  return [...new Set(reportersAsArray)].filter(isValidReporter);
}

function isValidWarnings(inputWarnings: RC.Warnings): boolean {
  return Object.values(RC.warnings).includes(inputWarnings);
}

export function adaptWarnings(warnings: RC.Warnings): RC.Warnings {
  if (isValidWarnings(warnings)) {
    return warnings;
  }

  return RC.warnings.ERROR;
}

function isValidStrategy(strategy: RC.InputStrategy): boolean {
  const validStrategies = Object.keys(RC.vulnStrategy);

  return validStrategies.includes(strategy);
}

export function adaptStrategy(strategy: RC.InputStrategy): RC.OutputStrategy {
  if (isValidStrategy(strategy)) {
    return RC.vulnStrategy[strategy];
  }

  return RC.vulnStrategy.npm;
}

function isValidSeverity(threshold: RC.Severity): boolean {
  return Object.values(RC.vulnSeverity).includes(threshold);
}

export function adaptSeverity(
  vulnerabilityThreshold: RC.Severity
): RC.Severity {
  if (isValidSeverity(vulnerabilityThreshold)) {
    return vulnerabilityThreshold;
  }

  return RC.vulnSeverity.ALL;
}
