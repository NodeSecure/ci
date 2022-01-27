import { ReporterTarget } from "../nodesecurerc.js";
import { InterpretedPayload } from "../payload/index.js";

export type Reporter<T = InterpretedPayload, R = Promise<void>> = {
  type: ReporterTarget;
  report: (payload: T) => R;
};
