import type { Context, ContextState } from "./context";
import type {
  BindAgentInput,
  BindAgentInputs,
  BoundAgent,
} from "./definitions/preload";
import logger from "./logger";
import type { MemoryItemWithScore, MemoryMessage } from "./memorable";
import {
  type RunOptions,
  Runnable,
  type RunnableDefinition,
  type RunnableMemory,
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

export type AgentProcessOptions<
  Preloads extends { [name: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
> = {
  preloads: Preloads;
  memories: Memories;
};

export type AgentProcessInput<I, Preloads, Memories> = I & {
  [name in keyof Preloads]: Preloads[name];
} & {
  [name in keyof Memories]: Memories[name];
};

export abstract class Agent<
  I extends { [key: string]: any } = {},
  O extends { [key: string]: any } = {},
  State extends ContextState = ContextState,
  Preloads extends { [name: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
> extends Runnable<I, O, State> {
  constructor(
    public definition: AgentDefinition,
    public context?: Context<State>,
  ) {
    super(definition, context);
  }

  private async getMemoryQuery(
    input: I,
    query: RunnableMemory["query"],
  ): Promise<string> {
    if (query?.from === "variable") {
      const i = OrderedRecord.find(
        this.definition.inputs,
        (i) => i.id === query.fromVariableId,
      );
      if (!i)
        throw new Error(`Input variable ${query.fromVariableId} not found`);

      const value = input[i.name!];
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
      context: {
        state: { userId, sessionId } = {},
      } = {},
    } = this;

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
    const { memories } = this.definition;
    const { userId, sessionId } = this.context?.state ?? {};

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

    await this.onResult(result);

    return result;
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
  bind<Input extends BindAgentInputs<{}, typeof this>>(options: {
    description?: string;
    input?: Input;
  }): BoundAgent<{}, typeof this, Readonly<Input>> {
    return {
      ...options,
      runnable: this,
    };
  }
}

export interface AgentDefinition extends RunnableDefinition {
  preloads?: OrderedRecord<Preload>;
}

export interface Preload {
  id: string;

  name?: string;

  runnable?: {
    id: string;
  };

  input?: { [inputId: string]: BindAgentInput };
}
