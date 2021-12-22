import { Reporter, reporterTarget } from "../index.js";

export const htmlReporter: Reporter = {
  type: reporterTarget.HTML,
  report: (_payload) => Promise.resolve(undefined)
};
