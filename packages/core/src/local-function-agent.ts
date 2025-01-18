import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";

import { Agent, type AgentProcessOptions } from "./agent";
import { TYPES } from "./constants";
import type { Context, ContextState } from "./context";
import {
  type DataTypeSchema,
  type SchemaMapType,
  schemaToDataType,
} from "./definitions/data-type-schema";
import {
  type CreateRunnableMemory,
  toRunnableMemories,
} from "./definitions/memory";
import type { MemorableSearchOutput, MemoryItemWithScore } from "./memorable";
import type {
  RunnableDefinition,
  RunnableResponse,
  RunnableResponseChunk,
} from "./runnable";

@injectable()
export class LocalFunctionAgent<
  I extends { [name: string]: any } = {},
  O extends { [name: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
  State extends ContextState = ContextState,
> extends Agent<I, O, Memories, State> {
  static create = create;

  constructor(
    @inject(TYPES.definition)
    public override definition: LocalFunctionAgentDefinition<
      I,
      O,
      Memories,
      State
    >,
    @inject(TYPES.context) context?: Context<State>,
  ) {
    super(definition, context);
  }

  async process(input: I, options: AgentProcessOptions<Memories>) {
    const {
      definition: { function: func },
      context,
    } = this;

    if (!func) throw new Error("Function is required");
    if (!context) throw new Error("Context is required");

    return await func(input, { context, memories: options.memories });
  }
}

export interface LocalFunctionAgentDefinition<
  I extends { [name: string]: any },
  O extends { [name: string]: any },
  Memories extends { [name: string]: MemoryItemWithScore[] },
  State extends ContextState,
> extends RunnableDefinition {
  type: "local_function_agent";

  function?: LocalFunctionFuncType<I, O, Memories, State>;
}

export type LocalFunctionFuncType<
  I extends { [name: string]: any },
  O extends { [name: string]: any },
  Memories extends { [name: string]: MemoryItemWithScore[] },
  State extends ContextState,
> = (
  input: I,
  options: {
    memories: Memories;
    context: Context<State>;
  },
) =>
  | Promise<
      RunnableResponse<O> | AsyncGenerator<RunnableResponseChunk<O>, void>
    >
  | AsyncGenerator<RunnableResponseChunk<O>, void>;

export interface CreateLocalFunctionAgentOptions<
  I extends { [name: string]: DataTypeSchema },
  O extends { [name: string]: DataTypeSchema },
  Memories extends { [name: string]: CreateRunnableMemory<I> },
  State extends ContextState,
> {
  context?: Context<State>;

  name?: string;

  inputs: I;

  outputs: O;

  memories?: Memories;

  function?: LocalFunctionFuncType<
    SchemaMapType<I>,
    SchemaMapType<O>,
    { [key in keyof Memories]: MemorableSearchOutput<Memories[key]["memory"]> },
    State
  >;
}

function create<
  I extends { [name: string]: DataTypeSchema },
  O extends { [name: string]: DataTypeSchema },
  Memories extends { [name: string]: CreateRunnableMemory<I> },
  State extends ContextState,
>({
  context,
  ...options
}: CreateLocalFunctionAgentOptions<I, O, Memories, State>): LocalFunctionAgent<
  SchemaMapType<I>,
  SchemaMapType<O>,
  { [name in keyof Memories]: MemorableSearchOutput<Memories[name]["memory"]> },
  State
> {
  const agentId = options.name || nanoid();

  const inputs = schemaToDataType(options.inputs);
  const outputs = schemaToDataType(options.outputs);

  const memories = toRunnableMemories(agentId, inputs, options.memories || {});

  return new LocalFunctionAgent(
    {
      id: agentId,
      name: options.name,
      type: "local_function_agent",
      inputs,
      outputs,
      memories,
      function: options.function,
    },
    context,
  );
}
