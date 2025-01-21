import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";

import {
  Agent,
  type AgentDefinition,
  type AgentMemories,
  type AgentPreloads,
  type AgentProcessInput,
  type AgentProcessOptions,
  type CreateAgentInputSchema,
  type CreateAgentMemoriesSchema,
  type CreateAgentMemoriesType,
  type CreateAgentOptions,
  type CreateAgentOutputSchema,
  type CreateAgentPreloadsSchema,
  type CreateAgentPreloadsType,
} from "./agent";
import { TYPES } from "./constants";
import type { Context, ContextState } from "./context";
import { type SchemaToType, schemaToDataType } from "./definitions/data-schema";
import { toRunnableMemories } from "./definitions/memory";
import { preloadCreatorsToPreloads } from "./definitions/preload";
import type {
  RunnableInput,
  RunnableOutput,
  RunnableResponse,
  RunnableResponseChunk,
} from "./runnable";

@injectable()
export class FunctionAgent<
  I extends RunnableInput = RunnableInput,
  O extends RunnableOutput = RunnableOutput,
  State extends ContextState = ContextState,
  Preloads extends AgentPreloads = AgentPreloads,
  Memories extends AgentMemories = AgentMemories,
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
  I extends RunnableInput,
  O extends RunnableOutput,
  State extends ContextState,
  Preloads extends AgentPreloads,
  Memories extends AgentMemories,
> extends AgentDefinition {
  type: "function_agent";

  function?: FunctionFuncType<I, O, State, Preloads, Memories>;
}

export type FunctionFuncType<
  I extends RunnableInput,
  O extends RunnableOutput,
  State extends ContextState,
  Preloads extends AgentPreloads,
  Memories extends AgentMemories,
> = (
  input: AgentProcessInput<I, Preloads, Memories>,
  options: { context: Context<State>; preloads: Preloads; memories: Memories },
) =>
  | Promise<
      RunnableResponse<O> | AsyncGenerator<RunnableResponseChunk<O>, void>
    >
  | AsyncGenerator<RunnableResponseChunk<O>, void>;

function create<
  I extends CreateAgentInputSchema,
  O extends CreateAgentOutputSchema,
  State extends ContextState,
  Preloads extends CreateAgentPreloadsSchema<I>,
  Memories extends CreateAgentMemoriesSchema<I>,
>(
  options: CreateAgentOptions<I, O, State, Preloads, Memories> & {
    function?: FunctionFuncType<
      SchemaToType<I>,
      SchemaToType<O>,
      State,
      CreateAgentPreloadsType<I, Preloads>,
      CreateAgentMemoriesType<I, Memories>
    >;
  },
): FunctionAgent<
  SchemaToType<I>,
  SchemaToType<O>,
  State,
  CreateAgentPreloadsType<I, Preloads>,
  CreateAgentMemoriesType<I, Memories>
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
    options.context,
  );
}
