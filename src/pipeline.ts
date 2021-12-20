import { ValueOf } from "./types/index.js";

export const pipelineStatus = {
  SUCCESS: "success",
  FAILURE: "failure"
} as const;

export type PipelineStatus = ValueOf<typeof pipelineStatus>;

export function getPipelineStatus(status: boolean): PipelineStatus {
  return status ? pipelineStatus.SUCCESS : pipelineStatus.FAILURE;
}

export function makePipelineFail() {
  process.exit(1);
}
