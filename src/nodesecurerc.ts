import { reporterTarget, ReporterTarget } from "./reporters/index.js";

export enum VulnStrategy {
  NPM = "NPM_AUDIT",
  NODE = "SECURITY_WG",
  NONE = "NONE"
}

export enum VulnSeverity {
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
  ALL = "all"
}

export type RuntimeConfiguration = {
  rootDir: string;
  strategy: VulnStrategy;
  reporter: ReporterTarget;
  vulnerabilities: {
    severity: `${VulnSeverity}`;
  };
};

export const DEFAULT_RUNTIME_CONFIGURATION = {
  rootDir: process.cwd(),
  strategy: VulnStrategy.NPM,
  reporter: reporterTarget.CONSOLE,
  vulnerabilities: {
    severity: VulnSeverity.ALL
  }
};
