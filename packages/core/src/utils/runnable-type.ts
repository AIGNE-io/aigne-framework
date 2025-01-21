import type {
  Runnable,
  RunnableInput,
  RunnableOutput,
  RunnableResponseStream,
} from "../runnable";
import type { UnionToIntersection } from "./union";

export type ExtractRunnableInputType<T> = T extends Runnable<
  infer I,
  RunnableOutput
>
  ? I
  : never;

export type ExtractRunnableOutputType<T> = T extends Runnable<
  RunnableInput,
  infer O
>
  ? Exclude<O, RunnableResponseStream<unknown>>
  : never;

export type ExtractRunnableInputTypeIntersection<T> = UnionToIntersection<
  ExtractRunnableInputType<T>,
  Record<string, unknown>
>;
