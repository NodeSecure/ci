import { reporterTarget } from "../../../config/internal/nsci.js";
import { Reporter } from "../../reporter.js";

export const htmlReporter: Reporter = {
  type: reporterTarget.HTML,
  report: (_payload) => Promise.resolve(undefined)
};
