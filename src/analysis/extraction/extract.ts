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

/**
 * In order to simplify the next step of scanner payload interpretation, we
 * extract reduce the payload data to only match interpreter requirements.
 */
export function extractScannerPayload(
  payload: Scanner.Payload
): CompactedScannerPayload {
  const extractor = new Scanner.Extractors.Payload(payload, [
    new Scanner.Extractors.Probes.Vulnerabilities(),
    new Scanner.Extractors.Probes.Warnings({
      useSpecAsKey: false
    })
  ]);

  const { vulnerabilities, warnings } = extractor.extractAndMerge();

  return {
    warnings: payload.warnings,
    dependencies: {
      warnings: Object.entries(warnings.groups).map(([name, warnings]) => {
        return {
          package: name,
          warnings
        };
      }),
      vulnerabilities: vulnerabilities.filter(keepOnlyWorkableVulns)
    }
  };
}
