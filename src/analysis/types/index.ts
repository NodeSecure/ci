import { Warning } from "@nodesecure/js-x-ray";

export type DependencyWarning = {
  package: string;
  warnings: Warning[];
};
