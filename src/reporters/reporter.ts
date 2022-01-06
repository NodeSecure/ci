import { Logger, ScannerLoggerEvents } from "@nodesecure/scanner";
import Spinner from "@slimio/async-cli-spinner";
import ms from "pretty-ms";

import { ReporterTarget } from "../nodesecurerc.js";
import { InterpretedPayload } from "../payload/index.js";

import { consolePrinter } from "./console/index.js";

export type Reporter = {
  type: ReporterTarget;
  report: (payload: InterpretedPayload) => Promise<void>;
};

/**
 * This report has nothing to do with console or html reporters. This function
 * is used to print out @nodesecure/scanner's events on project analysis.
 * Consequently, this process is before and independent of the process of
 * reporting either in console or in a .html file.
 * @param logger
 */
export function reportScannerLoggerEvents(logger: Logger) {
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

  logger.once(ScannerLoggerEvents.done, () => {
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
  });
}
