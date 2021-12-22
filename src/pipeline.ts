import { ValueOf } from "./types/index.js";

export const status = {
  SUCCESS: "success",
  FAILURE: "failure"
} as const;

export type Status = ValueOf<typeof status>;

export function getStatus(result: boolean): Status {
  return result ? status.SUCCESS : status.FAILURE;
}

export function fail() {
  process.exit(1);
}
