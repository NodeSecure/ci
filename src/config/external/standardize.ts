import type { DeepPartialRecord } from "../../lib/types";
import { Nsci } from "../standard/index.js";

import { ConfigAdapter, ExternalRuntimeConfiguration } from "./common.js";

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
  vulnerabilities: Nsci.vulnSeverity.ALL,
  directory: process.cwd(),
  strategy: "npm",
  warnings: Nsci.warnings.ERROR,
  reporters: [Nsci.reporterTarget.CONSOLE]
};

export function provideAdapterInOrderToStandardize(
  configAdapter: ConfigAdapter<ExternalRuntimeConfiguration>
) {
  return function standardize(
    externalConfig: ExternalRuntimeConfiguration
  ): DeepPartialRecord<Nsci.Configuration> {
    return mergeConfigs(
      configAdapter.adaptToStandardConfig(
        extractOnlyValidPropsFromExternalConfig(externalConfig)
      )
    );
  };
}
