import { Strategy } from "@nodesecure/vuln";
import kleur from "kleur";

import { DependencyWarning } from "../../types/index.js";
import { Reporter, ReporterTarget } from "../index.js";

export const consoleReporter: Reporter = {
  type: ReporterTarget.CONSOLE,
  async report({ data }) {
    console.log(kleur.bold().yellow("[START]: @nodesecure/ci checks started"));

    await Promise.all([
      reportGlobalWarnings(data.warnings),
      reportDependencyWarnings(data.dependencies.warnings),
      reportDependencyVulns(data.dependencies.vulnerabilities)
    ]);
  }
};

async function reportGlobalWarnings(warnings: Array<unknown>): Promise<void> {
  if (warnings.length > 0) {
    console.log(kleur.red().bold("Global warnings found"));
  }
}

function reportDependencyWarnings(warnings: DependencyWarning[]): void {
  if (warnings.length > 0) {
    console.log(kleur.red().bold("[WARNINGS] Warnings found"));
  }
}

function reportDependencyVulns(
  vulnerabilities: Strategy.StandardVulnerability[]
) {
  for (const vuln of vulnerabilities) {
    const typeSafeSeverity = vuln.severity as Strategy.Severity;

    const vulnErrorMessage = `[${typeSafeSeverity.toUpperCase()}]: => ${
      vuln.package
    } ${vuln.vulnerableRanges.join(", ")}`;
    console.log(kleur.red().bold(vulnErrorMessage));
  }
}
