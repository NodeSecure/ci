import { Nsci } from "../../standard/index.js";
import { ExternalConfigAdapter } from "../common.js";

type ApiConfig = {
  directory: string;
  strategy: Nsci.InputStrategy;
  vulnerabilities: Nsci.Severity;
  warnings: Nsci.Warnings;
  reporters: string | Nsci.ReporterTarget[];
};

export const apiConfigAdapter: ExternalConfigAdapter<ApiConfig> = {
  adaptToExternalConfig: (config) => config
};
