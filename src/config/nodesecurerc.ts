import { ValueOf } from "../types";

export const vulnStrategy = {
  NPM: "NPM_AUDIT",
  NODE: "SECURITY_WG",
  NONE: "NONE"
} as const;

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
  vulnerabilities: {
    severity: ValueOf<typeof vulnSeverity>;
  };
  warnings: Warnings | Record<string, Warnings>;
};

function generateDefaultRC(): Configuration {
  return {
    rootDir: process.cwd(),
    strategy: vulnStrategy.NPM,
    reporters: [reporterTarget.CONSOLE],
    vulnerabilities: {
      severity: vulnSeverity.ALL
    },
    warnings: warnings.ERROR
  };
}

export const DEFAULT_RUNTIME_CONFIGURATION = generateDefaultRC();
