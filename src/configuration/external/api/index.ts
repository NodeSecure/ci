import { Nsci } from "../../standard/index.js";
import { ExternalConfigAdapter } from "../common.js";

export type ApiConfig = {
  directory: string;
  strategy: Nsci.InputStrategy;
  vulnerabilities: Nsci.Severity;
  warnings: Nsci.Warnings;
  reporters: string | Nsci.ReporterTarget[];
};

export const ApiConfigAdapter: ExternalConfigAdapter<ApiConfig> = {
  adaptToExternalConfig: (config) => config
};
