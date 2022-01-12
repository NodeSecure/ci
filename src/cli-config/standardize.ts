import * as RC from "../nodesecurerc.js";
import { DeepPartialRecord } from "../types/index.js";

import {
  adaptReporters,
  adaptSeverity,
  adaptStrategy,
  adaptWarnings,
  adaptDirectory
} from "./adapters.js";

function isInvalidConfigOption<T>(value: T): boolean {
  const isEmptyString =
    typeof value === "string" && value.replace(/\s/g, "") === "";

  const isEmptyArray = Array.isArray(value) && value.length === 0;

  return isEmptyArray || isEmptyString;
}

function extractValidPropsFromConfig(
  partialConfig: DeepPartialRecord<RC.Configuration>
): DeepPartialRecord<RC.Configuration> {
  /**
   * We only keep valid options provided from the CLI. Otherwise it would introduce
   * inconsistency when merging with the default RC.
   */
  const filteredEntries = Object.entries(partialConfig).filter(
    ([, value]) => !isInvalidConfigOption(value)
  );

  return Object.fromEntries(filteredEntries);
}

function mergeConfigs(
  partialConfig: DeepPartialRecord<RC.Configuration>
): RC.Configuration {
  const validatedPartialConfig = extractValidPropsFromConfig(partialConfig);

  return {
    ...RC.DEFAULT_RUNTIME_CONFIGURATION,
    // we override default config with the one provided from the cli
    ...validatedPartialConfig
  } as RC.Configuration;
}

export type CliInputOptions = {
  directory: string;
  strategy: string;
  vulnerabilities: string;
  warnings: string;
  reporters: string;
};

/**
 * In the first place, we need to adapt options from the CLI in order to
 * be used as a RC.Configuration structure.
 * This adapt takes into account name bindings but also checks about values
 * that were supplied from the CLI (e.g: valid severity threshold supplied)
 */
function adaptConfigOptions(
  options: CliInputOptions
): DeepPartialRecord<RC.Configuration> {
  const { vulnerabilities, directory, strategy, warnings, reporters } = options;

  return {
    rootDir: adaptDirectory(directory),
    reporters: adaptReporters(reporters),
    strategy: adaptStrategy(strategy),
    vulnerabilitySeverity: adaptSeverity(vulnerabilities),
    warnings: adaptWarnings(warnings)
  };
}

export function standardizeConfig(
  externalConfig: CliInputOptions
): DeepPartialRecord<RC.Configuration> {
  return mergeConfigs(adaptConfigOptions(externalConfig));
}
