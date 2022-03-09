import type { DeepPartialRecord } from "../../lib/types";
import * as RC from "../internal/nsci.js";

import {
  adaptReporters,
  adaptSeverity,
  adaptStrategy,
  adaptWarnings,
  adaptDirectory
} from "./adapters.js";

export type ExternalRuntimeConfiguration = {
  directory: string;
  strategy: RC.InputStrategy;
  vulnerabilities: RC.Severity;
  warnings: RC.Warnings;
  reporters: string | RC.ReporterTarget[];
};

function isInvalidConfigOption<T>(value: T): boolean {
  const isEmptyString =
    typeof value === "string" && value.replace(/\s/g, "") === "";

  const isEmptyArray = Array.isArray(value) && value.length === 0;
  const isUndefinedOrNull = !value;

  return isEmptyArray || isEmptyString || isUndefinedOrNull;
}

function extractOnlyValidPropsFromExternalConfig(
  partialConfig: Partial<ExternalRuntimeConfiguration>
): Partial<ExternalRuntimeConfiguration> {
  if (!partialConfig) {
    return {};
  }
  /**
   * We only keep valid options provided from the CLI or through the API.
   * Otherwise it would introduce inconsistency when merging with the default RC.
   */
  const filteredEntries = Object.entries(partialConfig).filter(
    ([, value]) => !isInvalidConfigOption(value)
  );

  return Object.fromEntries(filteredEntries);
}

function mergeConfigs(adaptedConfig: RC.Configuration): RC.Configuration {
  return {
    ...RC.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
    /**
     * We override default config with the one provided from the cli or the api
     * which has just been sanitized and adapted to fit the RC format.
     */
    ...adaptedConfig
  } as RC.Configuration;
}

export const defaultExternalConfigOptions: ExternalRuntimeConfiguration = {
  vulnerabilities: RC.vulnSeverity.ALL,
  directory: process.cwd(),
  strategy: "npm",
  warnings: RC.warnings.ERROR,
  reporters: [RC.reporterTarget.CONSOLE]
};

/**
 * In the first place, we need to adapt options from the either the CLI or
 * the API call in order to be used as a RC.Configuration structure.
 * This adapt takes into account name bindings but also checks validity of values
 * that were supplied from the external world (API or CLI)
 * (e.g: valid severity threshold supplied)
 */
function adaptExternalToStandardConfiguration(
  sanitizedOptions: Partial<ExternalRuntimeConfiguration>
): RC.Configuration {
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

export function standardizeConfig(
  externalConfig: ExternalRuntimeConfiguration
): DeepPartialRecord<RC.Configuration> {
  return mergeConfigs(
    adaptExternalToStandardConfiguration(
      extractOnlyValidPropsFromExternalConfig(externalConfig)
    )
  );
}
