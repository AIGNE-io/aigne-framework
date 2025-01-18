import type { Runnable } from "./runnable";

export interface Agent<I extends { [key: string]: any }, O>
  extends Runnable<I, O> {}
