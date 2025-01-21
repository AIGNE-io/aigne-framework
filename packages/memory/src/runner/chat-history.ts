import {
  type MemoryActionItem,
  type MemoryActions,
  MemoryRunner,
  type MemoryRunnerInput,
  type RunOptions,
  type RunnableResponse,
  type RunnableResponseStream,
  isNonNullable,
  objectToRunnableResponseStream,
} from "@aigne/core";
import differenceBy from "lodash/differenceBy";
import orderBy from "lodash/orderBy";

import { Memory } from "../core/memory";
import type { HistoryStore, Retriever } from "../core/type";
import nextId from "../lib/next-id";

export type ChatHistoryRunnerOutput = { actions: MemoryActionItem<string>[] };

export class ChatHistoryRunner extends MemoryRunner<string> {
  constructor() {
    super("chat_history");
  }

  async run(
    input: MemoryRunnerInput,
    options: RunOptions & { stream: true },
  ): Promise<RunnableResponseStream<ChatHistoryRunnerOutput>>;
  async run(
    input: MemoryRunnerInput,
    options?: RunOptions & { stream?: false },
  ): Promise<ChatHistoryRunnerOutput>;
  async run(
    input: MemoryRunnerInput,
    options?: RunOptions,
  ): Promise<RunnableResponse<ChatHistoryRunnerOutput>> {
    const { messages } = input;

    const result: ChatHistoryRunnerOutput = {
      actions: messages.map((message) => {
        return {
          id: nextId(),
          event: "add",
          memory:
            typeof message.content === "string"
              ? message.content
              : JSON.stringify(message.content),
          metadata: { role: message.role },
        };
      }),
    };

    return options?.stream ? objectToRunnableResponseStream(result) : result;
  }
}

export class ChatHistory extends Memory<string> {
  constructor(options: {
    path: string;
    retriever?: Retriever<string>;
    historyStore?: HistoryStore<string>;
  }) {
    super({
      ...options,
      runner: new ChatHistoryRunner(),
    });
  }

  async search(
    query: Extract<
      MemoryActions<string>,
      { action: "search" }
    >["inputs"]["query"],
    {
      k = 10,
      ...options
    }: Extract<
      MemoryActions<string>,
      { action: "search" }
    >["inputs"]["options"] = {},
  ): Promise<Extract<MemoryActions<string>, { action: "search" }>["outputs"]> {
    return {
      results: await Promise.all([
        super.search(query, { ...options, k }),
        super.filter({
          ...options,
          k,
          sort: { field: "createdAt", direction: "desc" },
        }),
      ]).then(([{ results: matched }, { results: latest }]) => {
        matched = orderBy(
          differenceBy(matched, latest, (i) => i.id),
          (i) => i.createdAt,
          "desc",
        );

        return orderBy(
          latest
            .flatMap((i, index) => [{ ...i, score: 1 }, matched[index]])
            .filter(isNonNullable)
            .slice(0, k),
          (i) => i.createdAt,
          "asc",
        );
      }),
    };
  }
}
