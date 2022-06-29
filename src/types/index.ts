export type ValueOf<T> = T[keyof T];

export type DeepPartialRecord<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown>
    ? DeepPartialRecord<T[P]>
    : Partial<T[P]>;
};

export type Warning = Omit<JSXRay.BaseWarning, "value">;

export type Warnings = Warning[];

/**
 * These types are used to enhance @nodesecure type definitions.
 * In the near feature, these types will be directly colocalized with packages.
 */
export type DependencyWarning = {
  package: string;
  warnings: Warnings;
};

export type Maybe<T> = T | undefined;
