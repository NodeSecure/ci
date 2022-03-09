import { ReporterTarget } from "../config/internal/nsci.js";
import { OutcomePayloadFromPipelineChecks } from "../payload/index.js";

export type Reporter<T = OutcomePayloadFromPipelineChecks, R = void> = {
  type: ReporterTarget;
  report: (payload: T) => R;
};
