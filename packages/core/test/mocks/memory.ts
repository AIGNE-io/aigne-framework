import {
  type LLMModelInputMessage,
  Memorable,
  type MemoryActionItem,
  type MemoryActions,
  type MemoryItem,
  type MemoryItemWithScore,
  type MemoryMetadata,
  type MemoryRunner,
  type MemorySortOptions,
  type RunOptions,
  type RunnableResponse,
  type RunnableResponseStream,
  objectToRunnableResponseStream,
} from "../../src";

export class MockMemory<
  T,
  I extends MemoryActions<T> = MemoryActions<T>,
> extends Memorable<T> {
  override runner?: MemoryRunner<T, undefined> | undefined;

  override add(
    _messages: LLMModelInputMessage[],
    _options?:
      | { userId?: string; sessionId?: string; metadata?: MemoryMetadata }
      | undefined,
  ): Promise<{ results: MemoryActionItem<T>[] }> {
    throw new Error("Method not implemented.");
  }

  override search(
    _query: string,
    _options?:
      | {
          k?: number;
          userId?: string;
          sessionId?: string;
          filter?: MemoryMetadata;
          sort?: MemorySortOptions;
        }
      | undefined,
  ): Promise<{ results: MemoryItemWithScore<T>[] }> {
    throw new Error("Method not implemented.");
  }

  override filter(
    _options:
      | {
          k?: number;
          userId?: string;
          sessionId?: string;
          filter?: MemoryMetadata;
          sort?: MemorySortOptions;
        }
      | undefined,
  ): Promise<{ results: MemoryItem<T>[] }> {
    throw new Error("Method not implemented.");
  }

  override get(_memoryId: string): Promise<{ result: MemoryItem<T> | null }> {
    throw new Error("Method not implemented.");
  }

  override create(
    _memory: T,
    _options?:
      | { userId?: string; sessionId?: string; metadata?: MemoryMetadata }
      | undefined,
  ): Promise<{ result: MemoryItem<T> }> {
    throw new Error("Method not implemented.");
  }

  override update(
    _memoryId: string,
    _memory: T,
  ): Promise<{ result: MemoryItem<T> | null }> {
    throw new Error("Method not implemented.");
  }

  override delete(
    _memoryId: Extract<
      MemoryActions<T>,
      { action: "delete" }
    >["inputs"]["filter"],
  ): Promise<Extract<MemoryActions<T>, { action: "delete" }>["outputs"]> {
    throw new Error("Method not implemented.");
  }

  override reset(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async run(
    input: I,
    options: RunOptions & { stream: true },
  ): Promise<RunnableResponseStream<I["outputs"]>>;
  async run(
    input: I,
    options?: RunOptions & { stream?: false },
  ): Promise<I["outputs"]>;
  async run(
    input: I,
    options?: RunOptions,
  ): Promise<RunnableResponse<I["outputs"]>> {
    const result = await this._run(input);

    return options?.stream ? objectToRunnableResponseStream(result) : result;
  }

  private async _run(input: I): Promise<I["outputs"]> {
    const { action, inputs } = input;

    switch (action) {
      case "add":
        return await this.add(inputs.messages, inputs.options);
      case "search":
        return await this.search(inputs.query, inputs.options);
      case "filter":
        return await this.filter(inputs.options);
      case "get":
        return await this.get(inputs.memoryId);
      case "create":
        return await this.create(inputs.memory, inputs.options);
      case "update":
        return await this.update(inputs.memoryId, inputs.memory);
      case "delete":
        return await this.delete(inputs.filter);
      default:
        throw new Error("Invalid action");
    }
  }
}
