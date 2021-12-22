import { Strategy } from "@nodesecure/vuln";
import type { Logger } from "@nodesecure/scanner";
import { performance } from "perf_hooks";

import { pipelineStatus } from "../../pipeline.js";
import { DependencyWarning } from "../../types/index.js";
import { Reporter, ReporterTarget } from "../index.js";
import { consolePrinter } from "./printer.js";
import { formatMilliseconds, pluralize } from "./format.js";
import { WorkableVulnerability } from "../../payload/extract.js";
import Spinner from "@slimio/async-cli-spinner";

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
        consolePrinter.font.error(`${warnings.length}`).bold().message,
        consolePrinter.font.error(
          `${pluralize("warning", warnings.length)} found`
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
            consolePrinter.font.error(details.kind).bold().underline().message,
            `${warningPath}:${warningLocation}`
          ])
          .print();
      }
    }
  }
}

function getColorBySeverity(severity: Strategy.Severity) {
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

function reportDependencyVulns(vulnerabilities: WorkableVulnerability[]) {
  const vulnsLength = vulnerabilities.length;
  if (vulnsLength > 0) {
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.error("[DEPENDENCY VULNERABILITIES]:").bold()
          .message,
        consolePrinter.font.error(`${vulnsLength}`).bold().message,
        consolePrinter.font.error(
          `${pluralize("vulnerability", vulnsLength)} found`
        ).message
      ])
      .print();
  }

  for (const vuln of vulnerabilities) {
    const vulnRanges = vuln.vulnerableRanges.join(", ");
    const vulnColored = getColorBySeverity(vuln.severity);
    consolePrinter.util
      .concatOutputs([
        vulnColored.bold().underline().message,
        consolePrinter.font.standard(`${vuln.package}`).bold().message,
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
        consolePrinter.font.standard("Pipeline check started").bold().message
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
        consolePrinter.font.standard("Pipeline check ended").bold().message,
        consolePrinter.font
          .info(`${formatMilliseconds(endedAt)}`)
          .italic()
          .bold().message
      ])
      .print();

    if (status === pipelineStatus.SUCCESS) {
      consolePrinter.font
        .success("[SUCCESS] Pipeline successful")
        .bold()
        .print();
    } else {
      consolePrinter.font.failure("[FAILURE] Pipeline failed").bold().print();
    }

    consolePrinter.font.standard("").print();
  }
};

export function reportScannerLoggerEvents(logger: Logger) {
  let startedAt = 0;
  const LAST_SCANNER_EVENT = "registry";

  const spinner = new Spinner({
    text: consolePrinter.util.concatOutputs([
      consolePrinter.font.highlight("@nodesecure/scanner").bold().underline()
        .message,
      consolePrinter.font.standard("Analysis started").bold().message
    ]).message
  });

  logger.once("start", () => {
    startedAt = performance.now();
    spinner.start();
  });

  logger.on("end", (event) => {
    if (event === LAST_SCANNER_EVENT) {
      const endedAt = performance.now() - startedAt;

      const endMessage = consolePrinter.util.concatOutputs([
        consolePrinter.font.highlight("@nodesecure/scanner").bold().underline()
          .message,
        consolePrinter.font.standard("Analysis ended").bold().message,
        consolePrinter.font
          .info(`${formatMilliseconds(endedAt)}`)
          .italic()
          .bold().message
      ]).message;

      spinner.succeed(endMessage);
    }
  });
}
