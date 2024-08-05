// Import Third-party Dependencies
import { Strategy } from "@nodesecure/vuln";

// Import Internal Dependencies
import { Nsci } from "../../configuration/standard/index.js";
import { Maybe } from "../../types/index.js";

import { fromBooleanToCheckResult, CheckableFunction } from "./checkable.js";

const kSeverities = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
  all: 0
} as const;

const kDefaultSeverity = 0;

function fromSeverityToNumber(
  severity: Maybe<"info" | "low" | "medium" | "high" | "critical" | "all">
): number {
  if (severity !== undefined) {
    return kSeverities[severity];
  }

  /**
   * When no severity is available on the dependency, which severity should
   * we affect as a default value?
   */
  return kDefaultSeverity;
}

function compareVulnSeverityWithThreshold(
  severityThreshold: Strategy.Severity | "all"
) {
  return (vulnerability: Strategy.StandardVulnerability): boolean =>
    fromSeverityToNumber(vulnerability.severity) >=
    fromSeverityToNumber(severityThreshold);
}

/**
 * We must ensure that each vulnerability with equal or higher severity than
 * the one defined in the runtime configuration is caught.
 */
function findAllVulnsExceedingSeverityThreshold(
  vulnerabilities: Strategy.StandardVulnerability[],
  severityThreshold: Strategy.Severity | "all"
): Strategy.StandardVulnerability[] {
  const isVulnExceedingSeverityThreshold =
    compareVulnSeverityWithThreshold(severityThreshold);

  return vulnerabilities.filter(isVulnExceedingSeverityThreshold);
}

export function checkDependenciesVulns(
  vulnerabilities: Strategy.StandardVulnerability[],
  runtimeConfiguration: Nsci.Configuration
): CheckableFunction<Strategy.StandardVulnerability> {
  const { vulnerabilitySeverity } = runtimeConfiguration;

  const vulnsClassifiedBySeverity = findAllVulnsExceedingSeverityThreshold(
    vulnerabilities,
    vulnerabilitySeverity
  );

  return {
    result: fromBooleanToCheckResult(vulnsClassifiedBySeverity.length > 0),
    data: {
      key: "dependencies.vulnerabilities",
      value: vulnsClassifiedBySeverity
    }
  };
}
