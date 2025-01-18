import type { Runnable, RunnableResponseStream } from "../runnable";

export type ExtractRunnableInputType<T> = T extends Runnable<infer I, any>
  ? I
  : never;

export type ExtractRunnableOutputType<T> = T extends Runnable<any, infer O>
  ? Exclude<O, RunnableResponseStream<any>>
  : never;
