import { ReporterTarget } from "../nodesecurerc.js";
import { OutcomePayloadFromPipelineChecks } from "../payload/index.js";

export type Reporter<
  T = OutcomePayloadFromPipelineChecks,
  R = Promise<void>
> = {
  type: ReporterTarget;
  report: (payload: T) => R;
};
