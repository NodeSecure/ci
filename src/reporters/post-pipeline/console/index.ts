import { performance } from "perf_hooks";

import ms from "pretty-ms";

import { consolePrinter } from "../../../lib/console-printer/index.js";
import { reporterTarget } from "../../../nodesecurerc.js";
import { pipeline } from "../../../pipeline/index.js";
import { Reporter } from "../../reporter.js";

import { reportDependencyVulns } from "./vulnerabilities.js";
import { reportGlobalWarnings, reportDependencyWarnings } from "./warnings.js";

export const consoleReporter: Reporter = {
  type: reporterTarget.CONSOLE,
  report({ data, status }) {
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.highlight("@nodesecure/ci").bold().underline()
          .message,
        consolePrinter.font.standard("Pipeline check started").bold().message
      ])
      .print();

    const startedAt = performance.now();

    reportGlobalWarnings(data.warnings);
    reportDependencyWarnings(data.dependencies.warnings);
    reportDependencyVulns(data.dependencies.vulnerabilities);

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

    consolePrinter.util.emptyLine();
  }
};
