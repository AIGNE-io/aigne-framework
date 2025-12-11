import { z } from "zod";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type AgentProcessResult,
  type FunctionAgentFn,
  type Message,
} from "../agents/agent.js";
import type { PromiseOrValue } from "../utils/type-utils.js";
import type { Memory } from "./memory.js";

/**
 * Input for memory retrieval operations.
 *
 * This interface defines the parameters that can be used to query and filter
 * memories when retrieving them from storage.
 */
export interface MemoryRetrieverInput extends Message {
  /**
   * Maximum number of memories to retrieve.
   * Used for pagination or limiting result set size.
   */
  limit?: number;

  /**
   * Search term to filter memories by.
   * How the search is implemented depends on the specific retriever implementation.
   */
  search?: string | Message;
}

/**
 * Output from memory retrieval operations.
 *
 * This interface represents the result of retrieving memories from storage,
 * containing an array of memory objects that match the query criteria.
 */
export interface MemoryRetrieverOutput extends Message {
  /**
   * Array of retrieved memory objects.
   * Each memory includes its ID, content, and creation timestamp.
   */
  memories: Memory[];
}

/**
 * @hidden
 */
export const memoryRetrieverInputSchema = z.object({
  limit: z.number().optional(),
  search: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
});

/**
 * @hidden
 */
export const memoryRetrieverOutputSchema = z.object({
  memories: z.array(
    z.object({
      id: z.string(),
      content: z.custom<NonNullable<unknown>>(),
      createdAt: z.string().datetime(),
    }),
  ),
});

export interface MemoryRetrieverOptions
  extends Omit<
    AgentOptions<MemoryRetrieverInput, MemoryRetrieverOutput>,
    "inputSchema" | "outputSchema"
  > {
  process?: FunctionAgentFn<MemoryRetrieverInput, MemoryRetrieverOutput>;
}

/**
 * Abstract base class for agents that retrieve memories from storage.
 *
 * The MemoryRetriever serves as a foundation for implementing specific memory
 * retrieval mechanisms. Implementations of this class are responsible for:
 *
 * 1. Querying a memory storage backend to find relevant memories
 * 2. Filtering memories based on search criteria
 * 3. Limiting the number of results returned
 * 4. Potentially implementing sorting, ranking, or relevance-based retrieval
 *
 * Custom implementations should extend this class and provide concrete
 * implementations of the process method to handle the actual retrieval logic.
 */
export class MemoryRetriever extends Agent<MemoryRetrieverInput, MemoryRetrieverOutput> {
  override tag = "MemoryRetrieverAgent";

  /**
   * Creates a new MemoryRetriever instance with predefined input and output schemas.
   *
   * @param options - Configuration options for the memory retriever agent
   */
  constructor(options: MemoryRetrieverOptions) {
    super({
      ...options,
      inputSchema: memoryRetrieverInputSchema,
      outputSchema: memoryRetrieverOutputSchema,
    });
    this._process = options.process;
  }

  private _process?: FunctionAgentFn<MemoryRetrieverInput, MemoryRetrieverOutput>;

  override process(
    input: MemoryRetrieverInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<MemoryRetrieverOutput>> {
    if (!this._process) {
      throw new Error("MemoryRetriever process function is not implemented.");
    }

    return this._process.apply(this as any, [input, options]);
  }
}
