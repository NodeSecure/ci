import { GlobalWarning } from "@nodesecure/scanner/types/scanner";
import { Strategy } from "@nodesecure/vuln";

import { DependencyWarning } from "../types";

export type CheckResult = "failed" | "passed";

export type CheckableFunction<T> = {
  result: CheckResult;
  data: {
    key: string;
    value: T[];
  };
};

export type PipelineCheckFunctions = Array<
  () => CheckableFunction<
    GlobalWarning | DependencyWarning | Strategy.StandardVulnerability
  >
>;

export const FAILING_CHECK: CheckResult = "failed";

export function convertBooleanAsCheckResult(result: boolean) {
  return result ? "failed" : "passed";
}
