import { OutcomePayloadFromPipelineChecks } from "../../analysis/index.js";
import { ReporterTarget } from "../../config/standard/nsci.js";

export type Reporter<T = OutcomePayloadFromPipelineChecks, R = void> = {
  type: ReporterTarget;
  report: (payload: T) => R;
};
