import { Strategy } from "@nodesecure/vuln";

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
};

const kDefaultSeverity = 0;

function fromSeverityToNumber(
  severity: Maybe<Strategy.Severity | "all">
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

function isVulnExceedingSeverityThreshold(
  vulnSeverity: Strategy.StandardVulnerability["severity"],
  severityThreshold: Strategy.Severity | "all"
): boolean {
  return (
    fromSeverityToNumber(vulnSeverity) >=
    fromSeverityToNumber(severityThreshold)
  );
}

/**
 * We must ensure that each vulnerability with equal or higher severity than
 * the one defined in the runtime configuration is caught.
 */
function findAllVulnsExceedingSeverityThreshold(
  vulnerabilities: Strategy.StandardVulnerability[],
  severityThreshold: Strategy.Severity | "all"
): Strategy.StandardVulnerability[] {
  return vulnerabilities.filter((vuln) =>
    isVulnExceedingSeverityThreshold(vuln.severity, severityThreshold)
  );
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
