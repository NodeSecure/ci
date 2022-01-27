import { EnvironmentContext } from "../../environment";
import { consolePrinter } from "../../lib/console-printer/index.js";
import { Configuration } from "../../nodesecurerc";

function removeWhiteSpaces(msg: string) {
  return msg.replace(/\s\s+/g, " ");
}

export function reportEnvironmentContext(
  rc: Configuration
): (env: EnvironmentContext) => Promise<void> {
  return async (env) => {
    if (env.lockFile.current === "none") {
      consolePrinter.font
        .standard(`No lockfile could be found in ${rc.rootDir}`)
        .prefix(consolePrinter.font.info("info").message)
        .print();
    } else {
      consolePrinter.util
        .concatOutputs([
          consolePrinter.font.highlight(env.lockFile.current).message,
          consolePrinter.font.standard("will be used during the analysis")
            .message
        ])
        .prefix(consolePrinter.font.info("info").message)
        .print();
    }

    if (env.lockFile.multiple) {
      consolePrinter.font
        .standard(
          removeWhiteSpaces(
            `Your project contains more than one lock file. 
              It is advised not to mix package managers in order to 
              avoid resolution inconsistencies caused by unsynchronized 
              lock files`
          )
        )
        .prefix(consolePrinter.font.info("info").message)
        .print();
    }

    if (env.compatibleStrategy !== rc.strategy) {
      consolePrinter.util
        .concatOutputs([
          consolePrinter.font.info("info").message,
          consolePrinter.font.standard("Provided strategy").message,
          consolePrinter.font.highlight(rc.strategy).message,
          consolePrinter.font.standard("is not compatible with").message,
          consolePrinter.font.highlight(
            env.lockFile.current === "none"
              ? "no lockfile"
              : env.lockFile.current
          ).message
        ])
        .print();

      consolePrinter.util
        .concatOutputs([
          consolePrinter.font.info("info").message,
          consolePrinter.font.standard("Vulnerability strategy swap:").message,
          consolePrinter.font.highlight(rc.strategy).message,
          consolePrinter.font.standard("==>").message,
          consolePrinter.font.highlight(env.compatibleStrategy).message
        ])
        .print();
    }

    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.info("info").message,
        consolePrinter.font.standard("Using").message,
        consolePrinter.font.highlight(env.compatibleStrategy).message,
        consolePrinter.font.standard("vulnerability strategy").message
      ])
      .print();
  };
}
