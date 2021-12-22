import { Scanner } from "@nodesecure/scanner";
import { Strategy } from "@nodesecure/vuln";

import {
  DependencyWarning,
  ScannerDependencies,
  GlobalWarning
} from "../types/index.js";

export type CompactedScannerPayload = {
  warnings: GlobalWarning[];
  dependencies: {
    warnings: DependencyWarning[];
    vulnerabilities: WorkableVulnerability[];
  };
};

export type WorkableVulnerability = Strategy.StandardVulnerability & {
  severity: Strategy.Severity;
  package: string;
};

function keepOnlyWorkableVulns(
  vuln: Strategy.StandardVulnerability
): vuln is WorkableVulnerability {
  return vuln.severity !== undefined || vuln.package !== undefined;
}

function extractDependenciesVulns(
  dependencies: ScannerDependencies
): WorkableVulnerability[] {
  return Object.entries(dependencies)
    .flatMap(([_packageName, packageData]) => packageData.vulnerabilities)
    .filter(keepOnlyWorkableVulns);
}

function extractDependenciesWarnings(
  dependencies: ScannerDependencies
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

// eslint-disable-next-line id-length
function extractDependenciesVulnsAndWarnings(
  dependencies: ScannerDependencies
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
  const { warnings: globalWarnings, dependencies } = payload;
  const { warnings, vulnerabilities } =
    extractDependenciesVulnsAndWarnings(dependencies);

  return {
    warnings: globalWarnings,
    dependencies: {
      warnings,
      vulnerabilities
    }
  };
}
