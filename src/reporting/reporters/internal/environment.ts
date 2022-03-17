import {
  consolePrinter,
  removeWhiteSpaces
} from "../../../../lib/console-printer/index.js";
import { EnvironmentContext } from "../../../configuration/environment";
import { Nsci } from "../../../configuration/standard/index.js";
import { Reporter } from "../reporter.js";

import { invertRecord } from "./util.js";

const vulnStrategiesLabels = invertRecord(Nsci.vulnStrategy);

function reportLockFileContext(
  env: EnvironmentContext,
  rc: Nsci.Configuration
): void {
  if (env.lockFile.current === "none") {
    consolePrinter.font
      .standard(`No lockfile could be found in ${rc.rootDir}`)
      .prefix(consolePrinter.font.info("info").message)
      .printWithEmptyLine();
  } else {
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.highlight(env.lockFile.current).message,
        consolePrinter.font.standard("will be used during the analysis").message
      ])
      .prefix(consolePrinter.font.info("info").message)
      .printWithEmptyLine();
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
      .printWithEmptyLine();
  }

  const rcStrategy = vulnStrategiesLabels[rc.strategy];
  const compatibleStrategy = vulnStrategiesLabels[env.compatibleStrategy];

  if (env.compatibleStrategy !== rc.strategy) {
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.info("info").message,
        consolePrinter.font.standard("Provided strategy").message,
        consolePrinter.font.highlight(rcStrategy).message,
        consolePrinter.font.standard("is not compatible with").message,
        consolePrinter.font.highlight(
          env.lockFile.current === "none" ? "no lockfile" : env.lockFile.current
        ).message
      ])
      .printWithEmptyLine();

    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.info("info").message,
        consolePrinter.font.standard("Vulnerability strategy swap:").message,
        consolePrinter.font.highlight(rcStrategy).message,
        consolePrinter.font.standard("==>").message,
        consolePrinter.font.highlight(compatibleStrategy).message
      ])
      .printWithEmptyLine();
  }

  consolePrinter.util
    .concatOutputs([
      consolePrinter.font.info("info").message,
      consolePrinter.font.standard("Using").message,
      consolePrinter.font.highlight(compatibleStrategy).message,
      consolePrinter.font.standard("vulnerability strategy").message
    ])
    .printWithEmptyLine();
}

function reportEnvironmentContext(
  rc: Nsci.Configuration
): (env: EnvironmentContext) => void {
  return (env): void => {
    reportLockFileContext(env, rc);
  };
}

export const environmentContextReporter: Reporter<
  Nsci.Configuration,
  (env: EnvironmentContext) => void
> = {
  type: Nsci.reporterTarget.CONSOLE,
  report: reportEnvironmentContext
};
