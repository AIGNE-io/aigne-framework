export type ArrayElement<T> = T extends (infer U)[] ? U : never;
