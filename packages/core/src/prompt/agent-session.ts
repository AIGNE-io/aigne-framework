import type { AFS, AFSEntry } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { v7 } from "@aigne/uuid";
import { joinURL } from "ufo";
import { stringify } from "yaml";
import type { AgentInvokeOptions } from "../agents/agent.js";
import type { ChatModelInputMessage } from "../agents/chat-model.js";
import { estimateTokens } from "../utils/token-estimator.js";
import { isNonNullable } from "../utils/type-utils.js";
import {
  type CompactConfig,
  type CompactContent,
  DEFAULT_COMPACT_ASYNC,
  DEFAULT_COMPACT_MODE,
  DEFAULT_KEEP_RECENT_RATIO,
  DEFAULT_MAX_TOKENS,
  DEFAULT_MEMORY_QUERY_LIMIT,
  DEFAULT_MEMORY_RATIO,
  DEFAULT_SESSION_MEMORY_ASYNC,
  DEFAULT_SESSION_MEMORY_MODE,
  DEFAULT_SESSION_MODE,
  DEFAULT_USER_MEMORY_ASYNC,
  DEFAULT_USER_MEMORY_MODE,
  type EntryContent,
  type MemoryFact,
  type SessionMemoryConfig,
  type SessionMode,
  type UserMemoryConfig,
} from "./compact/types.js";

export * from "./compact/types.js";

export interface AgentSessionOptions {
  sessionId: string;
  userId?: string;
  agentId?: string;
  afs?: AFS;

  /**
   * Session mode
   * - "auto": Enable history recording, compaction, and memory extraction
   * - "disabled": Disable all session features (history, compaction, memory)
   *
   * **Should be "disabled" for internal utility agents** (extractors, compactors, etc.)
   * to avoid recursive memory extraction and unnecessary overhead.
   *
   * @default DEFAULT_SESSION_MODE ("auto")
   */
  mode?: SessionMode;

  /**
   * Compaction configuration
   */
  compact?: CompactConfig;

  /**
   * Session memory configuration
   */
  sessionMemory?: SessionMemoryConfig;

  /**
   * User memory configuration
   */
  userMemory?: UserMemoryConfig;
}

interface RuntimeState {
  systemMessages?: ChatModelInputMessage[];
  sessionMemory?: AFSEntry<MemoryFact>[];
  userMemory?: AFSEntry<MemoryFact>[];
  compactSummary?: string;
  historyEntries: AFSEntry<EntryContent>[];
  currentEntry: EntryContent | null;
  currentEntryCompression?: {
    summary: string;
    compressedCount: number;
  };
}

export class AgentSession {
  readonly sessionId: string;
  readonly userId?: string;
  readonly agentId?: string;

  private afs?: AFS;
  private historyModulePath?: string;
  private mode: SessionMode;
  private compactConfig: CompactConfig;
  private sessionMemoryConfig: SessionMemoryConfig;
  private userMemoryConfig: UserMemoryConfig;
  private runtimeState: RuntimeState;
  private initialized?: Promise<void>;
  private compactionPromise?: Promise<void>;
  private sessionMemoryUpdatePromise?: Promise<void>;
  private userMemoryUpdatePromise?: Promise<void>;

  constructor(options: AgentSessionOptions) {
    this.sessionId = options.sessionId;
    this.userId = options.userId;
    this.agentId = options.agentId;
    this.afs = options.afs;
    this.mode = options.mode ?? DEFAULT_SESSION_MODE;
    this.compactConfig = options.compact ?? {};
    this.sessionMemoryConfig = options.sessionMemory ?? {};
    this.userMemoryConfig = options.userMemory ?? {};

    this.runtimeState = {
      historyEntries: [],
      currentEntry: null,
    };
  }

  /**
   * Check if memory extraction is enabled
   * Memory extraction requires mode to be "auto" AND AFS history module to be available
   */
  private get isMemoryEnabled(): boolean {
    return this.mode === "auto" && !!this.afs && !!this.historyModulePath;
  }

  async setSystemMessages(...messages: ChatModelInputMessage[]): Promise<void> {
    await this.ensureInitialized();

    this.runtimeState.systemMessages = messages;
  }

  async getMessages(): Promise<ChatModelInputMessage[]> {
    await this.ensureInitialized();

    const {
      systemMessages,
      userMemory,
      sessionMemory,
      compactSummary,
      historyEntries,
      currentEntry,
      currentEntryCompression,
    } = this.runtimeState;

    let currentMessages: ChatModelInputMessage[] = [];
    if (currentEntry?.messages?.length) {
      if (currentEntryCompression) {
        const { compressedCount, summary } = currentEntryCompression;

        const firstMsg = currentEntry.messages[0];
        const hasSkill =
          firstMsg?.role === "user" &&
          Array.isArray(firstMsg.content) &&
          firstMsg.content.some((block) => block.type === "text" && block.isAgentSkill === true);

        const skillMessage = hasSkill ? [firstMsg] : [];
        const summaryMessage = {
          role: "user" as const,
          content: `[Earlier messages in this conversation (${compressedCount} messages compressed)]\n${summary}`,
        };
        const remainingMessages = currentEntry.messages.slice(compressedCount);

        currentMessages = [...skillMessage, summaryMessage, ...remainingMessages];
      } else {
        currentMessages = currentEntry.messages;
      }
    }

    const messages = [
      ...(systemMessages ?? []),
      ...(userMemory && userMemory.length > 0 ? [this.formatUserMemory(userMemory)] : []),
      ...(sessionMemory && sessionMemory.length > 0
        ? [this.formatSessionMemory(sessionMemory)]
        : []),
      ...(compactSummary
        ? [
            {
              role: "system" as const,
              content: `Previous conversation summary:\n${compactSummary}`,
            },
          ]
        : []),
      ...historyEntries.flatMap((entry) => entry.content?.messages ?? []),
      ...currentMessages,
    ];

    // Filter out thinking messages and truncate large messages
    return messages
      .map((msg) => {
        if (!msg.content || typeof msg.content === "string") {
          return msg;
        }
        // Filter out thinking from UnionContent[]
        const filteredContent = msg.content.filter((c) => !(c.type === "text" && c.isThinking));
        if (filteredContent.length === 0) return null;
        return { ...msg, content: filteredContent };
      })
      .filter(isNonNullable)
      .map((msg) => this.truncateLargeMessage(msg));
  }

  /**
   * Format user memory facts into a system message
   * Applies token budget limit to ensure memory injection fits within constraints
   */
  private formatUserMemory(memoryEntries: AFSEntry<MemoryFact>[]): ChatModelInputMessage {
    const memoryRatio = this.userMemoryConfig.memoryRatio ?? DEFAULT_MEMORY_RATIO;
    const maxTokens = Math.floor(
      (this.compactConfig.maxTokens ?? DEFAULT_MAX_TOKENS) * memoryRatio,
    );
    const header = "[User Memory Facts]";
    let currentTokens = estimateTokens(header);

    const facts: string[] = [];

    for (const entry of memoryEntries) {
      const fact = entry.content?.fact;
      if (!fact) continue;

      const factTokens = estimateTokens(fact);

      // Check if adding this fact would exceed token budget
      if (currentTokens + factTokens > maxTokens) {
        break; // Stop adding facts
      }

      facts.push(fact);
      currentTokens += factTokens;
    }

    return {
      role: "system",
      content: this.formatMemoryTemplate({ header, data: facts }),
    };
  }

  /**
   * Format session memory facts into a system message
   * Applies token budget limit to ensure memory injection fits within constraints
   */
  private formatSessionMemory(memoryEntries: AFSEntry<MemoryFact>[]): ChatModelInputMessage {
    const memoryRatio = this.sessionMemoryConfig.memoryRatio ?? DEFAULT_MEMORY_RATIO;
    const maxTokens = Math.floor(
      (this.compactConfig.maxTokens ?? DEFAULT_MAX_TOKENS) * memoryRatio,
    );
    const header = "[Session Memory Facts]";
    let currentTokens = estimateTokens(header);

    const facts: string[] = [];

    for (const entry of memoryEntries) {
      const fact = entry.content?.fact;
      if (!fact) continue;

      const factTokens = estimateTokens(fact);

      // Check if adding this fact would exceed token budget
      if (currentTokens + factTokens > maxTokens) {
        break; // Stop adding facts
      }

      facts.push(fact);
      currentTokens += factTokens;
    }

    return {
      role: "system",
      content: this.formatMemoryTemplate({ header, data: facts }),
    };
  }

  private formatMemoryTemplate({ header, data }: { header: string; data: unknown }): string {
    return `\
${header}

${"```yaml"}
${stringify(data)}
${"```"}
`;
  }

  async startMessage(
    input: unknown,
    message: ChatModelInputMessage,
    options: AgentInvokeOptions,
  ): Promise<void> {
    await this.ensureInitialized();

    // Only run compact if mode is not disabled
    if (this.mode !== "disabled") {
      await this.maybeAutoCompact(options);

      // Always wait for compaction to complete before starting a new message
      // This ensures data consistency even in async compact mode
      if (this.compactionPromise) await this.compactionPromise;
    }

    this.runtimeState.currentEntryCompression = undefined;
    this.runtimeState.currentEntry = { input, messages: [message] };
  }

  async endMessage(
    output: unknown,
    message: ChatModelInputMessage | undefined,
    options: AgentInvokeOptions,
  ): Promise<void> {
    await this.ensureInitialized();

    if (
      !this.runtimeState.currentEntry?.input ||
      !this.runtimeState.currentEntry.messages?.length
    ) {
      throw new Error("No current entry to end. Call startMessage() first.");
    }

    if (message) this.runtimeState.currentEntry.messages.push(message);
    this.runtimeState.currentEntry.output = output;

    let newEntry: AFSEntry<EntryContent>;

    // Only persist to AFS if mode is not disabled
    if (this.mode !== "disabled" && this.afs && this.historyModulePath) {
      newEntry = (
        await this.afs.write(joinURL(this.historyModulePath, "by-session", this.sessionId, "new"), {
          userId: this.userId,
          sessionId: this.sessionId,
          agentId: this.agentId,
          content: this.runtimeState.currentEntry,
        })
      ).data;
    } else {
      // Create in-memory entry for runtime state
      const id = v7();

      newEntry = {
        id,
        path: `/history/${id}`,
        userId: this.userId,
        sessionId: this.sessionId,
        agentId: this.agentId,
        content: this.runtimeState.currentEntry,
      };
    }

    this.runtimeState.historyEntries.push(newEntry);
    this.runtimeState.currentEntry = null;
    this.runtimeState.currentEntryCompression = undefined;

    // Only run compact and memory extraction if mode is not disabled
    if (this.mode !== "disabled") {
      await Promise.all([
        // Check if auto-compact should be triggered
        this.maybeAutoCompact(options),
        // Check if auto-update session memory should be triggered
        this.maybeAutoUpdateSessionMemory(options),
      ]);
    }
  }

  /**
   * Manually trigger compaction
   */
  async compact(options: AgentInvokeOptions): Promise<void> {
    await this.ensureInitialized();

    // If compaction is already in progress, wait for it to complete
    if (this.compactionPromise) {
      return this.compactionPromise;
    }

    // Start new compaction task
    this.compactionPromise = this.doCompact(options).finally(() => {
      this.compactionPromise = undefined;
    });

    return this.compactionPromise;
  }

  /**
   * Internal method that performs the actual compaction
   */
  private async doCompact(options: AgentInvokeOptions): Promise<void> {
    const { compactor } = this.compactConfig ?? {};
    if (!compactor) {
      throw new Error("Cannot compact without a compactor agent configured.");
    }

    const historyEntries = this.runtimeState.historyEntries;
    if (historyEntries.length === 0) return;

    const maxTokens = this.maxTokens;
    let keepTokenBudget = this.keepTokenBudget;

    // Calculate tokens for system messages
    const systemTokens = (this.runtimeState.systemMessages ?? []).reduce((sum, msg) => {
      const content =
        typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content ?? "");
      return sum + estimateTokens(content);
    }, 0);

    // Calculate tokens for current entry messages
    const currentTokens = (this.runtimeState.currentEntry?.messages ?? []).reduce((sum, msg) => {
      const content =
        typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content ?? "");
      return sum + estimateTokens(content);
    }, 0);

    // Subtract system and current tokens from budget
    // This ensures total tokens (system + current + kept history) stays within ratio budget
    keepTokenBudget = Math.max(0, keepTokenBudget - systemTokens - currentTokens);

    // Find split point by iterating backwards from most recent entry
    // The split point divides history into: [compact] | [keep]
    let splitIndex = historyEntries.length; // Default: keep all (no compaction)
    let accumulatedTokens = 0;

    for (let i = historyEntries.length - 1; i >= 0; i--) {
      const entry = historyEntries[i];
      if (!entry) continue;

      const entryTokens = this.estimateMessagesTokens(entry.content?.messages ?? []);

      // Check if adding this entry would exceed token budget
      if (accumulatedTokens + entryTokens > keepTokenBudget) {
        // Would exceed budget, split here (this entry and earlier ones will be compacted)
        splitIndex = i + 1;
        break;
      }

      // Can keep this entry, accumulate and continue
      accumulatedTokens += entryTokens;
      splitIndex = i;
    }

    // Split history at the found point
    const entriesToCompact = historyEntries.slice(0, splitIndex);
    const entriesToKeep = historyEntries.slice(splitIndex);

    // If nothing to compact, return
    if (entriesToCompact.length === 0) {
      return;
    }

    const latestCompactedEntry = entriesToCompact.at(-1);
    if (!latestCompactedEntry) return;

    // Split into batches to avoid context overflow
    const batches = this.splitIntoBatches(entriesToCompact, maxTokens);

    // Process batches incrementally, each summary becomes input for the next
    let currentSummary = this.runtimeState.compactSummary;
    for (const batch of batches) {
      const messages = batch
        .flatMap((e) => e.content?.messages ?? [])
        .filter(isNonNullable)
        .map((msg) => this.truncateLargeMessage(msg));

      const result = await options.context.invoke(compactor, {
        previousSummary: [currentSummary].filter(isNonNullable),
        messages,
      });
      currentSummary = result.summary;
    }

    // Write compact entry to AFS
    if (this.afs && this.historyModulePath) {
      await this.afs.write(
        joinURL(this.historyModulePath, "by-session", this.sessionId, "@metadata/compact/new"),
        {
          userId: this.userId,
          agentId: this.agentId,
          content: { summary: currentSummary },
          metadata: {
            latestEntryId: latestCompactedEntry.id,
          },
        },
      );
    }

    // Update runtime state: keep the summary and recent entries
    this.runtimeState.compactSummary = currentSummary;
    this.runtimeState.historyEntries = entriesToKeep;
  }

  private async compactCurrentEntry(options: AgentInvokeOptions): Promise<void> {
    const { compactor } = this.compactConfig ?? {};
    if (!compactor) return;

    const currentEntry = this.runtimeState.currentEntry;
    if (!currentEntry?.messages?.length) return;

    const alreadyCompressedCount = this.runtimeState.currentEntryCompression?.compressedCount ?? 0;
    const uncompressedMessages = currentEntry.messages.slice(alreadyCompressedCount);

    if (uncompressedMessages.length === 0) return;

    const keepTokenBudget = this.keepTokenBudget;
    const singleMessageLimit = this.singleMessageLimit;

    let splitIndex = uncompressedMessages.length;
    let accumulatedTokens = 0;

    for (let i = uncompressedMessages.length - 1; i >= 0; i--) {
      const msg = uncompressedMessages[i];
      if (!msg) continue;

      const content =
        typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content ?? "");
      const msgTokens = estimateTokens(content);

      const effectiveTokens = msgTokens > singleMessageLimit ? singleMessageLimit : msgTokens;

      if (accumulatedTokens + effectiveTokens > keepTokenBudget) {
        splitIndex = i + 1;
        break;
      }

      accumulatedTokens += effectiveTokens;
      splitIndex = i;
    }

    const keptMessages = uncompressedMessages.slice(splitIndex);
    const requiredToolCallIds = new Set<string>();

    for (const msg of keptMessages) {
      if (msg.role === "tool" && msg.toolCallId) {
        requiredToolCallIds.add(msg.toolCallId);
      }
    }

    if (requiredToolCallIds.size > 0) {
      for (let i = splitIndex - 1; i >= 0; i--) {
        const msg = uncompressedMessages[i];
        if (!msg?.toolCalls) continue;

        for (const toolCall of msg.toolCalls) {
          if (requiredToolCallIds.has(toolCall.id)) {
            splitIndex = i;
            break;
          }
        }
      }
    }

    const messagesToCompact = uncompressedMessages
      .slice(0, splitIndex)
      .map((msg) => this.truncateLargeMessage(msg));

    if (messagesToCompact.length === 0) return;

    const result = await options.context.invoke(compactor, {
      previousSummary: this.runtimeState.currentEntryCompression?.summary
        ? [this.runtimeState.currentEntryCompression.summary]
        : undefined,
      messages: messagesToCompact,
    });

    this.runtimeState.currentEntryCompression = {
      summary: result.summary,
      compressedCount: alreadyCompressedCount + messagesToCompact.length,
    };
  }

  private async maybeCompactCurrentEntry(options: AgentInvokeOptions): Promise<void> {
    const currentEntry = this.runtimeState.currentEntry;
    if (!currentEntry?.messages?.length) return;

    const compressedCount = this.runtimeState.currentEntryCompression?.compressedCount ?? 0;
    const uncompressedMessages = currentEntry.messages.slice(compressedCount);

    const threshold = this.keepTokenBudget;
    const currentTokens = this.estimateMessagesTokens(
      uncompressedMessages,
      this.singleMessageLimit,
    );

    if (currentTokens > threshold) {
      await this.compactCurrentEntry(options);
    }
  }

  private async maybeAutoCompact(options: AgentInvokeOptions): Promise<void> {
    if (this.compactionPromise) await this.compactionPromise;

    if (!this.compactConfig) return;

    const mode = this.compactConfig.mode ?? DEFAULT_COMPACT_MODE;
    if (mode === "disabled") return;

    const { compactor } = this.compactConfig;
    if (!compactor) return;

    const maxTokens = this.maxTokens;

    const messages = await this.getMessages();
    const currentTokens = this.estimateMessagesTokens(messages);

    if (currentTokens >= maxTokens) {
      this.compact(options);

      const isAsync = this.compactConfig.async ?? DEFAULT_COMPACT_ASYNC;

      if (!isAsync) await this.compactionPromise;
    }
  }

  /**
   * Estimate token count for an array of messages
   */
  private estimateMessagesTokens(
    messages: ChatModelInputMessage[],
    singleMessageLimit?: number,
  ): number {
    return messages.reduce((sum, msg) => {
      const content =
        typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content ?? "");
      const tokens = estimateTokens(content);

      if (singleMessageLimit && tokens > singleMessageLimit) {
        return sum + singleMessageLimit;
      }

      return sum + tokens;
    }, 0);
  }

  /**
   * Split entries into batches based on token limit
   * Each batch will not exceed the specified maxTokens
   */
  private splitIntoBatches(
    entries: AFSEntry<EntryContent>[],
    maxTokens: number,
  ): AFSEntry<EntryContent>[][] {
    const batches: AFSEntry<EntryContent>[][] = [];
    let currentBatch: AFSEntry<EntryContent>[] = [];
    let currentTokens = 0;

    for (const entry of entries) {
      const entryTokens = this.estimateMessagesTokens(entry.content?.messages ?? []);

      // If adding this entry exceeds limit and we have entries in current batch, start new batch
      if (currentTokens + entryTokens > maxTokens && currentBatch.length > 0) {
        batches.push(currentBatch);
        currentBatch = [entry];
        currentTokens = entryTokens;
      } else {
        currentBatch.push(entry);
        currentTokens += entryTokens;
      }
    }

    // Add remaining entries
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  async appendCurrentMessages(
    messages: ChatModelInputMessage | ChatModelInputMessage[],
    options: AgentInvokeOptions,
  ): Promise<void> {
    await this.ensureInitialized();

    if (!this.runtimeState.currentEntry || !this.runtimeState.currentEntry.messages?.length) {
      throw new Error("No current entry to append messages. Call startMessage() first.");
    }

    this.runtimeState.currentEntry.messages.push(...[messages].flat());

    await this.maybeCompactCurrentEntry(options);
  }

  private truncateLargeMessage(msg: ChatModelInputMessage): ChatModelInputMessage {
    const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
    const tokens = estimateTokens(content);
    const singleMessageLimit = this.singleMessageLimit;

    if (tokens <= singleMessageLimit) return msg;

    const keepRatio = (singleMessageLimit / tokens) * 0.9;
    const keepLength = Math.floor(content.length * keepRatio);

    const headLength = Math.floor(keepLength * 0.7);
    const tailLength = Math.floor(keepLength * 0.3);

    const truncated =
      content.slice(0, headLength) +
      `\n\n[... Content too large, truncated ${tokens - singleMessageLimit} tokens ...]\n\n` +
      content.slice(-tailLength);

    if (typeof msg.content === "string") {
      return { ...msg, content: truncated };
    }

    return msg;
  }

  private async ensureInitialized(): Promise<void> {
    this.initialized ??= this.initialize();
    await this.initialized;
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.initializeDefaultCompactor();
    await this.initializeDefaultSessionMemoryExtractor();
    await this.initializeDefaultUserMemoryExtractor();

    const historyModule = (await this.afs?.listModules())?.find(
      (m) => m.module instanceof AFSHistory,
    );

    this.historyModulePath = historyModule?.path;

    if (this.afs && this.historyModulePath) {
      // Load user memory, session memory, and session history in parallel
      const [userMemory, sessionMemory, sessionHistory] = await Promise.all([
        this.loadUserMemory(),
        this.loadSessionMemory(),
        this.loadSessionHistory(),
      ]);

      // Update runtime state with loaded data
      this.runtimeState.userMemory = userMemory;
      this.runtimeState.sessionMemory = sessionMemory;
      this.runtimeState.compactSummary = sessionHistory.compactSummary;
      this.runtimeState.historyEntries = sessionHistory.historyEntries;
    }
  }

  /**
   * Load session memory facts
   * @returns Array of memory fact entries for the current session
   */
  private async loadSessionMemory(): Promise<AFSEntry<MemoryFact>[]> {
    if (!this.afs || !this.historyModulePath) return [];

    // Check if session memory is disabled
    const mode = this.sessionMemoryConfig.mode ?? DEFAULT_SESSION_MEMORY_MODE;
    if (mode === "disabled") return [];

    const sessionMemoryPath = joinURL(
      this.historyModulePath,
      "by-session",
      this.sessionId,
      "@metadata/memory",
    );

    const queryLimit = this.sessionMemoryConfig.queryLimit ?? DEFAULT_MEMORY_QUERY_LIMIT;

    const memoryResult = await this.afs.list(sessionMemoryPath, {
      filter: { userId: this.userId, agentId: this.agentId },
      orderBy: [["updatedAt", "desc"]],
      limit: queryLimit,
    });

    // Filter out entries without content
    const facts = memoryResult.data
      .reverse()
      .filter((entry: AFSEntry) => isNonNullable(entry.content)) as AFSEntry<MemoryFact>[];

    return facts;
  }

  /**
   * Load user memory facts
   * @returns Array of memory fact entries for the current user
   */
  private async loadUserMemory(): Promise<AFSEntry<MemoryFact>[]> {
    if (!this.afs || !this.historyModulePath || !this.userId) return [];

    // Check if user memory is disabled
    const mode = this.userMemoryConfig.mode ?? DEFAULT_USER_MEMORY_MODE;
    if (mode === "disabled") return [];

    const userMemoryPath = joinURL(
      this.historyModulePath,
      "by-user",
      this.userId,
      "@metadata/memory",
    );

    const queryLimit = this.userMemoryConfig.queryLimit ?? DEFAULT_MEMORY_QUERY_LIMIT;

    const memoryResult = await this.afs.list(userMemoryPath, {
      filter: { userId: this.userId, agentId: this.agentId },
      orderBy: [["updatedAt", "desc"]],
      limit: queryLimit,
    });

    // Filter out entries without content
    const facts = memoryResult.data
      .reverse()
      .filter((entry: AFSEntry) => isNonNullable(entry.content)) as AFSEntry<MemoryFact>[];

    return facts;
  }

  /**
   * Load session history including compact summary and history entries
   * @returns Object containing compact summary and history entries
   */
  private async loadSessionHistory(): Promise<{
    compactSummary?: string;
    historyEntries: AFSEntry<EntryContent>[];
  }> {
    if (!this.afs || !this.historyModulePath) {
      return { historyEntries: [] };
    }

    // Load latest compact entry if exists
    const compactPath = joinURL(
      this.historyModulePath,
      "by-session",
      this.sessionId,
      "@metadata/compact",
    );

    const compactResult = await this.afs.list(compactPath, {
      filter: { userId: this.userId, agentId: this.agentId },
      orderBy: [["createdAt", "desc"]],
      limit: 1,
    });

    const latestCompact = compactResult.data[0] as
      | (AFSEntry & { content?: CompactContent; metadata?: { latestEntryId?: string } })
      | undefined;

    const compactSummary = latestCompact?.content?.summary;

    // Load history entries (after compact point if exists)
    const afsEntries: AFSEntry[] = (
      await this.afs.list(joinURL(this.historyModulePath, "by-session", this.sessionId), {
        filter: {
          userId: this.userId,
          agentId: this.agentId,
          // Only load entries after the latest compact
          after: latestCompact?.createdAt?.toISOString(),
        },
        orderBy: [["createdAt", "desc"]],
        // Set a very large limit to load all history entries
        // The default limit is 10 which would cause history truncation
        limit: 10000,
      })
    ).data;

    const historyEntries = afsEntries.reverse().filter((entry) => isNonNullable(entry.content));

    return {
      compactSummary,
      historyEntries,
    };
  }

  /**
   * Manually trigger session memory update
   */
  async updateSessionMemory(options: AgentInvokeOptions): Promise<void> {
    await this.ensureInitialized();

    // If session memory update is already in progress, wait for it to complete
    if (this.sessionMemoryUpdatePromise) {
      return this.sessionMemoryUpdatePromise;
    }

    // Start new session memory update task
    this.sessionMemoryUpdatePromise = this.doUpdateSessionMemory(options).finally(() => {
      this.sessionMemoryUpdatePromise = undefined;
      // After session memory update completes, potentially trigger user memory consolidation
      this.maybeAutoUpdateUserMemory(options);
    });

    return this.sessionMemoryUpdatePromise;
  }

  private async maybeAutoUpdateSessionMemory(options: AgentInvokeOptions): Promise<void> {
    if (this.sessionMemoryUpdatePromise) await this.sessionMemoryUpdatePromise;

    // Check if memory extraction is enabled (requires AFS history module)
    if (!this.isMemoryEnabled) return;

    if (!this.sessionMemoryConfig) return;

    // Check if mode is disabled
    const mode = this.sessionMemoryConfig.mode ?? DEFAULT_SESSION_MEMORY_MODE;
    if (mode === "disabled") return;

    // Trigger session memory update
    this.updateSessionMemory(options);

    const isAsync = this.sessionMemoryConfig.async ?? DEFAULT_SESSION_MEMORY_ASYNC;

    if (!isAsync) await this.sessionMemoryUpdatePromise;
  }

  private async maybeAutoUpdateUserMemory(options: AgentInvokeOptions): Promise<void> {
    if (this.userMemoryUpdatePromise) await this.userMemoryUpdatePromise;

    // Check if memory extraction is enabled (requires AFS history module)
    if (!this.isMemoryEnabled) return;

    if (!this.userMemoryConfig || !this.userId) return;

    // Check if mode is disabled
    const mode = this.userMemoryConfig.mode ?? DEFAULT_USER_MEMORY_MODE;
    if (mode === "disabled") return;

    // Wait for session memory update to complete first
    if (this.sessionMemoryUpdatePromise) await this.sessionMemoryUpdatePromise;

    // Trigger user memory consolidation
    this.updateUserMemory(options);

    const isAsync = this.userMemoryConfig.async ?? DEFAULT_USER_MEMORY_ASYNC;

    if (!isAsync) await this.userMemoryUpdatePromise;
  }

  /**
   * Internal method that performs the actual session memory update
   */
  private async doUpdateSessionMemory(options: AgentInvokeOptions): Promise<void> {
    const { extractor } = this.sessionMemoryConfig ?? {};
    if (!extractor) {
      throw new Error("Cannot update session memory without an extractor agent configured.");
    }

    // Get latestEntryId from the most recent memory entry's metadata
    // This tells us which history entries have already been processed
    const latestEntryId = this.runtimeState.sessionMemory?.at(-1)?.metadata?.latestEntryId as
      | string
      | undefined;

    // Filter unextracted entries based on latestEntryId
    // Similar to compact mechanism, we find the position of the last extracted entry
    // and only process entries after that point
    const lastExtractedIndex = latestEntryId
      ? this.runtimeState.historyEntries.findIndex((e) => e.id === latestEntryId)
      : -1;

    const unextractedEntries =
      lastExtractedIndex >= 0
        ? this.runtimeState.historyEntries.slice(lastExtractedIndex + 1)
        : this.runtimeState.historyEntries;

    if (unextractedEntries.length === 0) return;

    // Get recent conversation messages for extraction
    const recentMessages = unextractedEntries
      .flatMap((entry) => entry.content?.messages ?? [])
      .filter(isNonNullable);

    if (recentMessages.length === 0) return;

    // Get existing session memory facts for context
    const existingFacts =
      this.runtimeState.sessionMemory?.map((entry) => entry.content).filter(isNonNullable) ?? [];

    // Get user memory facts to avoid duplication
    const existingUserFacts =
      this.runtimeState.userMemory?.map((entry) => entry.content).filter(isNonNullable) ?? [];

    // Extract new facts from conversation
    const result = await options.context.invoke(extractor, {
      existingUserFacts,
      existingFacts,
      messages: recentMessages,
    });

    // If no changes, nothing to do
    if (!result.newFacts.length && !result.removeFacts?.length) {
      return;
    }

    // Get the last entry to record its ID for metadata
    const latestExtractedEntry = unextractedEntries.at(-1);

    if (this.afs && this.historyModulePath) {
      // Handle fact removal
      if (result.removeFacts?.length && this.runtimeState.sessionMemory) {
        const entriesToRemove: AFSEntry<MemoryFact>[] = [];

        for (const label of result.removeFacts) {
          const entry = this.runtimeState.sessionMemory.find((e) => e.content?.label === label);
          if (entry) entriesToRemove.push(entry);
        }

        // Remove from AFS storage and runtime state
        for (const entryToRemove of entriesToRemove) {
          // Delete from AFS storage
          const memoryEntryPath = joinURL(
            this.historyModulePath,
            "by-session",
            this.sessionId,
            "@metadata/memory",
            entryToRemove.id,
          );
          await this.afs.delete(memoryEntryPath);

          // Remove from runtime state
          const index = this.runtimeState.sessionMemory.indexOf(entryToRemove);
          if (index !== -1) {
            this.runtimeState.sessionMemory.splice(index, 1);
          }
        }
      }

      // Handle new facts
      if (result.newFacts.length) {
        const sessionMemoryPath = joinURL(
          this.historyModulePath,
          "by-session",
          this.sessionId,
          "@metadata/memory/new",
        );

        for (const fact of result.newFacts) {
          const newEntry = await this.afs.write(sessionMemoryPath, {
            userId: this.userId,
            sessionId: this.sessionId,
            agentId: this.agentId,
            content: fact,
            metadata: {
              latestEntryId: latestExtractedEntry?.id,
            },
          });

          // Add to runtime state
          this.runtimeState.sessionMemory ??= [];
          this.runtimeState.sessionMemory.push(newEntry.data);
        }
      }
    }
  }

  /**
   * Manually trigger user memory update
   */
  async updateUserMemory(options: AgentInvokeOptions): Promise<void> {
    await this.ensureInitialized();

    // If user memory update is already in progress, wait for it to complete
    if (this.userMemoryUpdatePromise) {
      return this.userMemoryUpdatePromise;
    }

    // Start new user memory update task
    this.userMemoryUpdatePromise = this.doUpdateUserMemory(options).finally(() => {
      this.userMemoryUpdatePromise = undefined;
    });

    return this.userMemoryUpdatePromise;
  }

  /**
   * Internal method that performs the actual user memory extraction
   */
  private async doUpdateUserMemory(options: AgentInvokeOptions): Promise<void> {
    const { extractor } = this.userMemoryConfig ?? {};
    if (!extractor) {
      throw new Error("Cannot update user memory without an extractor agent configured.");
    }

    // Get session memory facts as the source for consolidation
    const sessionFacts =
      this.runtimeState.sessionMemory?.map((entry) => entry.content).filter(isNonNullable) ?? [];

    if (sessionFacts.length === 0) return;

    // Get existing user memory facts for context and deduplication
    const existingUserFacts =
      this.runtimeState.userMemory?.map((entry) => entry.content).filter(isNonNullable) ?? [];

    // Extract user memory facts from session memory
    const result = await options.context.invoke(extractor, {
      sessionFacts,
      existingUserFacts,
    });

    // If no changes, nothing to do
    if (!result.newFacts.length && !result.removeFacts?.length) {
      return;
    }

    if (this.afs && this.historyModulePath && this.userId) {
      // Handle fact removal
      if (result.removeFacts?.length && this.runtimeState.userMemory) {
        const entriesToRemove: AFSEntry<MemoryFact>[] = [];

        for (const label of result.removeFacts) {
          const entry = this.runtimeState.userMemory.find((e) => e.content?.label === label);
          if (entry) entriesToRemove.push(entry);
        }

        // Remove from AFS storage and runtime state
        for (const entryToRemove of entriesToRemove) {
          const memoryEntryPath = joinURL(
            this.historyModulePath,
            "by-user",
            this.userId,
            "@metadata/memory",
            entryToRemove.id,
          );
          await this.afs.delete(memoryEntryPath);

          const index = this.runtimeState.userMemory.indexOf(entryToRemove);
          if (index !== -1) {
            this.runtimeState.userMemory.splice(index, 1);
          }
        }
      }

      // Handle new/updated facts
      // For user memory, labels are unique - replace existing facts with same label
      if (result.newFacts.length) {
        const userMemoryPath = joinURL(
          this.historyModulePath,
          "by-user",
          this.userId,
          "@metadata/memory/new",
        );

        for (const fact of result.newFacts) {
          // Check if fact with same label already exists
          const existingEntry = this.runtimeState.userMemory?.find(
            (e) => e.content?.label === fact.label,
          );

          if (existingEntry) {
            // Delete old entry
            const oldEntryPath = joinURL(
              this.historyModulePath,
              "by-user",
              this.userId,
              "@metadata/memory",
              existingEntry.id,
            );
            await this.afs.delete(oldEntryPath);

            // Remove from runtime state
            if (this.runtimeState.userMemory) {
              const index = this.runtimeState.userMemory.indexOf(existingEntry);
              if (index !== -1) {
                this.runtimeState.userMemory.splice(index, 1);
              }
            }
          }

          // Create new entry
          const newEntry = await this.afs.write(userMemoryPath, {
            userId: this.userId,
            agentId: this.agentId,
            content: fact,
          });

          // Add to runtime state
          this.runtimeState.userMemory ??= [];
          this.runtimeState.userMemory.push(newEntry.data);
        }
      }
    }
  }

  private async initializeDefaultCompactor() {
    this.compactConfig.compactor ??= await import("./compact/compactor.js").then(
      (m) => new m.AISessionCompactor(),
    );
  }

  private async initializeDefaultSessionMemoryExtractor() {
    this.sessionMemoryConfig.extractor ??= await import(
      "./compact/session-memory-extractor.js"
    ).then((m) => new m.AISessionMemoryExtractor());
  }

  private async initializeDefaultUserMemoryExtractor() {
    this.userMemoryConfig.extractor ??= await import("./compact/user-memory-extractor.js").then(
      (m) => new m.AIUserMemoryExtractor(),
    );
  }

  private get maxTokens(): number {
    return this.compactConfig?.maxTokens ?? DEFAULT_MAX_TOKENS;
  }

  private get keepRecentRatio(): number {
    return this.compactConfig?.keepRecentRatio ?? DEFAULT_KEEP_RECENT_RATIO;
  }

  private get keepTokenBudget(): number {
    return Math.floor(this.maxTokens * this.keepRecentRatio);
  }

  private get singleMessageLimit(): number {
    return this.keepTokenBudget * 0.5;
  }
}
