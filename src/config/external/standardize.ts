import type { DeepPartialRecord } from "../../lib/types";
import { Nsci } from "../standard/index.js";

import * as ExternalConfigAdapters from "./adapters.js";
import { ExternalRuntimeConfiguration } from "./common.js";

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

function mergeConfigs(adaptedConfig: Nsci.Configuration): Nsci.Configuration {
  return {
    ...Nsci.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
    /**
     * We override default config with the one provided from the cli or the api
     * which has just been sanitized and adapted to fit the RC format.
     */
    ...adaptedConfig
  } as Nsci.Configuration;
}

export const defaultExternalConfigOptions: ExternalRuntimeConfiguration = {
  vulnerabilities: Nsci.vulnSeverity.MEDIUM,
  directory: process.cwd(),
  strategy: "npm",
  warnings: Nsci.warnings.ERROR,
  reporters: [Nsci.reporterTarget.CONSOLE]
};

/**
 * In the first place, we need to adapt options from either the CLI, the API or
 * the NodeSecure runtime config file in order to be used as a Nsci.Configuration
 * acting as a standard runtime config format.
 * This adapt takes into account name bindings but also checks validity of values
 * that were supplied from the external world (NodeSecure RC, API, CLI)
 * (e.g: validate severity threshold supplied)
 */
function adaptExternalToStandardConfiguration(
  sanitizedOptions: Partial<ExternalRuntimeConfiguration>
): Nsci.Configuration {
  const { vulnerabilities, directory, strategy, warnings, reporters } = {
    ...defaultExternalConfigOptions,
    ...sanitizedOptions
  };

  return {
    rootDir: ExternalConfigAdapters.adaptDirectory(directory),
    reporters: ExternalConfigAdapters.adaptReporters(reporters),
    strategy: ExternalConfigAdapters.adaptStrategy(strategy),
    vulnerabilitySeverity:
      ExternalConfigAdapters.adaptSeverity(vulnerabilities),
    warnings: ExternalConfigAdapters.adaptWarnings(warnings)
  };
}

export function standardizeExternalConfiguration(
  externalConfig: ExternalRuntimeConfiguration
): DeepPartialRecord<Nsci.Configuration> {
  return mergeConfigs(
    adaptExternalToStandardConfiguration(
      extractOnlyValidPropsFromExternalConfig(externalConfig)
    )
  );
}
