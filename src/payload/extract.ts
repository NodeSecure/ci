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
    vulnerabilities: Strategy.StandardVulnerability[];
  };
};

function extractDependenciesVulns(
  dependencies: ScannerDependencies
): Strategy.StandardVulnerability[] {
  return Object.entries(dependencies).flatMap(
    ([_packageName, packageData]) => packageData.vulnerabilities
  );
}

function extractDependenciesWarnings(dependencies: ScannerDependencies): {
  package: string;
  warnings: Omit<JSXRay.BaseWarning, "value">[];
}[] {
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
  warnings: {
    package: string;
    warnings: Omit<JSXRay.BaseWarning, "value">[];
  }[];
  vulnerabilities: Strategy.StandardVulnerability[];
} {
  const warnings = extractDependenciesWarnings(dependencies);
  const vulnerabilities = extractDependenciesVulns(dependencies);

  return { warnings, vulnerabilities };
}

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
