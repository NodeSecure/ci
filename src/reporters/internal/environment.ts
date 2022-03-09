import * as RC from "../../config/internal/nsci.js";
import { EnvironmentContext } from "../../environment";
import {
  consolePrinter,
  removeWhiteSpaces
} from "../../lib/console-printer/index.js";
import { Reporter } from "../reporter.js";

function invertRecord(obj: Record<string, string>): Record<string, string> {
  const invertedEntries = Object.entries(obj).map(([key, value]) => [
    value,
    key
  ]);

  return Object.fromEntries(invertedEntries);
}

const vulnStrategiesLabels = invertRecord(RC.vulnStrategy);

function dumpInputCommand(rc: RC.Configuration): void {
  const inputStrategy = invertRecord(RC.vulnStrategy)[rc.strategy];
  const inputVulnerability = rc.vulnerabilitySeverity;
  const inputWarnings =
    typeof rc.warnings === "string" ? rc.warnings : "object-literal";
  const reporters =
    rc.reporters.length === 0 ? undefined : rc.reporters.join(", ");

  consolePrinter.util
    .concatOutputs([
      consolePrinter.font.standard(`--strategy=${inputStrategy} `).message,
      consolePrinter.font.standard(`--vulnerabilities=${inputVulnerability} `)
        .message,
      consolePrinter.font.standard(`--warnings=${inputWarnings}`).message,
      consolePrinter.font.standard(reporters ? `--reporters=${reporters}` : "")
        .message
    ])
    .prefix(consolePrinter.font.info("node_modules/.bin/nsci").message)
    .print();
}

function reportLockFileContext(
  env: EnvironmentContext,
  rc: RC.Configuration
): void {
  if (env.lockFile.current === "none") {
    consolePrinter.font
      .standard(`No lockfile could be found in ${rc.rootDir}`)
      .prefix(consolePrinter.font.info("info").message)
      .print();
  } else {
    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.highlight(env.lockFile.current).message,
        consolePrinter.font.standard("will be used during the analysis").message
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
      .print();

    consolePrinter.util
      .concatOutputs([
        consolePrinter.font.info("info").message,
        consolePrinter.font.standard("Vulnerability strategy swap:").message,
        consolePrinter.font.highlight(rcStrategy).message,
        consolePrinter.font.standard("==>").message,
        consolePrinter.font.highlight(compatibleStrategy).message
      ])
      .print();
  }

  consolePrinter.util
    .concatOutputs([
      consolePrinter.font.info("info").message,
      consolePrinter.font.standard("Using").message,
      consolePrinter.font.highlight(compatibleStrategy).message,
      consolePrinter.font.standard("vulnerability strategy").message
    ])
    .print();
}

function reportEnvironmentContext(
  rc: RC.Configuration
): (env: EnvironmentContext) => void {
  return (env) => {
    dumpInputCommand(rc);
    reportLockFileContext(env, rc);
  };
}

export const environmentContextReporter: Reporter<
  RC.Configuration,
  (env: EnvironmentContext) => void
> = {
  type: RC.reporterTarget.CONSOLE,
  report: reportEnvironmentContext
};
