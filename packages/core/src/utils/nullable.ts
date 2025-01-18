export type MakeNullablePropertyOptional<T extends { [key: string]: any }> = {
  [K in keyof T as Extract<T[K], null | undefined> extends never
    ? K
    : never]: T[K];
} & {
  [K in keyof T as Extract<T[K], null | undefined> extends never
    ? never
    : K]?: T[K];
};
