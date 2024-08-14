// Import Third-party Dependencies
import type { StandardVulnerability } from "@nodesecure/vulnera";

// Import Internal Dependencies
import type { DependencyWarning } from "../types/index.js";

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
    string | DependencyWarning | StandardVulnerability
  >
>;

export const FAILING_CHECK: CheckResult = "failed" as const;

export function fromBooleanToCheckResult(result: boolean): CheckResult {
  return result ? "failed" : "passed";
}
