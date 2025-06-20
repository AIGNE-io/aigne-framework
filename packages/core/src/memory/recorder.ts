import { type ZodType, z } from "zod";
import { Agent, type AgentOptions, type Message } from "../agents/agent.js";
import type { Memory } from "./memory.js";

/**
 * Input for memory recording operations.
 *
 * This interface represents the data needed to record new memories
 * in the system. The content array can contain any type of data that
 * should be stored as memories.
 */
export interface MemoryRecorderInput extends Message {
  /**
   * Array of content items to record as memories.
   * Each item in this array will typically be converted into a separate memory entry.
   */
  content: unknown[];
}

/**
 * @hidden
 */
export const memoryRecorderInputSchema: ZodType<MemoryRecorderInput> = z.object({
  content: z.array(z.unknown()),
});

/**
 * Output from memory recording operations.
 *
 * This interface represents the result of recording new memories,
 * including the newly created memory objects with their IDs and timestamps.
 */
export interface MemoryRecorderOutput extends Message {
  /**
   * Array of newly created memory objects.
   * Each memory includes a unique ID, the stored content, and a creation timestamp.
   */
  memories: Memory[];
}

/**
 * @hidden
 */
export const memoryRecorderOutputSchema = z.object({
  memories: z.array(
    z.object({
      id: z.string(),
      content: z.custom<NonNullable<unknown>>(),
      createdAt: z.string().datetime(),
    }),
  ),
});

/**
 * Abstract base class for agents that record and store memories.
 *
 * The MemoryRecorder serves as a foundation for implementing specific memory storage
 * mechanisms. Implementations of this class are responsible for:
 *
 * 1. Converting input content into standardized memory objects
 * 2. Assigning unique IDs to new memories
 * 3. Storing memories in an appropriate backend (database, file system, etc.)
 * 4. Ensuring proper timestamping of memories
 *
 * Custom implementations should extend this class and provide concrete
 * implementations of the process method to handle the actual storage logic.
 */
export abstract class MemoryRecorder extends Agent<MemoryRecorderInput, MemoryRecorderOutput> {
  tag = "MemoryRecorderAgent";

  /**
   * Creates a new MemoryRecorder instance with predefined input and output schemas.
   *
   * @param options - Configuration options for the memory recorder agent
   */
  constructor(
    options: Omit<
      AgentOptions<MemoryRecorderInput, MemoryRecorderOutput>,
      "inputSchema" | "outputSchema"
    >,
  ) {
    super({
      ...options,
      inputSchema: memoryRecorderInputSchema,
      outputSchema: memoryRecorderOutputSchema,
    });
  }
}
