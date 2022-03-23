// Import Internal Dependencies
import { Nsci } from "../standard/index.js";

export type ExternalRuntimeConfiguration = {
  directory: string;
  strategy: Nsci.InputStrategy;
  vulnerabilities: Nsci.Severity;
  warnings: Nsci.Warnings;
  reporters: string | Nsci.ReporterTarget[];
};

/**
 * In order to unify all types of external configurations (NodeSecure runtime
 * config, API config, CLI config), we must provide a standard
 * ExternalRuntimeConfiguration type which can be then sanitized, validated and
 * adapted to the standard @nodesecure/ci runtime config format.
 *
 * Consequently each external config must implement an ExternalConfigAdapter
 * which converts any type of config to the ExternalRuntimeConfiguration type.
 * This ExternalRuntimeConfiguration type can then be transparently sanitized,
 * validated without too many edge cases.
 */
export type ExternalConfigAdapter<T> = {
  adaptToExternalConfig: (config: T) => ExternalRuntimeConfiguration;
};

export const defaultExternalConfigOptions: ExternalRuntimeConfiguration = {
  vulnerabilities: Nsci.vulnSeverity.MEDIUM,
  directory: process.cwd(),
  strategy: "npm",
  warnings: Nsci.warnings.ERROR,
  reporters: [Nsci.reporterTarget.CONSOLE]
};
