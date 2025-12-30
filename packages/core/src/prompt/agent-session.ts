import type { AFS, AFSEntry } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { joinURL } from "ufo";
import type { ChatModelInputMessage } from "../agents/chat-model.js";
import { isNonNullable } from "../utils/type-utils.js";

export interface AgentSessionOptions {
  sessionId: string;
  userId?: string;
  agentId?: string;
  afs?: AFS;
  maxHistoryItems?: number;
}

interface EntryContent {
  input?: unknown;
  output?: unknown;
  messages?: ChatModelInputMessage[];
}

interface RuntimeState {
  systemMessages?: ChatModelInputMessage[];
  historyEntries: EntryContent[];
  currentEntry: EntryContent | null;
}

export class AgentSession {
  readonly sessionId: string;
  readonly userId?: string;
  readonly agentId?: string;

  private afs?: AFS;
  private historyModulePath?: string;
  private maxHistoryItems: number;
  private runtimeState: RuntimeState;
  private initialized?: Promise<void>;

  constructor(options: AgentSessionOptions) {
    this.sessionId = options.sessionId;
    this.userId = options.userId;
    this.agentId = options.agentId;
    this.afs = options.afs;
    this.maxHistoryItems = options.maxHistoryItems ?? 10;

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

    const { systemMessages, historyEntries, currentEntry } = this.runtimeState;

    return [
      ...(systemMessages ?? []),
      ...historyEntries.flatMap((entry) => entry.messages ?? []),
      ...(currentEntry?.messages ?? []),
    ];
  }

  async startMessage(input: unknown, message: ChatModelInputMessage): Promise<void> {
    await this.ensureInitialized();

    this.runtimeState.currentEntry = { input, messages: [message] };
  }

  async endMessage(output: unknown, message: ChatModelInputMessage): Promise<void> {
    await this.ensureInitialized();

    if (
      !this.runtimeState.currentEntry?.input ||
      !this.runtimeState.currentEntry.messages?.length
    ) {
      throw new Error("No current entry to end. Call startMessage() first.");
    }

    this.runtimeState.currentEntry.output = output;
    this.runtimeState.currentEntry.messages.push(message);

    if (this.afs && this.historyModulePath) {
      await this.afs.write(joinURL(this.historyModulePath, "new"), {
        userId: this.userId,
        sessionId: this.sessionId,
        agentId: this.agentId,
        content: this.runtimeState.currentEntry,
      });
    }

    this.runtimeState.historyEntries.push(this.runtimeState.currentEntry);
    this.runtimeState.currentEntry = null;
  }

  async appendCurrentMessages(...message: ChatModelInputMessage[]): Promise<void> {
    await this.ensureInitialized();

    if (!this.runtimeState.currentEntry || !this.runtimeState.currentEntry.messages?.length) {
      throw new Error("No current entry to append messages. Call startMessage() first.");
    }

    this.runtimeState.currentEntry.messages.push(...message);
  }

  private async ensureInitialized(): Promise<void> {
    this.initialized ??= this.initialize();
    await this.initialized;
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    const historyModule = (await this.afs?.listModules())?.find(
      (m) => m.module instanceof AFSHistory,
    );

    this.historyModulePath = historyModule?.path;

    if (this.afs && this.historyModulePath) {
      const afsEntries: AFSEntry[] = (
        await this.afs.list(joinURL(this.historyModulePath, "by-session", this.sessionId), {
          filter: {
            userId: this.userId,
            agentId: this.agentId,
          },
          limit: this.maxHistoryItems,
          orderBy: [["createdAt", "desc"]],
        })
      ).data;

      this.runtimeState.historyEntries = afsEntries
        .reverse()
        .map((entry) => entry.content as EntryContent)
        .filter(isNonNullable);
    }
  }
}
