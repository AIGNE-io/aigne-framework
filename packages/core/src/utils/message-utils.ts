import omit from "lodash/omit";

import type { LLMAgentDefinition } from "../llm-agent";
import type { LLMModelInputMessage, Role } from "../llm-model";
import type { MemoryItemWithScore } from "../memorable";
import { isNonNullable } from "./is-non-nullable";
import { renderMessage } from "./mustache-utils";
import { OrderedRecord } from "./ordered-map";

export function mergeHistoryMessages(
  messages: LLMModelInputMessage[],
  history: LLMModelInputMessage[],
): LLMModelInputMessage[] {
  const firstUserMessageIndex = messages.findIndex((m) => m.role === "user");
  if (firstUserMessageIndex >= 0) {
    return [
      ...messages.slice(0, firstUserMessageIndex),
      ...history,
      ...messages.slice(firstUserMessageIndex),
    ];
  }

  return [...history, ...messages];
}

export function memoriesToMessages(
  memories: { [name: string]: MemoryItemWithScore[] },
  { primaryMemoryName }: { primaryMemoryName?: string } = {},
): {
  primaryMemory: LLMModelInputMessage[];
  memory: string;
} {
  const primary = (primaryMemoryName && memories[primaryMemoryName]) || [];
  const otherMemories = primaryMemoryName
    ? (omit(memories, primaryMemoryName) as typeof memories)
    : memories;

  const primaryMemory = primary
    .map((i) => {
      const content = renderMessage("{{memory}}", { memory: i.memory }).trim();
      const role = ["user", "assistant"].includes(
        (i.metadata as { role: Role }).role,
      )
        ? (i.metadata.role as Role)
        : undefined;

      if (!role || !content) return null;

      return { role, content };
    })
    .filter(isNonNullable);

  const memory = Object.values(otherMemories)
    .map((i) =>
      i
        .map((j) => renderMessage("{{memory}}\n{{metadata}}", j).trim() || null)
        .filter(isNonNullable)
        .join("\n"),
    )
    .join("\n");

  return {
    primaryMemory,
    memory,
  };
}

export function prepareMessages(
  definition: Pick<
    LLMAgentDefinition,
    "messages" | "memories" | "primaryMemoryId"
  >,
  input: { [name: string]: unknown },
  memories: { [name: string]: MemoryItemWithScore[] },
) {
  const originalMessages = OrderedRecord.toArray(definition.messages).map(
    ({ role, content }): LLMModelInputMessage => ({
      role,
      content:
        typeof content === "string" ? renderMessage(content, input) : content,
    }),
  );
  if (!originalMessages.length) throw new Error("Messages are required");

  const { primaryMemory, memory } = memoriesToMessages(memories, {
    primaryMemoryName: OrderedRecord.find(
      definition.memories,
      (i) => i.id === definition.primaryMemoryId,
    )?.name,
  });

  let messagesWithMemory = [...originalMessages];

  // Add memory to a system message
  if (memory) {
    const message: LLMModelInputMessage = {
      role: "system",
      content: `\
        Here are the memories about the user:
        ${memory}
        `,
    };

    const lastSystemMessageIndex = messagesWithMemory.findLastIndex(
      (i) => i.role === "assistant",
    );
    messagesWithMemory.splice(lastSystemMessageIndex + 1, 0, message);
  }

  // Add primary memory to messages
  if (primaryMemory.length)
    messagesWithMemory = mergeHistoryMessages(
      messagesWithMemory,
      primaryMemory,
    );

  // TODO: support comment/image for messages

  return { originalMessages, messagesWithMemory };
}
