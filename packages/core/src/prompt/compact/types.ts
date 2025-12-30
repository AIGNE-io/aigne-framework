import type { Agent, Message } from "../../agents/agent.js";
import type { ChatModelInputMessage } from "../../agents/chat-model.js";

/**
 * Default compaction mode
 */
export const DEFAULT_COMPACT_MODE = "auto" as const;

/**
 * Default maximum tokens before triggering compaction
 */
export const DEFAULT_MAX_TOKENS = 80000;

/**
 * Default ratio of maxTokens to reserve for keeping recent messages
 */
export const DEFAULT_KEEP_RECENT_RATIO = 0.5;

/**
 * Default async mode for compaction
 */
export const DEFAULT_COMPACT_ASYNC = true;

/**
 * Content structure for history entries
 */
export interface EntryContent {
  input?: unknown;
  output?: unknown;
  messages?: ChatModelInputMessage[];
}

/**
 * Output structure from the compactor agent
 */
export interface CompactContent extends Message {
  summary: string;
}

/**
 * Input structure for the compactor agent
 */
export interface CompactorInput extends Message {
  previousSummary?: string[];
  messages: ChatModelInputMessage[];
}

/**
 * Type alias for a compactor agent
 */
export type Compactor = Agent<CompactorInput, CompactContent>;

/**
 * Configuration for session compaction
 */
export interface CompactConfig {
  /**
   * Compaction mode
   * @default DEFAULT_COMPACT_MODE ("auto")
   */
  mode?: "auto" | "disabled";

  /**
   * Maximum tokens before triggering compaction
   * @default DEFAULT_MAX_TOKENS (80000)
   */
  maxTokens?: number;

  /**
   * Ratio of maxTokens to reserve for keeping recent messages (0-1)
   *
   * Defines what portion of maxTokens budget should be allocated for
   * preserving recent conversation history without compaction.
   *
   * @default 0.5 (50% of maxTokens)
   * @example 0.5 means if maxTokens=80000, keep up to 40000 tokens of recent messages
   */
  keepRecentRatio?: number;

  /**
   * Whether to perform compaction asynchronously
   * @default DEFAULT_COMPACT_ASYNC (true)
   */
  async?: boolean;

  /**
   * Agent that generates summaries from conversation entries
   * Input: { entries: EntryContent[] }
   * Output: { summary: string }
   */
  compactor?: Compactor;
}
