// Import Node.js Dependencies
import { performance } from "node:perf_hooks";

// Import Third-party Dependencies
import ms from "pretty-ms";

// Import Internal Dependencies
import { consolePrinter } from "../../../../../lib/console-printer/index.js";
import type { OutcomePayloadFromPipelineChecks } from "../../../../analysis/interpretation/interpret.js";
import { Nsci } from "../../../../configuration/standard/index.js";
import type { Reporter } from "../../reporter.js";

import { reportDependencyWarnings } from "./dependency-warnings.js";
import { reportGlobalWarnings } from "./global-warnings.js";
import { printPipelineOutcome } from "./outcome.js";
import { reportDependencyVulns } from "./vulnerabilities.js";

function printPipelineStart(): void {
  consolePrinter.util
    .concatOutputs([
      consolePrinter.font.highlight("@nodesecure/ci").bold().underline()
        .message,
      consolePrinter.font.standard("Pipeline checks started").bold().message
    ])
    .printWithEmptyLine();
}

function printEndPipeline(endedAt: number): void {
  consolePrinter.util
    .concatOutputs([
      consolePrinter.font.highlight("@nodesecure/ci").bold().underline()
        .message,
      consolePrinter.font.standard("Pipeline checks ended").bold().message,
      consolePrinter.font
        .info(`${ms(endedAt)}`)
        .italic()
        .bold().message
    ])
    .printWithEmptyLine();
}

export const consoleReporter: Reporter<
  OutcomePayloadFromPipelineChecks & Nsci.Configuration
> = {
  type: Nsci.reporterTarget.CONSOLE,
  report({ data, status, warnings }) {
    const startedAt = performance.now();
    printPipelineStart();

    reportGlobalWarnings(data.warnings);
    reportDependencyWarnings(
      data.dependencies.warnings,
      // For now, we are only dealing with union types
      warnings as Nsci.Warnings
    );
    reportDependencyVulns(data.dependencies.vulnerabilities);

    const endedAt = performance.now() - startedAt;
    printEndPipeline(endedAt);
    printPipelineOutcome(data, status, warnings as Nsci.Warnings);
  }
};
