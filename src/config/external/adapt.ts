import { constants, accessSync } from "fs";
import { resolve } from "path";

import { Nsci } from "../internal/index.js";

import {
  defaultExternalConfigOptions,
  ExternalRuntimeConfiguration
} from "./standardize.js";

function isValidRootDirectory(directory: string): string {
  try {
    accessSync(directory, constants.F_OK);

    return resolve(directory);
  } catch {
    return Nsci.DEFAULT_NSCI_RUNTIME_CONFIGURATION.rootDir;
  }
}

function adaptDirectory(directory: string): string {
  return isValidRootDirectory(directory);
}

function isValidReporter(
  reporter: string | Nsci.ReporterTarget
): reporter is Nsci.ReporterTarget {
  return Object.values(Nsci.reporterTarget).includes(
    reporter as Nsci.ReporterTarget
  );
}

function adaptReporters(
  reporters: string | Nsci.ReporterTarget[]
): Nsci.ReporterTarget[] {
  if (Array.isArray(reporters)) {
    const uniqReporters = new Set(reporters);

    return [...uniqReporters].filter(isValidReporter);
  }

  const reportersAsArray = reporters.replace(/\s/g, "").split(",");

  return [...new Set(reportersAsArray)].filter(isValidReporter);
}

function isValidWarnings(inputWarnings: Nsci.Warnings): boolean {
  return Object.values(Nsci.warnings).includes(inputWarnings);
}

function adaptWarnings(warnings: Nsci.Warnings): Nsci.Warnings {
  if (isValidWarnings(warnings)) {
    return warnings;
  }

  return Nsci.warnings.ERROR;
}

function isValidStrategy(strategy: Nsci.InputStrategy): boolean {
  const validStrategies = Object.keys(Nsci.vulnStrategy);

  return validStrategies.includes(strategy);
}

function adaptStrategy(strategy: Nsci.InputStrategy): Nsci.OutputStrategy {
  if (isValidStrategy(strategy)) {
    return Nsci.vulnStrategy[strategy];
  }

  return Nsci.vulnStrategy.npm;
}

function isValidSeverity(threshold: Nsci.Severity): boolean {
  return Object.values(Nsci.vulnSeverity).includes(threshold);
}

function adaptSeverity(vulnerabilityThreshold: Nsci.Severity): Nsci.Severity {
  if (isValidSeverity(vulnerabilityThreshold)) {
    return vulnerabilityThreshold;
  }

  return Nsci.vulnSeverity.ALL;
}

/**
 * In the first place, we need to adapt options from the either the CLI or
 * the API call in order to be used as a RC.Configuration structure.
 * This adapt takes into account name bindings but also checks validity of values
 * that were supplied from the external world (API or CLI)
 * (e.g: valid severity threshold supplied)
 */
export function adaptExternalToStandardConfiguration(
  sanitizedOptions: Partial<ExternalRuntimeConfiguration>
): Nsci.Configuration {
  const { vulnerabilities, directory, strategy, warnings, reporters } = {
    ...defaultExternalConfigOptions,
    ...sanitizedOptions
  };

  return {
    rootDir: adaptDirectory(directory),
    reporters: adaptReporters(reporters),
    strategy: adaptStrategy(strategy),
    vulnerabilitySeverity: adaptSeverity(vulnerabilities),
    warnings: adaptWarnings(warnings)
  };
}
