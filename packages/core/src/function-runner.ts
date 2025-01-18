import { Agent } from "./agent";
import type { Context, ContextState } from "./context";
import type { MemoryItemWithScore } from "./memorable";
import { OrderedRecord } from "./utils";

export interface FunctionRunnerInput<
  I extends { [name: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
  State extends ContextState = ContextState,
> {
  name: string;
  language?: string;
  code: string;
  input: I;
  memories: Memories;
  context: Pick<Context<State>, "state">;
}

export type FunctionRunnerOutput<O> = O;

export abstract class FunctionRunner<
  I extends { [name: string]: any } = {},
  O extends { [name: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
  State extends ContextState = ContextState,
> extends Agent<
  FunctionRunnerInput<I, Memories, State>,
  FunctionRunnerOutput<O>
> {
  constructor(context?: Context) {
    super(
      {
        id: "function_runner",
        type: "function_runner",
        name: "Function Runner",
        description: "Run a function",
        inputs: OrderedRecord.fromArray([
          { id: "name", name: "name", type: "string", required: true },
          { id: "language", name: "language", type: "string" },
          { id: "code", name: "code", type: "string", required: true },
          { id: "input", name: "input", type: "object", required: true },
          { id: "memories", name: "memories", type: "object", required: true },
          { id: "context", name: "context", type: "object", required: true },
        ]),
        outputs: OrderedRecord.fromArray([
          {
            id: "result",
            name: "result",
            type: "object",
          },
        ]),
      },
      context,
    );
  }
}
