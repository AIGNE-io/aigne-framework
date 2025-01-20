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

export type BindAgentInput = {
  from: "ai";
};

export type PickInputFrom<I, From extends BindAgentInput["from"]> = {
  [key in keyof I as I[key] extends { from: From } ? key : never]: I[key];
};

export type OmitBoundAgentInput<
  Case extends BoundAgent,
  From extends BindAgentInput["from"],
> = Omit<
  UnionToIntersection<ExtractRunnableInputType<Case["runnable"]>, {}>,
  keyof PickInputFrom<
    Required<UnionToIntersection<NonNullable<Case["input"]>, {}>>,
    From
  >
>;

export type BindAgentInputs<R extends Runnable> = {
  [key in keyof ExtractRunnableInputType<R>]?: BindAgentInput;
};

export interface BoundAgent<
  R extends Runnable = Runnable,
  I extends BindAgentInputs<R> = BindAgentInputs<R>,
> {
  description?: string;

  runnable: R;

  input?: I;
}
