import type { Context, ContextState } from "./context";
import logger from "./logger";
import type { MemoryItemWithScore, MemoryMessage } from "./memorable";
import {
  type RunOptions,
  Runnable,
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

export interface AgentProcessOptions<
  Memories extends { [name: string]: MemoryItemWithScore[] },
> {
  memories: Memories;
}

export abstract class Agent<
  I extends { [key: string]: any } = {},
  O extends { [key: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
  State extends ContextState = ContextState,
> extends Runnable<I, O, State> {
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
  protected async loadMemories(input: I, context?: Context): Promise<Memories> {
    const { memories } = this.definition;
    const { userId, sessionId } = context?.state ?? {};

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

  async run(
    input: I,
    options: RunOptions & { stream: true },
  ): Promise<RunnableResponseStream<O>>;
  async run(input: I, options?: RunOptions & { stream?: false }): Promise<O>;
  async run(input: I, options?: RunOptions): Promise<RunnableResponse<O>> {
    logger.debug(`AIGNE core: run agent ${this.name || this.id} with`, {
      input,
    });

    const memories = await this.loadMemories(input, this.context);

    const processResult = await this.process(input, { ...options, memories });

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
    input: I,
    options: AgentProcessOptions<Memories>,
  ):
    | Promise<
        RunnableResponse<O> | AsyncGenerator<RunnableResponseChunk<O>, void>
      >
    | AsyncGenerator<RunnableResponseChunk<O>, void>;
}
