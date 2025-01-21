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
import type { RunnableInput, RunnableOutput } from "./runnable";
import type { SandboxFunctionRunner } from "./sandbox-function-runner";

@injectable()
export class SandboxFunctionAgent<
  I extends RunnableInput = RunnableInput,
  O extends RunnableOutput = RunnableOutput,
  State extends ContextState = ContextState,
  Preloads extends AgentPreloads = AgentPreloads,
  Memories extends AgentMemories = AgentMemories,
> extends Agent<I, O, State, Preloads, Memories> {
  static create = create;

  constructor(
    @inject(TYPES.definition)
    public override definition: SandboxFunctionAgentDefinition,
    @inject(TYPES.context) context?: Context<State>,
    @inject(TYPES.sandboxFunctionRunner)
    public runner?: SandboxFunctionRunner<I, O, State, Preloads, Memories>,
  ) {
    super(definition, context);
    this.runner ??= context?.resolveDependency(TYPES.sandboxFunctionRunner);
  }

  async process(
    input: AgentProcessInput<I, Preloads, Memories>,
    options: AgentProcessOptions<Preloads, Memories>,
  ) {
    const {
      definition: { language, code, ...definition },
      runner,
      context,
    } = this;

    if (!runner) throw new Error("Sandbox function runner is required");
    if (!code) throw new Error("Code is required");
    if (!context) throw new Error("Context is required");

    return await runner.run(
      {
        name: definition.name || definition.id,
        language,
        code,
        input,
        preloads: options.preloads,
        memories: options.memories,
        context: { state: context.state },
      },
      { stream: true },
    );
  }
}

export function create<
  I extends CreateAgentInputSchema,
  O extends CreateAgentOutputSchema,
  State extends ContextState,
  Preloads extends CreateAgentPreloadsSchema<I>,
  Memories extends CreateAgentMemoriesSchema<I>,
>(
  options: CreateAgentOptions<I, O, State, Preloads, Memories> & {
    language?: string;
    code: string;
  },
): SandboxFunctionAgent<
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
  const memories = toRunnableMemories(agentId, inputs, options.memories ?? {});

  return new SandboxFunctionAgent(
    {
      id: agentId,
      name: options.name,
      type: "sandbox_function_agent",
      inputs,
      outputs,
      preloads,
      memories,
      language: options.language,
      code: options.code,
    },
    options.context,
  );
}

export interface SandboxFunctionAgentDefinition extends AgentDefinition {
  type: "sandbox_function_agent";

  language?: string;

  code?: string;
}
