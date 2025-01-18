export type OmitPropsFromUnion<
  T,
  K extends string | number | symbol,
> = T extends any ? Omit<T, K> : never;
