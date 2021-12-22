import { Logger } from "@nodesecure/scanner";
import ms from "pretty-ms";
import Spinner from "@slimio/async-cli-spinner";

import { InterpretedPayload } from "../payload/interpret.js";
import { ValueOf } from "../types/index.js";
import { consolePrinter } from "./console/printer.js";

export type Reporter = {
  type: ReporterTarget;
  report: (payload: InterpretedPayload) => Promise<void>;
};

export const reporterTarget = {
  CONSOLE: "console",
  HTML: "html"
} as const;

export type ReporterTarget = ValueOf<typeof reporterTarget>;

/**
 * This report has nothing to do with console or html reporters. This function
 * is used to print out @nodesecure/scanner's events on project analysis.
 * Consequently, this process is before and independent of the process of
 * reporting either in console or in a .html file.
 * @param logger
 */
export function reportScannerLoggerEvents(logger: Logger) {
  const LAST_SCANNER_EVENT = "registry";

  const spinner = new Spinner({
    text: consolePrinter.util.concatOutputs([
      consolePrinter.font.highlight("@nodesecure/scanner").bold().underline()
        .message,
      consolePrinter.font.standard("Analysis started").bold().message
    ]).message
  });

  logger.once("start", () => {
    spinner.start();
  });

  logger.on("end", (event) => {
    if (event === LAST_SCANNER_EVENT) {
      const { elapsedTime } = spinner;

      const endMessage = consolePrinter.util.concatOutputs([
        consolePrinter.font.highlight("@nodesecure/scanner").bold().underline()
          .message,
        consolePrinter.font.standard("Analysis ended").bold().message,
        consolePrinter.font
          .info(`${ms(elapsedTime)}`)
          .italic()
          .bold().message
      ]).message;

      spinner.succeed(endMessage);
    }
  });
}
