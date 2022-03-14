import type { ValueOf } from "../lib/types";

export const status = {
  SUCCESS: "success",
  FAILURE: "failure"
} as const;

export type Status = ValueOf<typeof status>;

export function getOutcome(result: boolean): Status {
  return result ? status.SUCCESS : status.FAILURE;
}
