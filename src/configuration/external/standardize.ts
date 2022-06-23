// Import Third-party Dependencies
import { RC as NodeSecureRuntimeConfig } from "@nodesecure/rc";

// Import Internal Dependencies
import { IgnorePatterns } from "../../configuration/external/nodesecure/ignore-file";
import { Nsci } from "../standard/index.js";

import { adaptExternalToStandardConfiguration } from "./adapt.js";
import { ApiConfig } from "./api/index.js";
import { CliConfig, CliConfigAdapter } from "./cli/index.js";
import { ExternalRuntimeConfiguration } from "./common.js";
import { NodeSecureConfigAdapter } from "./nodesecure/index.js";

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

function mergeConfigs(
  adaptedConfig: Partial<Nsci.Configuration>
): Nsci.Configuration {
  return {
    ...Nsci.defaultNsciRuntimeConfiguration,
    /**
     * We override default config with the one provided from the cli or the api
     * which has just been sanitized and adapted to fit the RC format.
     */
    ...adaptedConfig
  } as Nsci.Configuration;
}

export function standardizeExternalConfiguration(
  externalConfig: ExternalRuntimeConfiguration
): Nsci.Configuration {
  return mergeConfigs(
    adaptExternalToStandardConfiguration(
      extractOnlyValidPropsFromExternalConfig(externalConfig)
    )
  );
}

function isNodeSecureRuntimeConfig(
  options: ApiConfig | CliConfig | NodeSecureRuntimeConfig
): options is NodeSecureRuntimeConfig {
  return "ci" in options;
}

/**
 * For now, ApiConfig and CliConfig use the same config interface but its
 * a coincidence so we must be sure to create two types and two adapters if they
 * even diverge.
 * On the other hand NodeSecure config is different by nature and has its own
 * adapter.
 */
export function standardizeAllApisOptions(
  options: ApiConfig | CliConfig | NodeSecureRuntimeConfig
): ExternalRuntimeConfiguration {
  if (isNodeSecureRuntimeConfig(options)) {
    return NodeSecureConfigAdapter.adaptToExternalConfig(options);
  }

  return CliConfigAdapter.adaptToExternalConfig(options);
}

export async function standardizeRuntimeConfig(
  options: ApiConfig | CliConfig | NodeSecureRuntimeConfig,
  ignorePatterns: IgnorePatterns
): Promise<Nsci.Configuration> {
  const externalConfiguration = standardizeAllApisOptions(options);
  const standardizedNsciConfig = standardizeExternalConfiguration(
    externalConfiguration
  );

  return {
    /**
     * The default @nodesecure/ci runtime configuration comes from a constant
     * and should be used as a fallback when no external config or a partial one
     * is provided.
     * The external config can be coming from three distincts sources:
     * - NodeSecure runtime config (.nodesecurerc file)
     * - CLI config when running the script through the CLI
     * - API config when using the module API
     *
     * This ensure that we have a consistent representation of the @nodesecure/ci
     * runtime configuration wherever the options are coming from.
     */
    ...Nsci.defaultNsciRuntimeConfiguration,
    ...standardizedNsciConfig,
    ignorePatterns
  } as Nsci.Configuration;
}
