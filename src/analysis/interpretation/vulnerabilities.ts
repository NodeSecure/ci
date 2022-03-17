import { Strategy } from "@nodesecure/vuln";

import { Nsci } from "../../configuration/standard/index.js";
import { Maybe } from "../../types/index.js";

import { fromBooleanToCheckResult, CheckableFunction } from "./checkable.js";

function convertSeverityAsNumber(
  severity: Maybe<Strategy.Severity | "all">
): number {
  const severities = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
    info: 0,
    all: 0
  };

  if (severity !== undefined) {
    return severities[severity];
  }

  const DEFAULT_SEVERITY = 0;

  /**
   * When no severity is available on the dependency, which severity should
   * we affect as a default value?
   */
  return DEFAULT_SEVERITY;
}

/**
 * We must ensure that each vulnerability with equal or higher severity than
 * the one defined in the runtime configuration is caught.
 */
function findAllVulnsWithEqualOrHigherSeverity(
  vulnerabilities: Strategy.StandardVulnerability[],
  severity: Strategy.Severity | "all"
): Strategy.StandardVulnerability[] {
  return vulnerabilities.filter(
    (vuln) =>
      convertSeverityAsNumber(vuln.severity) >=
      convertSeverityAsNumber(severity)
  );
}

export function checkDependenciesVulns(
  vulnerabilities: Strategy.StandardVulnerability[],
  runtimeConfiguration: Nsci.Configuration
): CheckableFunction<Strategy.StandardVulnerability> {
  const { vulnerabilitySeverity } = runtimeConfiguration;

  const vulnsClassifiedBySeverity = findAllVulnsWithEqualOrHigherSeverity(
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
