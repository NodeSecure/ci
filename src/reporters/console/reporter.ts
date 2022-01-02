import { performance } from "perf_hooks";

import { Strategy } from "@nodesecure/vuln";
import pluralize from "pluralize";
import ms from "pretty-ms";

import { reporterTarget } from "../../nodesecurerc.js";
import { WorkableVulnerability } from "../../payload";
import * as pipeline from "../../pipeline.js";
import { DependencyWarning } from "../../types";
import { Reporter } from "../reporter.js";

import { consolePrinter } from "./printer.js";

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
  const numberOfDependencyWarnings = warnings.reduce(
    (accumulatedNumberOfWarnings, dependencyWarning) =>
      accumulatedNumberOfWarnings + dependencyWarning.warnings.length,
    0
  );

  if (numberOfDependencyWarnings > 0) {
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.error("[DEPENDENCY WARNINGS]:").bold().message,
        consolePrinter.font.error(`${numberOfDependencyWarnings}`).bold()
          .message,
        consolePrinter.font.error(
          `${pluralize("warning", numberOfDependencyWarnings)} found`
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
  type: reporterTarget.CONSOLE,
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
          .info(`${ms(endedAt)}`)
          .italic()
          .bold().message
      ])
      .print();

    if (status === pipeline.status.SUCCESS) {
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
