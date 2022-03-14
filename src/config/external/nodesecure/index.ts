import { RC as NodeSecureRuntimeConfig, read } from "@nodesecure/rc";

import { Maybe } from "../../../lib/types/index.js";
import {
  defaultExternalConfigOptions,
  ExternalConfigAdapter,
  ExternalRuntimeConfiguration
} from "../common.js";

export async function generateDefaultNodeSecureConfig(): Promise<NodeSecureRuntimeConfig> {
  return (
    await read(process.cwd(), {
      createIfDoesNotExist: true,
      createMode: "ci"
    })
  ).unwrap();
}

export async function getNodeSecureConfig(): Promise<
  Maybe<NodeSecureRuntimeConfig>
> {
  try {
    return await (await read(process.cwd())).unwrap();
  } catch {
    return undefined;
  }
}

function adaptNodeSecureConfigToExternalConfig(
  runtimeConfig: NodeSecureRuntimeConfig
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

export const NodeSecureConfigAdapter: ExternalConfigAdapter<NodeSecureRuntimeConfig> =
  {
    adaptToExternalConfig: adaptNodeSecureConfigToExternalConfig
  };
