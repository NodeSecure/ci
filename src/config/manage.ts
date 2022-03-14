import { RC as NodeSecureRuntimeConfig } from "@nodesecure/rc";

import { analyzeEnvironmentContext } from "../environment";
import { environmentContextReporter } from "../reporters";

import { ApiConfig } from "./external/api";
import { CliConfig, CliConfigAdapter } from "./external/cli";
import { ExternalRuntimeConfiguration } from "./external/common";
import {
  getNodeSecureConfig,
  NodeSecureConfigAdapter
} from "./external/nodesecure";
import { standardizeExternalConfiguration } from "./external/standardize.js";
import { Nsci } from "./standard";

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
  options: ApiConfig | CliConfig | NodeSecureRuntimeConfig
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
    ...Nsci.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
    ...standardizedNsciConfig
  } as Nsci.Configuration;
}

/**
 * Given that the user can potentially provide two runtime settings at the same time
 * (cli options + .nodesecurerc) or (api options + .nodesecurerc) we must be sure
 * to manage a priority rule where one configuration is chosen in favor of another one.
 *
 * For now, it was decided that .nodesecurerc will take priority over any others
 * settings (api & cli). Consequently if we find a NodeSecure config
 * (i.e: nodesecurerc file), we short circuit the selection and simply return the
 * standardized NodeSecure config.
 */
export async function selectRuntimeConfig(
  options: ApiConfig | CliConfig
): Promise<Nsci.Configuration> {
  const nodesecureConfig = await getNodeSecureConfig();

  if (nodesecureConfig) {
    return standardizeRuntimeConfig(nodesecureConfig);
  }

  return standardizeRuntimeConfig(options);
}

export async function useRuntimeConfig(
  options: ApiConfig | CliConfig
): Promise<Nsci.Configuration> {
  const runtimeConfig = await selectRuntimeConfig(options);
  /**
   * Now that we have our runtime config, we can analyze the user workspace
   * to determine if some options of the config should be changed (sort of autofix).
   * TODO: Maybe provide a way to enable or not this autofix?
   */
  const environment = await analyzeEnvironmentContext(runtimeConfig);
  environmentContextReporter.report(runtimeConfig)(environment);

  return {
    ...runtimeConfig,
    /**
     * Strategy may have been changed depending on the lockfile compatibility.
     * Now that we reported the environment context, we can only keep the most
     * compatible strategy
     */
    strategy: environment.compatibleStrategy
  };
}
