// Import Internal Dependencies
import { reporterTarget } from "../../../../configuration/standard/nsci.js";
import type { Reporter } from "../../reporter.js";

export const htmlReporter: Reporter = {
  type: reporterTarget.HTML,
  report: (_payload) => Promise.resolve(undefined)
};
