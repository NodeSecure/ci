// Import Internal Dependencies
import type { OutcomePayloadFromPipelineChecks } from "../../analysis/index.js";
import type { ReporterTarget } from "../../configuration/standard/nsci.js";

export type Reporter<T = OutcomePayloadFromPipelineChecks, R = void> = {
  type: ReporterTarget;
  report: (payload: T) => R;
};
