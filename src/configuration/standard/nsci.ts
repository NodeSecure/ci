// Import Third-party Dependencies
import * as jsxray from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import type { ValueOf } from "../../types/index.js";
import { IgnorePatterns } from "../external/nodesecure/ignore-file.js";

export const vulnStrategy = {
  "github-advisory": "GITHUB-ADVISORY",
  snyk: "SNYK",
  sonatype: "SONATYPE",
  none: "NONE"
} as const;

export type InputStrategy = keyof typeof vulnStrategy;
export type OutputStrategy = ValueOf<typeof vulnStrategy>;

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
export const warningNames = Object.keys(jsxray.warnings) as Array<WarningName>;

export type WarningMode = ValueOf<typeof warnings>;
export type WarningName = keyof typeof jsxray.warnings;
export type Warnings = WarningMode | Record<jsxray.WarningName, WarningMode>;

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
  warnings: Warnings;
  ignorePatterns: IgnorePatterns;
};

function generateDefaultRC(): Configuration {
  return {
    rootDir: process.cwd(),
    strategy: vulnStrategy["github-advisory"],
    reporters: [reporterTarget.CONSOLE],
    vulnerabilitySeverity: vulnSeverity.MEDIUM,
    warnings: warnings.ERROR,
    ignorePatterns: IgnorePatterns.default()
  };
}

export const defaultNsciRuntimeConfiguration = generateDefaultRC();
