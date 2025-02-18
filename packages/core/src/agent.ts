import type { Context, ContextState } from "./context";
import type { DataSchema } from "./definitions/data-schema";
import type { AgentMemory, CreateRunnableMemory } from "./definitions/memory";
import type {
  AgentPreload,
  BindAgentInputs,
  BoundAgent,
  PreloadCreator,
} from "./definitions/preload";
import type {
  MemorableSearchOutput,
  MemoryItemWithScore,
  MemoryMessage,
} from "./memorable";
import {
  type RunOptions,
  Runnable,
  type RunnableDefinition,
  type RunnableInput,
  type RunnableOutput,
  type RunnableResponse,
  type RunnableResponseChunk,
  type RunnableResponseStream,
} from "./runnable";
import {
  OrderedRecord,
  extractOutputsFromRunnableOutput,
  isAsyncGenerator,
  isNonNullable,
  objectToRunnableResponseStream,
  renderMessage,
  runnableResponseStreamToObject,
} from "./utils";
import { logger } from "./utils/logger";
import type { ExtractRunnableOutputType } from "./utils/runnable-type";

export type AgentPreloads = Record<string, unknown>;

export type AgentMemories = Record<string, MemoryItemWithScore[]>;

export abstract class Agent<
  I extends RunnableInput = RunnableInput,
  O extends RunnableOutput = RunnableOutput,
  State extends ContextState = ContextState,
  Preloads extends AgentPreloads = AgentPreloads,
  Memories extends AgentMemories = AgentMemories,
> extends Runnable<I, O, State> {
  constructor(
    public definition: AgentDefinition,
    public context?: Context<State>,
  ) {
    super(definition, context);
  }

  private async getMemoryQuery(
    input: I,
    query: AgentMemory["query"],
  ): Promise<string> {
    if (query?.from === "variable") {
      const i = OrderedRecord.find(
        this.definition.inputs,
        (i) => i.id === query.fromVariableId,
      );
      if (!i)
        throw new Error(`Input variable ${query.fromVariableId} not found`);

      const value = i.name ? input[i.name] : undefined;
      return renderMessage("{{value}}", { value });
    }

    return Object.entries(input)
      .map(([key, value]) => `${key} ${value}`)
      .join("\n");
  }

  /**
   * Load memories that are defined in the agent definition.
   * @param input The agent input.
   * @param context The AIGNE context.
   * @returns A dictionary of memories, where the key is the memory id or name and the value is an array of memory items.
   */
  protected async loadMemories(input: I): Promise<Memories> {
    const {
      definition: { memories },
      context,
    } = this;
    if (!memories?.$indexes.length) return {} as Memories;
    if (!context) throw new Error("Context is required");

    const { userId, sessionId } = context.state;

    return Object.fromEntries(
      (
        await Promise.all(
          OrderedRecord.map(
            memories,
            async ({ id, name, memory, query, options }) => {
              if (!name || !memory) return null;

              const q = await this.getMemoryQuery(input, query);

              const { results: memories } = await memory.search(q, {
                ...options,
                userId,
                sessionId,
              });

              return [
                [id, memories],
                [name, memories],
              ];
            },
          ),
        )
      )
        .flat()
        .filter(isNonNullable),
    );
  }

  /**
   * Update memories by user messages and assistant responses.
   * @param messages Messages to be added to memories.
   */
  protected async updateMemories(messages: MemoryMessage[]): Promise<void> {
    const {
      context,
      definition: { memories },
    } = this;
    if (!context) throw new Error("Context is required");
    const { userId, sessionId } = context.state ?? {};

    await Promise.all(
      OrderedRecord.map(memories, async ({ memory }) => {
        if (!memory) {
          logger.warn(`Memory is not defined in agent ${this.name || this.id}`);
          return;
        }

        await memory.add(messages, { userId, sessionId });
      }),
    );
  }

  protected async loadPreloads(input: I): Promise<Preloads> {
    const {
      context,
      definition: { preloads },
    } = this;
    if (!preloads?.$indexes.length) return {} as Preloads;
    if (!context) throw new Error("Context is required");

    return Object.fromEntries(
      await Promise.all(
        OrderedRecord.map(preloads, async (preload) => {
          if (!preload.runnable?.id)
            throw new Error("Runnable id in preload is required");

          const runnable = await context.resolve(preload.runnable.id);

          const runnableInput = Object.fromEntries(
            OrderedRecord.map(runnable.definition.inputs, (i) => {
              if (!i.name) return null;

              const bind = preload.input?.[i.id];
              if (!bind) return null;

              if (bind.from !== "input")
                throw new Error(`Unsupported bind from ${bind.from}`);

              const from = this.definition.inputs[bind.fromInput];
              if (!from) throw new Error(`Input ${bind.fromInput} not found`);

              if (!from.name) return null;
              const v = input[from.name];

              return [i.name, v];
            }).filter(isNonNullable),
          );

          const result = await runnable.run(runnableInput);

          return [preload.id, result];
        }),
      ),
    );
  }

  async run(
    input: I,
    options: RunOptions & { stream: true },
  ): Promise<RunnableResponseStream<O>>;
  async run(input: I, options?: RunOptions & { stream?: false }): Promise<O>;
  async run(input: I, options?: RunOptions): Promise<RunnableResponse<O>> {
    logger.debug(`AIGNE core: run agent ${this.name || this.id} with`, {
      input,
    });

    const preloads = await this.loadPreloads(input);
    const memories = await this.loadMemories(input);

    const processResult = await this.process(
      { ...input, ...preloads, ...memories },
      { preloads, memories },
    );

    if (options?.stream) {
      const stream =
        processResult instanceof ReadableStream ||
        isAsyncGenerator<AsyncGenerator<RunnableResponseChunk<O>>>(
          processResult,
        )
          ? processResult
          : objectToRunnableResponseStream(processResult);

      return extractOutputsFromRunnableOutput(stream, async (result) => {
        // TODO: validate result against outputs schema

        logger.debug(`AIGNE core: run agent ${this.name || this.id} success`, {
          result,
        });
        await this.addHistory({ input, output: result });
        await this.onResult(result);
      });
    }

    const result =
      processResult instanceof ReadableStream
        ? await runnableResponseStreamToObject(processResult)
        : Symbol.asyncIterator in processResult
          ? await runnableResponseStreamToObject(processResult)
          : processResult;

    logger.debug(`AIGNE core: run agent ${this.name || this.id} success`, {
      result,
    });

    // TODO: validate result against outputs schema

    await this.addHistory({ input, output: result });
    await this.onResult(result);

    return result;
  }

  private async addHistory({ input, output }: { input: I; output: O }) {
    await this.context?.historyManager?.create(
      { input, output },
      {
        userId: this.context?.state.userId,
        sessionId: this.context?.state.sessionId,
        agentId: this.id,
      },
    );
  }

  /**
   * Hook that is called before the agent result is returned.
   * @param _result The agent result.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async onResult(_result: O): Promise<void> {
    // Override this method to perform additional operations before the result is returned
  }

  abstract process(
    input: AgentProcessInput<I, Preloads, Memories>,
    options: AgentProcessOptions,
  ):
    | Promise<
        RunnableResponse<O> | AsyncGenerator<RunnableResponseChunk<O>, void>
      >
    | AsyncGenerator<RunnableResponseChunk<O>, void>;

  /**
   * Bind some inputs to the agent, used for process of `PipelineAgent` or case of `LLMDecisionAgent`.
   * @param options The bind options.
   * @returns The bound agent.
   */
  bind<
    Input extends BindAgentInputs<Record<string, never>, typeof this>,
  >(options: {
    description?: string;
    input?: Input;
  }): BoundAgent<Record<string, never>, typeof this, Readonly<Input>> {
    return {
      ...options,
      runnable: this,
    };
  }
}

export type AgentProcessOptions<
  Preloads extends AgentPreloads = AgentPreloads,
  Memories extends AgentMemories = AgentMemories,
> = {
  preloads: Preloads;
  memories: Memories;
};

export type AgentProcessInput<
  I extends RunnableInput,
  Preloads extends AgentPreloads,
  Memories extends AgentMemories,
> = I & Preloads & Memories;

export interface AgentDefinition extends RunnableDefinition {
  preloads?: OrderedRecord<AgentPreload>;

  memories?: OrderedRecord<AgentMemory>;
}

export type CreateAgentInputSchema = Record<string, DataSchema>;

export type CreateAgentOutputSchema<
  Extra extends Record<string, unknown> = Record<string, unknown>,
> = Record<string, DataSchema & Extra>;

export type CreateAgentPreloadsSchema<I extends CreateAgentInputSchema> =
  Record<string, PreloadCreator<I>>;

export type CreateAgentPreloadsType<
  I extends CreateAgentInputSchema,
  Preloads extends CreateAgentPreloadsSchema<I>,
> = {
  [name in keyof Preloads]: ExtractRunnableOutputType<
    ReturnType<Preloads[name]>["runnable"]
  >;
};

export type CreateAgentMemoriesSchema<
  I extends CreateAgentInputSchema,
  Extras extends Record<string, unknown> = Record<string, unknown>,
> = Record<string, CreateRunnableMemory<I> & Extras>;

export type CreateAgentMemoriesType<
  I extends CreateAgentInputSchema,
  Memories extends CreateAgentMemoriesSchema<I, Record<string, unknown>>,
> = {
  [key in keyof Memories]: MemorableSearchOutput<Memories[key]["memory"]>;
};

/**
 * Common options to create Agent.
 */
export interface CreateAgentOptions<
  I extends CreateAgentInputSchema,
  O extends CreateAgentOutputSchema,
  State extends ContextState,
  Preloads extends CreateAgentPreloadsSchema<I>,
  Memories extends CreateAgentMemoriesSchema<I, Record<string, unknown>>,
> {
  context?: Context<State>;

  /**
   * Agent name, used to identify the agent.
   */
  name?: string;

  /**
   * Input variables for this agent.
   */
  inputs: I;

  /**
   * Output variables for this agent.
   */
  outputs: O;

  /**
   * Preload runnables before running this agent. the preloaded data are available in the agent as input variables.
   */
  preloads?: Preloads;

  /**
   * Memories to be used in this agent.
   */
  memories?: Memories;
}
