export type ValueOf<T> = T[keyof T];

export type DeepPartialRecord<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown>
    ? DeepPartialRecord<T[P]>
    : Partial<T[P]>;
};

export type Maybe<T> = T | undefined;
