import { Nsci } from "../standard/index.js";

export type ExternalRuntimeConfiguration = {
  directory: string;
  strategy: Nsci.InputStrategy;
  vulnerabilities: Nsci.Severity;
  warnings: Nsci.Warnings;
  reporters: string | Nsci.ReporterTarget[];
};

export type ConfigAdapter<T extends Record<string, unknown>> = {
  adaptToStandardConfig: (config: T | Partial<T>) => Nsci.Configuration;
};
