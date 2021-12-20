import { Strategy } from "@nodesecure/vuln";
import type { Logger } from "@nodesecure/scanner";
import { performance } from "perf_hooks";

import { pipelineStatus } from "../../pipeline.js";
import { DependencyWarning } from "../../types/index.js";
import { Reporter, ReporterTarget } from "../index.js";
import { consolePrinter } from "./printer.js";
import { formatMilliseconds } from "./format.js";

function reportGlobalWarnings(warnings: Array<unknown>): void {
  if (warnings.length > 0) {
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.error("[GLOBAL WARNING]:").bold().message,
        consolePrinter.font.error(`${warnings.length} global warnings found`)
          .message
      ])
      .print();
  }
}

function reportDependencyWarnings(warnings: DependencyWarning[]): void {
  if (warnings.length > 0) {
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.error("[DEPENDENCY WARNINGS]:").bold().message,
        consolePrinter.font.error(
          `${warnings.length} dependency warnings found`
        ).message
      ])
      .print();

    for (const warning of warnings) {
      for (const details of warning.warnings) {
        const warningPath = consolePrinter.font.standard(
          `${details.file ? `${warning.package}/${details.file}` : ""}`
        ).message;

        const warningLocation = consolePrinter.font.info(
          `${
            details.file
              ? `${details.location.flatMap((location) => location.join(":"))}`
              : ""
          }`
        ).message;

        consolePrinter.util
          .concatOutputs([
            consolePrinter.font.error(`${details.kind}`).bold().message,
            `${warningPath}:${warningLocation}`
          ])
          .print();
      }
    }
  }
}

function reportDependencyVulns(
  vulnerabilities: Strategy.StandardVulnerability[]
) {
  if (vulnerabilities.length > 0) {
    consolePrinter.font
      .error(
        `[DEPENDENCY VULNERABILITIES]: ${vulnerabilities.length} dependency vulnerabilities found`
      )
      .bold()
      .print();
  }

  for (const vuln of vulnerabilities) {
    const typeSafeSeverity = vuln.severity as Strategy.Severity;
    const vulnSeverity = `${typeSafeSeverity.toUpperCase()} vulnerability`;
    const vulnRanges = vuln.vulnerableRanges.join(", ");

    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.error(`[${vuln.package}]`).message,
        consolePrinter.font.error(vulnSeverity).bold().message,
        consolePrinter.font.info(vulnRanges).bold().message
      ])
      .print();
  }
}

export const consoleReporter: Reporter = {
  type: ReporterTarget.CONSOLE,
  async report({ data, status }) {
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.highlight("@nodesecure/ci").bold().underline()
          .message,
        consolePrinter.font.standard("Pipeline check started").message
      ])
      .print();

    const startedAt = performance.now();
    await Promise.all([
      reportGlobalWarnings(data.warnings),
      reportDependencyWarnings(data.dependencies.warnings),
      reportDependencyVulns(data.dependencies.vulnerabilities)
    ]);

    const endedAt = performance.now() - startedAt;
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.highlight("@nodesecure/ci").bold().underline()
          .message,
        consolePrinter.font.standard("Pipeline check ended").message,
        consolePrinter.font
          .info(`=> Took ${formatMilliseconds(endedAt)}`)
          .underline().message
      ])
      .print();

    if (status === pipelineStatus.SUCCESS) {
      consolePrinter.font
        .success("[SUCCESS] Pipeline successful")
        .bold()
        .print();
    } else {
      consolePrinter.font
        .failure("[FAILURE] Pipeline failed")
        .bold()
        .print();
    }

    consolePrinter.font.standard("").print();
  }
};

export function reportScannerLoggerEvents(logger: Logger) {
  let startedAt = 0;
  const LAST_SCANNER_EVENT = "registry";

  logger.once("start", () => {
    startedAt = performance.now();
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.highlight("@nodesecure/scanner").bold().underline()
          .message,
        consolePrinter.font.standard("Analysis started").bold().message
      ])
      .print();
  });

  logger.on("end", (event) => {
    if (event === LAST_SCANNER_EVENT) {
      const endedAt = performance.now() - startedAt;
      consolePrinter.util
        .concatOutputs([
          consolePrinter.font
            .highlight("@nodesecure/scanner")
            .bold()
            .underline().message,
          consolePrinter.font.standard("Analysis ended").bold().message,
          consolePrinter.font
            .info(`=> Took ${formatMilliseconds(endedAt)}`)
            .underline().message
        ])
        .print();
    }
  });
}
