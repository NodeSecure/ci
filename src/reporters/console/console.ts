import { Strategy } from "@nodesecure/vuln";
import type { Logger } from "@nodesecure/scanner";
import { performance } from "perf_hooks";

import { pipelineStatus } from "../../pipeline.js";
import { DependencyWarning } from "../../types/index.js";
import { Reporter, ReporterTarget } from "../index.js";
import { consolePrinter, millisecondsToSeconds } from "./printer.js";

function reportGlobalWarnings(warnings: Array<unknown>): void {
  if (warnings.length > 0) {
    consolePrinter
      .error("[GLOBAL_WARNING]: Global warnings found")
      .print();
  }
}

function reportDependencyWarnings(warnings: DependencyWarning[]): void {
  if (warnings.length > 0) {
    consolePrinter
      .error(`[DEPENDENCY_WARNINGS]: ${warnings.length} dependency warnings found`)
      .print();

    for (const warning of warnings) {
      for (const details of warning.warnings) {
        consolePrinter
        .error(
          `[${warning.package}]: ${details.kind} ${details.file ? `in ${details.file}` : ""}`
        )
        .print();
      }
    }
  }
}

function reportDependencyVulns(
  vulnerabilities: Strategy.StandardVulnerability[]
) {
  if (vulnerabilities.length > 0) {
    consolePrinter
    .error(
      `[DEPENDENCY–VULNERABILITIES]: ${vulnerabilities.length} dependency vulnerabilities found`
    ).print();
  }

  for (const vuln of vulnerabilities) {
    const typeSafeSeverity = vuln.severity as Strategy.Severity;
    const vulnErrorMessage = `[${typeSafeSeverity.toUpperCase()}]: => ${
      vuln.package
    } ${vuln.vulnerableRanges.join(", ")}`;
    consolePrinter
      .error(vulnErrorMessage)
      .print();
  }
}

export const consoleReporter: Reporter = {
  type: ReporterTarget.CONSOLE,
  async report({ data, status }) {
    consolePrinter
      .standard("[NCI] @nodesecure/ci checks started")
      .print();

    const startedAt = performance.now();
    await Promise.all([
      reportGlobalWarnings(data.warnings),
      reportDependencyWarnings(data.dependencies.warnings),
      reportDependencyVulns(data.dependencies.vulnerabilities)
    ]);

    const endedAt = performance.now() - startedAt;
    consolePrinter.concatMessages(
      consolePrinter.standard("[NCI] @nodesecure/ci checks ended").message,
      consolePrinter.info(`=> Took ${millisecondsToSeconds(endedAt)}`).message
    ).print();

    if (status === pipelineStatus.SUCCESS) {
      consolePrinter
        .success("[SUCCESS] @nodesecure/ci passed all checks")
        .print();
    } else {
      consolePrinter
        .failure("[FAILURE] @nodesecure/ci failed to pass")
        .print();
    }
  }
};

export function reportScannerLoggerEvents(logger: Logger) {
  let startedAt = 0;
  const LAST_SCANNER_EVENT = "registry";

  logger.once("start", () => {
    startedAt = performance.now();
    consolePrinter
      .standard("[SCANNER] Analysis started")
      .print();
  });

  logger.on("end", (event) => {
    if (event === LAST_SCANNER_EVENT) {
      const endedAt = performance.now() - startedAt;
      consolePrinter.concatMessages(
        consolePrinter.standard("[SCANNER] Analysis ended").message,
        consolePrinter.info(`=> Took ${millisecondsToSeconds(endedAt)}`).message
      ).print();
    }
  });
}
