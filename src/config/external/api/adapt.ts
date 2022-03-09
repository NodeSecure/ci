import { cliConfigAdapter } from "../cli/adapt.js";
import { ConfigAdapter, ExternalRuntimeConfiguration } from "../common.js";

/**
 * We are binding towards the CLI adapter because for now its a coincidence that
 * both CLI and API generate the same external configuration and share the same adapters.
 * Nevertheless, we want to make clear that they remain conceptually different by
 * scoping them in their own folders and with their own custom adapters.
 */
export const apiConfigAdapter: ConfigAdapter<ExternalRuntimeConfiguration> = {
  adaptToStandardConfig: cliConfigAdapter.adaptToStandardConfig
};
