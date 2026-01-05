import type { AFS, AFSEntry } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { v7 } from "@aigne/uuid";
import { joinURL } from "ufo";
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
  type EntryContent,
} from "./compact/types.js";

export type { CompactConfig, CompactContent, EntryContent };

export interface AgentSessionOptions {
  sessionId: string;
  userId?: string;
  agentId?: string;
  afs?: AFS;

  /**
   * Compaction configuration
   */
  compact?: CompactConfig;
}

interface RuntimeState {
  systemMessages?: ChatModelInputMessage[];
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
  private compactConfig: CompactConfig;
  private runtimeState: RuntimeState;
  private initialized?: Promise<void>;
  private compactionPromise?: Promise<void>;

  constructor(options: AgentSessionOptions) {
    this.sessionId = options.sessionId;
    this.userId = options.userId;
    this.agentId = options.agentId;
    this.afs = options.afs;
    this.compactConfig = options.compact ?? {};

    this.runtimeState = {
      historyEntries: [],
      currentEntry: null,
    };
  }

  async setSystemMessages(...messages: ChatModelInputMessage[]): Promise<void> {
    await this.ensureInitialized();

    this.runtimeState.systemMessages = messages;
  }

  async getMessages(): Promise<ChatModelInputMessage[]> {
    await this.ensureInitialized();

    const {
      systemMessages,
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

  async startMessage(
    input: unknown,
    message: ChatModelInputMessage,
    options: AgentInvokeOptions,
  ): Promise<void> {
    await this.ensureInitialized();

    await this.maybeAutoCompact(options);

    // Always wait for compaction to complete before starting a new message
    // This ensures data consistency even in async compact mode
    if (this.compactionPromise) await this.compactionPromise;

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

    if (this.afs && this.historyModulePath) {
      newEntry = (
        await this.afs.write(joinURL(this.historyModulePath, "new"), {
          userId: this.userId,
          sessionId: this.sessionId,
          agentId: this.agentId,
          content: this.runtimeState.currentEntry,
        })
      ).data;
    } else {
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

    // Check if auto-compact should be triggered
    await this.maybeAutoCompact(options);
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

    const historyModule = (await this.afs?.listModules())?.find(
      (m) => m.module instanceof AFSHistory,
    );

    this.historyModulePath = historyModule?.path;

    if (this.afs && this.historyModulePath) {
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

      if (latestCompact?.content?.summary) {
        this.runtimeState.compactSummary = latestCompact.content.summary;
      }

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

      this.runtimeState.historyEntries = afsEntries
        .reverse()
        .filter((entry) => isNonNullable(entry.content));
    }
  }

  private async initializeDefaultCompactor() {
    this.compactConfig.compactor ??= await import("./compact/compactor.js").then(
      (m) => new m.AISessionCompactor(),
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
