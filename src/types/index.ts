import { Scanner } from "@nodesecure/scanner";

export type ValueOf<T> = T[keyof T];

/**
 * These types are used to enhance @nodesecure type definitions.
 * In the near feature, these types will be directly colocalized with packages.
 */
export type DependencyWarning = {
  package: string;
  warnings: Omit<JSXRay.BaseWarning, "value">[];
};

export type ScannerDependencies = Record<string, Scanner.Dependency>;

export type GlobalWarning = Record<string, unknown>;
