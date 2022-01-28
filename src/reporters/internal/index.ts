import { EnvironmentContext } from "../../environment/index.js";
import * as RC from "../../nodesecurerc.js";
import { Reporter } from "../reporter.js";

import { reportEnvironmentContext } from "./environment.js";

export const internalReporter: Reporter<
  RC.Configuration,
  (env: EnvironmentContext) => void
> = {
  type: RC.reporterTarget.CONSOLE,
  report: reportEnvironmentContext
};

export * from "./scanner.js";
