import { ValueOf as Nsci } from "../../lib/types";

export const vulnStrategy = {
  npm: "NPM_AUDIT",
  node: "SECURITY_WG",
  none: "NONE"
} as const;

export type InputStrategy = keyof typeof vulnStrategy;
export type OutputStrategy = Nsci<typeof vulnStrategy>;

export const vulnSeverity = {
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
  ALL: "all"
} as const;

export type Severity = Nsci<typeof vulnSeverity>;

export const warnings = {
  ERROR: "error",
  OFF: "off",
  WARNING: "warning"
} as const;

export type Warnings = Nsci<typeof warnings>;

export const reporterTarget = {
  CONSOLE: "console",
  HTML: "html"
} as const;

export type ReporterTarget = Nsci<typeof reporterTarget>;

export type Configuration = {
  rootDir: string;
  strategy: Nsci<typeof vulnStrategy>;
  reporters: ReporterTarget[];
  vulnerabilitySeverity: Nsci<typeof vulnSeverity>;
  warnings: Warnings | Record<string, Warnings>;
};

function generateDefaultRC(): Configuration {
  return {
    rootDir: process.cwd(),
    strategy: vulnStrategy.npm,
    reporters: [reporterTarget.CONSOLE],
    vulnerabilitySeverity: vulnSeverity.ALL,
    warnings: warnings.ERROR
  };
}

export const DEFAULT_NSCI_RUNTIME_CONFIGURATION = generateDefaultRC();
