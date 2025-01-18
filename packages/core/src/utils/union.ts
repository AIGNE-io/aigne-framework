export type UnionToIntersection<U, O = any> = (
  U extends any
    ? (arg: U) => void
    : never
) extends (arg: infer I) => void
  ? I extends O
    ? I
    : never
  : never;
