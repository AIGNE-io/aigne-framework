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
import type { RunnableDefinition } from "./runnable";
import type { SandboxFunctionRunner } from "./sandbox-function-runner";
import type { ExtractRunnableOutputType } from "./utils/runnable-type";

@injectable()
export class SandboxFunctionAgent<
  I extends { [name: string]: any } = {},
  O extends { [name: string]: any } = {},
  State extends ContextState = ContextState,
  Preloads extends { [name: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
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

export interface CreateSandboxFunctionAgentOptions<
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

  language?: string;

  code: string;
}

export function create<
  I extends { [name: string]: DataTypeSchema },
  O extends { [name: string]: DataTypeSchema },
  State extends ContextState,
  Preloads extends { [name: string]: PreloadCreator<I> },
  Memories extends { [name: string]: CreateRunnableMemory<I> },
>({
  context,
  ...options
}: CreateSandboxFunctionAgentOptions<
  I,
  O,
  State,
  Preloads,
  Memories
>): SandboxFunctionAgent<
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
    context,
  );
}

export interface SandboxFunctionAgentDefinition extends AgentDefinition {
  type: "sandbox_function_agent";

  language?: string;

  code?: string;
}
