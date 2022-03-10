import { Nsci } from "../../standard/index.js";
import { ExternalConfigAdapter } from "../common.js";

type CliConfig = {
  directory: string;
  strategy: Nsci.InputStrategy;
  vulnerabilities: Nsci.Severity;
  warnings: Nsci.Warnings;
  reporters: string | Nsci.ReporterTarget[];
};

export const cliConfigAdapter: ExternalConfigAdapter<CliConfig> = {
  adaptToExternalConfig: (config) => config
};
