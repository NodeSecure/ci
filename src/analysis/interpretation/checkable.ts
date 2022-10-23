// Import Third-party Dependencies
import { Scanner } from "@nodesecure/scanner";
import { Strategy } from "@nodesecure/vuln";

// Import Internal Dependencies
import type { DependencyWarning } from "../types";

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
    Scanner.GlobalWarning | DependencyWarning | Strategy.StandardVulnerability
  >
>;

export const FAILING_CHECK: CheckResult = "failed" as const;

export function fromBooleanToCheckResult(result: boolean): CheckResult {
  return result ? "failed" : "passed";
}
