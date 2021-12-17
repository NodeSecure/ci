import { Reporter, ReporterTarget } from "../index.js";

export const htmlReporter: Reporter = {
  type: ReporterTarget.HTML,
  report: (_payload) => Promise.resolve(undefined)
};
