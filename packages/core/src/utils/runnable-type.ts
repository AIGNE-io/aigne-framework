import type { Runnable, RunnableResponseStream } from "../runnable";
import type { UnionToIntersection } from "./union";

export type ExtractRunnableInputType<T> = T extends Runnable<infer I, any>
  ? I
  : never;

export type ExtractRunnableOutputType<T> = T extends Runnable<any, infer O>
  ? Exclude<O, RunnableResponseStream<any>>
  : never;

export type ExtractRunnableInputTypeIntersection<T> = UnionToIntersection<
  ExtractRunnableInputType<T>,
  {}
>;

export type ExtractRunnableOutputTypeIntersection<T> = UnionToIntersection<
  ExtractRunnableOutputType<T>,
  {}
>;
