import { ValueOf } from "./types";

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

export const reporterTarget = {
  CONSOLE: "console",
  HTML: "html"
} as const;

export type ReporterTarget = ValueOf<typeof reporterTarget>;

export type RuntimeConfiguration = {
  rootDir: string;
  strategy: VulnStrategy;
  reporter: ReporterTarget;
  vulnerabilities: {
    severity: `${VulnSeverity}`;
  };
  warnings: "off" | "error" | Record<string, "error" | "warning">;
};

export const DEFAULT_RUNTIME_CONFIGURATION: RuntimeConfiguration = {
  rootDir: process.cwd(),
  strategy: VulnStrategy.NPM,
  reporter: reporterTarget.CONSOLE,
  vulnerabilities: {
    severity: VulnSeverity.ALL
  },
  warnings: "error" as const
};
