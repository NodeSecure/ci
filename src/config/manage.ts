import { environmentContextReporter } from "../reporting/reporters/index.js";

import { analyzeEnvironmentContext } from "./environment/index.js";
import {
  getNodeSecureConfig,
  standardizeRuntimeConfig,
  ApiConfig,
  CliConfig
} from "./external/index.js";
import { Nsci } from "./standard";

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
