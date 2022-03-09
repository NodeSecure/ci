import { ReporterTarget } from "../config/nodesecurerc.js";
import { OutcomePayloadFromPipelineChecks } from "../payload/index.js";

export type Reporter<T = OutcomePayloadFromPipelineChecks, R = void> = {
  type: ReporterTarget;
  report: (payload: T) => R;
};
