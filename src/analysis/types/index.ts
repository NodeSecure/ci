// Import Third-party Dependencies
import type { Warning } from "@nodesecure/js-x-ray";

export type DependencyWarning = {
  package: string;
  warnings: Warning[];
};
