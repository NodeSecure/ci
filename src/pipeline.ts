import { Scanner } from "@nodesecure/scanner";
import { RuntimeConfiguration } from "./nodesecurerc.js";
import { runPayloadInterpreter } from "./payload/interpret.js";
import { runReporter } from "./reporters/runner.js";
import { ValueOf } from "./types/index.js";

export const status = {
  SUCCESS: "success",
  FAILURE: "failure"
} as const;

export type Status = ValueOf<typeof status>;

export function getStatus(result: boolean): Status {
  return result ? status.SUCCESS : status.FAILURE;
}

function fail() {
  process.exit(1);
}

export async function runChecks(
  payload: Scanner.Payload,
  rc: RuntimeConfiguration
) {
  const interpretedPayload = runPayloadInterpreter(payload, rc);
  await runReporter(interpretedPayload, rc);

  if (interpretedPayload.status === status.FAILURE) {
    fail();
  }
}
