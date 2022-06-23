// Import Node.js Dependencies
import { constants, accessSync } from "fs";
import { resolve } from "path";

// Import Internal Dependencies
import { IgnoreWarningsPatterns } from "../external/nodesecure/ignore-file.js";
import { Nsci } from "../standard/index.js";

import {
  defaultExternalConfigOptions,
  ExternalRuntimeConfiguration
} from "./common.js";

function adaptDirectory(directory: string): string {
  try {
    accessSync(directory, constants.F_OK);

    return resolve(directory);
  } catch {
    return Nsci.defaultNsciRuntimeConfiguration.rootDir;
  }
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

function isValidWarningMode(
  warningMode: string
): warningMode is Nsci.WarningMode {
  return Object.values(Nsci.warnings).includes(warningMode as Nsci.WarningMode);
}

function isValidWarningKind(
  warningKind: string
): warningKind is Nsci.WarningKind {
  return Nsci.warningKinds.includes(warningKind as Nsci.WarningKind);
}

function adaptWarnings(warnings: Nsci.Warnings): Nsci.Warnings {
  if (typeof warnings === "string" && isValidWarningMode(warnings)) {
    return warnings;
  }

  const warningsWithValidKindAndMode = Object.fromEntries(
    Object.entries(warnings).filter(
      ([warningType, warningMode]) =>
        isValidWarningKind(warningType) && isValidWarningMode(warningMode)
    )
  ) as Nsci.Warnings;

  const hasAtleastOneValidWarningInRecord =
    Object.keys(warningsWithValidKindAndMode).length > 0;

  return hasAtleastOneValidWarningInRecord
    ? warningsWithValidKindAndMode
    : Nsci.warnings.ERROR;
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

  return Nsci.vulnSeverity.MEDIUM;
}

/**
 * In the first place, we need to adapt options from either the CLI, the API or
 * the NodeSecure runtime config file in order to be used as a Nsci.Configuration
 * acting as a standard runtime config format.
 * This adapt takes into account name bindings but also checks validity of values
 * that were supplied from the external world (NodeSecure RC, API, CLI)
 * (e.g: validate severity threshold supplied)
 */
export function adaptExternalToStandardConfiguration(
  sanitizedOptions: Partial<ExternalRuntimeConfiguration>
): Partial<Nsci.Configuration> {
  const { vulnerabilities, directory, strategy, warnings, reporters } = {
    ...defaultExternalConfigOptions,
    ...sanitizedOptions
  };

  return {
    rootDir: adaptDirectory(directory),
    reporters: adaptReporters(reporters),
    strategy: adaptStrategy(strategy),
    vulnerabilitySeverity: adaptSeverity(vulnerabilities),
    warnings: adaptWarnings(warnings),
  };
}
