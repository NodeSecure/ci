import { ValueOf } from "./types";

export const vulnStrategy = {
  npm: "NPM_AUDIT",
  node: "SECURITY_WG",
  none: "NONE"
} as const;

export type InputStrategy = keyof typeof vulnStrategy;
export type Strategy = ValueOf<typeof vulnStrategy>;

export const vulnSeverity = {
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
  ALL: "all"
} as const;

export type Severity = ValueOf<typeof vulnSeverity>;

export const warnings = {
  ERROR: "error",
  OFF: "off",
  WARNING: "warning"
} as const;

export type Warnings = ValueOf<typeof warnings>;

export const reporterTarget = {
  CONSOLE: "console",
  HTML: "html"
} as const;

export type ReporterTarget = ValueOf<typeof reporterTarget>;

export type Configuration = {
  rootDir: string;
  strategy: ValueOf<typeof vulnStrategy>;
  reporters: ReporterTarget[];
  vulnerabilitySeverity: ValueOf<typeof vulnSeverity>;
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

export const DEFAULT_RUNTIME_CONFIGURATION = generateDefaultRC();
