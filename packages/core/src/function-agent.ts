import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";

import {
  Agent,
  type AgentDefinition,
  type AgentProcessInput,
  type AgentProcessOptions,
} from "./agent";
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
import {
  type PreloadCreator,
  preloadCreatorsToPreloads,
} from "./definitions/preload";
import type { MemorableSearchOutput, MemoryItemWithScore } from "./memorable";
import type { RunnableResponse, RunnableResponseChunk } from "./runnable";
import type { ExtractRunnableOutputType } from "./utils/runnable-type";

@injectable()
export class FunctionAgent<
  I extends { [name: string]: any } = {},
  O extends { [name: string]: any } = {},
  State extends ContextState = ContextState,
  Preloads extends { [name: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
> extends Agent<I, O, State, Preloads, Memories> {
  static create = create;

  constructor(
    @inject(TYPES.definition)
    public override definition: FunctionAgentDefinition<
      I,
      O,
      State,
      Preloads,
      Memories
    >,
    @inject(TYPES.context) context?: Context<State>,
  ) {
    super(definition, context);
  }

  async process(
    input: AgentProcessInput<I, Preloads, Memories>,
    options: AgentProcessOptions<Preloads, Memories>,
  ) {
    const {
      definition: { function: func },
      context,
    } = this;

    if (!func) throw new Error("Function is required");
    if (!context) throw new Error("Context is required");

    return await func(input, { ...options, context });
  }
}

export interface FunctionAgentDefinition<
  I extends { [name: string]: any },
  O extends { [name: string]: any },
  State extends ContextState,
  Preloads extends { [name: string]: any },
  Memories extends { [name: string]: MemoryItemWithScore[] },
> extends AgentDefinition {
  type: "function_agent";

  function?: FunctionFuncType<I, O, State, Preloads, Memories>;
}

export type FunctionFuncType<
  I extends { [name: string]: any },
  O extends { [name: string]: any },
  State extends ContextState,
  Preloads extends { [name: string]: any },
  Memories extends { [name: string]: MemoryItemWithScore[] },
> = (
  input: I & {
    [name in keyof Preloads]: Preloads[name];
  } & {
    [name in keyof Memories]: Memories[name];
  },
  options: { context: Context<State>; preloads: Preloads; memories: Memories },
) =>
  | Promise<
      RunnableResponse<O> | AsyncGenerator<RunnableResponseChunk<O>, void>
    >
  | AsyncGenerator<RunnableResponseChunk<O>, void>;

export interface CreateFunctionAgentOptions<
  I extends { [name: string]: DataTypeSchema },
  O extends { [name: string]: DataTypeSchema },
  State extends ContextState,
  Preloads extends { [name: string]: PreloadCreator<I> },
  Memories extends { [name: string]: CreateRunnableMemory<I> },
> {
  context?: Context<State>;

  name?: string;

  inputs: I;

  outputs: O;

  preloads?: Preloads;

  memories?: Memories;

  function?: FunctionFuncType<
    SchemaMapType<I>,
    SchemaMapType<O>,
    State,
    {
      [name in keyof Preloads]: ExtractRunnableOutputType<
        ReturnType<Preloads[name]>["runnable"]
      >;
    },
    { [key in keyof Memories]: MemorableSearchOutput<Memories[key]["memory"]> }
  >;
}

function create<
  I extends { [name: string]: DataTypeSchema },
  O extends { [name: string]: DataTypeSchema },
  State extends ContextState,
  Preloads extends { [name: string]: PreloadCreator<I> },
  Memories extends { [name: string]: CreateRunnableMemory<I> },
>({
  context,
  ...options
}: CreateFunctionAgentOptions<I, O, State, Preloads, Memories>): FunctionAgent<
  SchemaMapType<I>,
  SchemaMapType<O>,
  State,
  {
    [name in keyof Preloads]: ExtractRunnableOutputType<
      ReturnType<Preloads[name]>["runnable"]
    >;
  },
  { [name in keyof Memories]: MemorableSearchOutput<Memories[name]["memory"]> }
> {
  const agentId = options.name || nanoid();

  const inputs = schemaToDataType(options.inputs);
  const outputs = schemaToDataType(options.outputs);

  const preloads = preloadCreatorsToPreloads(inputs, options.preloads);

  const memories = toRunnableMemories(agentId, inputs, options.memories || {});

  return new FunctionAgent(
    {
      id: agentId,
      name: options.name,
      type: "function_agent",
      inputs,
      outputs,
      preloads,
      memories,
      function: options.function,
    },
    context,
  );
}
