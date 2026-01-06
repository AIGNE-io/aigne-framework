import type { Agent, Message } from "../../agents/agent.js";
import type { ChatModelInputMessage } from "../../agents/chat-model.js";

/**
 * Session mode type
 */
export type SessionMode = "auto" | "disabled";

/**
 * Default session mode
 */
export const DEFAULT_SESSION_MODE: SessionMode = "auto";

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
  /**
   * Last Agent Skill content in the session
   * Preserved across compactions to maintain skill instructions
   */
  lastAgentSkill?: {
    content: string;
  };
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

// ============================================================================
// User Memory Types
// ============================================================================

/**
 * Default ratio of maxTokens to allocate for user memory
 */
export const DEFAULT_MEMORY_RATIO = 0.04;

/**
 * Default query limit for loading memory facts
 */
export const DEFAULT_MEMORY_QUERY_LIMIT = 200;

/**
 * Content structure for a single memory fact
 *
 * Used by both session memory and user memory to store learned facts.
 * Each fact is stored as an individual AFSEntry with metadata at the AFSEntry level.
 *
 * Storage paths:
 * - Session Memory:
 *   - List: /by-session/:sessionId/@metadata/memory
 *   - Create: /by-session/:sessionId/@metadata/memory/new
 *   - Read: /by-session/:sessionId/@metadata/memory/:memoryId
 * - User Memory:
 *   - List: /by-user/:userId/@metadata/memory
 *   - Create: /by-user/:userId/@metadata/memory/new
 *   - Read: /by-user/:userId/@metadata/memory/:memoryId
 *
 * @example
 * AFSEntry<MemoryFact> {
 *   id: "fact-001",           // AFSEntry ID (auto-generated)
 *   userId: "user-001",
 *   agentId: "assistant",      // which agent learned this fact
 *   sessionId: "session-123",  // which session it was learned from (if applicable)
 *   createdAt: Date,
 *   content: {
 *     label: "pref-package-manager",  // semantic label for this fact
 *     fact: "User prefers using pnpm",
 *     confidence: 0.9,
 *     tags: ["preference", "tooling"]
 *   }
 * }
 */
export interface MemoryFact {
  /**
   * Semantic label for this fact (short, human-readable)
   * Used for updates and deletions to uniquely identify facts
   * @example "pref-package-manager", "skill-typescript", "proj-main-language"
   */
  label: string;

  /**
   * The fact content (text description)
   */
  fact: string;

  /**
   * Confidence score (0-1)
   * Higher values indicate more certain facts
   * @default 1.0
   */
  confidence?: number;

  /**
   * Classification tags for the fact
   * @example ['preference', 'technical', 'project-specific']
   */
  tags?: string[];
}

/**
 * Input structure for the memory extractor agent
 */
export interface MemoryExtractorInput extends Message {
  /**
   * User memory facts (long-term, cross-session) to avoid duplication
   */
  existingUserFacts?: MemoryFact[];

  /**
   * Existing session memory facts (for context and deduplication)
   */
  existingFacts?: MemoryFact[];

  /**
   * Recent conversation messages to extract facts from
   */
  messages: ChatModelInputMessage[];
}

/**
 * Output structure from the memory extractor agent
 */
export interface MemoryExtractorOutput extends Message {
  /**
   * New or updated facts from the conversation
   * Only include facts that need to be added or updated
   * Do not include unchanged facts that already exist
   */
  newFacts: MemoryFact[];

  /**
   * Fact labels to remove from existing memory
   * Each string should match a label in existingFacts
   * @example ["pref-package-manager", "skill-old-framework"]
   */
  removeFacts?: string[];
}

/**
 * Type alias for a memory extractor agent
 */
export type MemoryExtractor = Agent<MemoryExtractorInput, MemoryExtractorOutput>;

/**
 * Default session memory mode
 */
export const DEFAULT_SESSION_MEMORY_MODE = "auto" as const;

/**
 * Default async mode for session memory extraction
 */
export const DEFAULT_SESSION_MEMORY_ASYNC = true;

/**
 * Metadata for tracking session memory extraction progress
 *
 * This metadata is stored in each memory entry's metadata field.
 * When extracting new facts, the latestEntryId is recorded in the metadata
 * to track which history entries have been processed.
 */
export interface SessionMemoryMetadata {
  /**
   * ID of the last extracted history entry
   * Used to determine which entries still need processing
   */
  latestEntryId?: string;
}

// ============================================================================
// User Memory Types
// ============================================================================

/**
 * Default user memory mode
 */
export const DEFAULT_USER_MEMORY_MODE = "auto" as const;

/**
 * Default async mode for user memory consolidation
 */
export const DEFAULT_USER_MEMORY_ASYNC = true;

/**
 * Input structure for the user memory extractor agent
 */
export interface UserMemoryExtractorInput extends Message {
  /**
   * Session memory facts from multiple sessions to consolidate
   */
  sessionFacts: MemoryFact[];

  /**
   * Existing user memory facts (for context and deduplication)
   */
  existingUserFacts?: MemoryFact[];
}

/**
 * Output structure from the user memory extractor agent
 */
export interface UserMemoryExtractorOutput extends Message {
  /**
   * New or updated facts for user memory
   * Only include facts that need to be added or updated
   * Do not include unchanged facts that already exist
   * Each label should be unique - these will replace old facts with same labels
   */
  newFacts: MemoryFact[];

  /**
   * Fact labels to remove from user memory
   * Each string should match a label in existingUserFacts
   */
  removeFacts?: string[];
}

/**
 * Type alias for a user memory extractor agent
 */
export type UserMemoryExtractor = Agent<UserMemoryExtractorInput, UserMemoryExtractorOutput>;

/**
 * Configuration for user memory
 * User memory contains long-term facts consolidated from multiple sessions
 */
export interface UserMemoryConfig {
  /**
   * User memory mode
   * - "auto": Enable memory and auto-consolidate at appropriate times
   * - "disabled": Disable user memory completely
   * @default DEFAULT_USER_MEMORY_MODE ("auto")
   */
  mode?: "auto" | "disabled";

  /**
   * Ratio of maxTokens to allocate for user memory (0-1)
   *
   * Defines what portion of maxTokens budget should be allocated for
   * injecting user memory facts into the prompt.
   *
   * @default DEFAULT_MEMORY_RATIO (0.04 = 4% of maxTokens)
   * @example 0.04 means if maxTokens=80000, allocate 3200 tokens for memory
   */
  memoryRatio?: number;

  /**
   * Maximum number of fact entries to load from storage
   * @default DEFAULT_MEMORY_QUERY_LIMIT (200)
   */
  queryLimit?: number;

  /**
   * Whether to perform memory consolidation asynchronously
   * @default DEFAULT_USER_MEMORY_ASYNC (true)
   */
  async?: boolean;

  /**
   * Agent that extracts user memory facts from session memory
   * Input: { sessionFacts: MemoryFact[], existingUserFacts?: MemoryFact[] }
   * Output: { newFacts: MemoryFact[], removeFacts?: string[] }
   */
  extractor?: UserMemoryExtractor;
}

/**
 * Configuration for session memory
 * Session memory contains facts extracted from the current session's conversation
 */
export interface SessionMemoryConfig {
  /**
   * Session memory mode
   * - "auto": Enable memory and auto-update after each conversation turn
   * - "disabled": Disable memory completely
   * @default DEFAULT_SESSION_MEMORY_MODE ("auto")
   */
  mode?: "auto" | "disabled";

  /**
   * Ratio of maxTokens to allocate for session memory (0-1)
   *
   * Defines what portion of maxTokens budget should be allocated for
   * injecting session memory facts into the prompt.
   *
   * @default DEFAULT_MEMORY_RATIO (0.04 = 4% of maxTokens)
   * @example 0.04 means if maxTokens=80000, allocate 3200 tokens for memory
   */
  memoryRatio?: number;

  /**
   * Maximum number of fact entries to load from storage
   * @default DEFAULT_MEMORY_QUERY_LIMIT (200)
   */
  queryLimit?: number;

  /**
   * Whether to perform memory extraction asynchronously
   * @default DEFAULT_SESSION_MEMORY_ASYNC (true)
   */
  async?: boolean;

  /**
   * Agent that extracts facts from conversation messages
   * Input: { existingUserFacts?: MemoryFact[], existingFacts?: MemoryFact[], messages: ChatModelInputMessage[] }
   * Output: { newFacts: MemoryFact[], removeFacts?: string[] }
   */
  extractor?: MemoryExtractor;
}
