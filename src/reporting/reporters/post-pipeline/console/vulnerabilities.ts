// Import Third-party Dependencies
import type {
  Severity
} from "@nodesecure/vulnera";
import pluralize from "pluralize";

// Import Internal Dependencies
import {
  type ConsoleMessage,
  consolePrinter
} from "../../../../../lib/console-printer/index.js";
import type { WorkableVulnerability } from "../../../../analysis/index.js";

import { buildOutcomeStatsConsoleMessage } from "./util.js";

function getColorBySeverity(severity: Severity): ConsoleMessage {
  switch (severity) {
    case "critical":
      return consolePrinter.font.highlight(severity);
    case "high":
      return consolePrinter.font.error(severity);
    case "medium":
      return consolePrinter.font.info(severity);
    case "info":
      return consolePrinter.font.standard(severity);
    case "low":
      return consolePrinter.font.standard(severity);
    default:
      return consolePrinter.font.error(severity);
  }
}

export function reportDependencyVulns(
  vulnerabilities: WorkableVulnerability[]
): void {
  const vulnsLength = vulnerabilities.length;
  if (vulnsLength > 0) {
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.error(`✖ ${vulnsLength}`).bold().message,
        consolePrinter.font
          .error(`${pluralize("vulnerability", vulnsLength)}`)
          .bold().message
      ])
      .printWithEmptyLine();

    for (const vuln of vulnerabilities) {
      const vulnRanges = vuln.vulnerableRanges.join(", ");
      const vulnColored = getColorBySeverity(vuln.severity);
      consolePrinter.util
        .concatOutputs([
          vulnColored.bold().underline().message,
          consolePrinter.font.standard(`(${vuln.package}):`).bold().message,
          consolePrinter.font.standard(vuln.title).italic().message,
          consolePrinter.font.info(vulnRanges).bold().message
        ])
        .printWithEmptyLine();
    }
  }
  else {
    consolePrinter.font
      .success("✓ 0 vulnerabilities detected in the dependency tree")
      .bold()
      .printWithEmptyLine();
  }
}

export function buildVulnerabilitiesOutcomeMessage(
  numberOfVulnerabilities: number
): ConsoleMessage {
  return buildOutcomeStatsConsoleMessage(numberOfVulnerabilities, "error");
}
