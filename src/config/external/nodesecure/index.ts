import { RC, read } from "@nodesecure/rc";

import {
  ExternalConfigAdapter,
  ExternalRuntimeConfiguration
} from "../common.js";
import { defaultExternalConfigOptions } from "../standardize.js";

export async function generateDefaultNodeSecureConfig(): Promise<RC> {
  return (
    await read(process.cwd(), {
      createIfDoesNotExist: true,
      createMode: "ci"
    })
  ).unwrap();
}

export async function getNodeSecureConfig() {
  try {
    return await (await read(process.cwd())).unwrap();
  } catch {
    return undefined;
  }
}

function adaptNodeSecureConfigToExternalConfig(
  runtimeConfig: RC
): ExternalRuntimeConfiguration {
  return {
    directory: process.cwd(),
    strategy: runtimeConfig.strategy ?? defaultExternalConfigOptions.strategy,
    vulnerabilities:
      runtimeConfig.ci?.vulnerabilities?.severity ??
      defaultExternalConfigOptions.vulnerabilities,
    warnings:
      runtimeConfig.ci?.warnings ?? defaultExternalConfigOptions.warnings,
    reporters:
      runtimeConfig.ci?.reporters ?? defaultExternalConfigOptions.reporters
  };
}

export const NodeSecureConfigAdapter: ExternalConfigAdapter<RC> = {
  adaptToExternalConfig: adaptNodeSecureConfigToExternalConfig
};
