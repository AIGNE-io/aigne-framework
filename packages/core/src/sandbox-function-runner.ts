import {
  Agent,
  type AgentDefinition,
  type AgentMemories,
  type AgentPreloads,
} from "./agent";
import type { Context, ContextState } from "./context";
import type { MemoryItemWithScore } from "./memorable";
import type { RunnableInput, RunnableOutput } from "./runnable";
import { OrderedRecord } from "./utils";

export type SandboxFunctionRunnerInput<
  Input extends RunnableInput = RunnableInput,
  State extends ContextState = ContextState,
  Preloads extends AgentPreloads = AgentPreloads,
  Memories extends AgentMemories = AgentMemories,
> = {
  name: string;
  language?: string;
  code: string;
  input: Input;
  preloads: Preloads;
  memories: Memories;
  context: Pick<Context<State>, "state">;
};

export type SandboxFunctionRunnerOutput<Output extends RunnableOutput> = Output;

export abstract class SandboxFunctionRunner<
  I extends RunnableInput = RunnableInput,
  O extends RunnableOutput = RunnableOutput,
  State extends ContextState = ContextState,
  Preloads extends AgentPreloads = AgentPreloads,
  Memories extends AgentMemories = AgentMemories,
> extends Agent<
  SandboxFunctionRunnerInput<I, State, Preloads, Memories>,
  SandboxFunctionRunnerOutput<O>
> {
  constructor(context?: Context) {
    super(
      {
        id: "sandbox_function_runner",
        type: "sandbox_function_runner",
        name: "Sandbox Function Runner",
        description: "Run a function",
        inputs: OrderedRecord.fromArray([
          { id: "name", name: "name", type: "string", required: true },
          { id: "language", name: "language", type: "string" },
          { id: "code", name: "code", type: "string", required: true },
          { id: "input", name: "input", type: "object", required: true },
          { id: "preloads", name: "preloads", type: "object", required: true },
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
