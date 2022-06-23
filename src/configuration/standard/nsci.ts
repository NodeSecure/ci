// Import Third-party Dependencies
import type JSXRay from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import { ValueOf } from "../../types";
import { IgnorePatterns } from "../external/nodesecure/ignore-file";

export const vulnStrategy = {
  npm: "NPM_AUDIT",
  node: "SECURITY_WG",
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

export type WarningMode = ValueOf<typeof warnings>;

// These warnings types should probably come from JSXRay but are hosted here for now

export const warningKinds: Readonly<(JSXRay.WarningName | "unsafe-import")[]> =
  [
    "parsing-error",
    "encoded-literal",
    "unsafe-regex",
    "unsafe-stmt",
    "unsafe-assign",
    "short-identifiers",
    "suspicious-literal",
    "obfuscated-code",
    "unsafe-import"
  ] as const;

export type WarningKind = JSXRay.WarningName | "unsafe-import";

export type Warnings = WarningMode | Record<WarningKind, WarningMode>;

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
    strategy: vulnStrategy.npm,
    reporters: [reporterTarget.CONSOLE],
    vulnerabilitySeverity: vulnSeverity.MEDIUM,
    warnings: warnings.ERROR,
    ignorePatterns: IgnorePatterns.default()
  };
}

export const defaultNsciRuntimeConfiguration = generateDefaultRC();
