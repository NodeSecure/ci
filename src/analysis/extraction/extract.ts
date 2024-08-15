// Import Third-party Dependencies
import * as Scanner from "@nodesecure/scanner";
import type {
  StandardVulnerability,
  Severity
} from "@nodesecure/vulnera";

// Import Internal Dependencies
import type { DependencyWarning } from "../types/index.js";

export interface CompactedScannerPayload {
  warnings: string[];
  dependencies: {
    warnings: DependencyWarning[];
    vulnerabilities: WorkableVulnerability[];
  };
}

export type WorkableVulnerability = StandardVulnerability & {
  severity: Severity;
  package: string;
};

function keepOnlyWorkableVulns(
  vuln: StandardVulnerability
): vuln is WorkableVulnerability {
  return vuln.severity !== undefined || vuln.package !== undefined;
}

function extractDependenciesVulns(
  dependencies: Scanner.Dependencies
): WorkableVulnerability[] {
  return Object.entries(dependencies)
    .flatMap(([_packageName, packageData]) => packageData.vulnerabilities)
    .filter(keepOnlyWorkableVulns);
}

function extractDependenciesWarnings(
  dependencies: Scanner.Dependencies
): DependencyWarning[] {
  return Object.entries(dependencies).map(([packageName, packageData]) => {
    return {
      package: packageName,
      warnings: Object.values(packageData.versions).flatMap(
        (packageVersionData) => packageVersionData.warnings
      )
    };
  });
}

function extractDependenciesVulnsAndWarnings(
  dependencies: Scanner.Dependencies
): {
    warnings: DependencyWarning[];
    vulnerabilities: WorkableVulnerability[];
  } {
  const warnings = extractDependenciesWarnings(dependencies);
  const vulnerabilities = extractDependenciesVulns(dependencies);

  return { warnings, vulnerabilities };
}

/**
 * In order to simplify the next step of scanner payload interpretation, we
 * extract reduce the payload data to only match interpreter requirements.
 */
export function extractScannerPayload(
  payload: Scanner.Payload
): CompactedScannerPayload {
  const { warnings, vulnerabilities } = extractDependenciesVulnsAndWarnings(
    payload.dependencies
  );

  return {
    warnings: payload.warnings,
    dependencies: {
      warnings,
      vulnerabilities
    }
  };
}
