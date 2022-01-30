import { consolePrinter } from "../../../lib/console-printer/index.js";
import { Warnings } from "../../../nodesecurerc";

export function printWarnOrError(warningsMode: Warnings) {
  /**
   * warningsMode is only a string for now. In the future, a Record could be provided
   * in a ESLint manneer. Consequently, this function would need more context
   * to know whether if the warnings should be printed as an error or a warning.
   */
  return warningsMode === "error"
    ? consolePrinter.font.error
    : consolePrinter.font.info;
}
