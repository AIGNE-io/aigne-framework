import {
  type LLMModel,
  type MemoryActionItem,
  MemoryRunner,
  type MemoryRunnerInput,
  logger,
} from "@aigne/core";
import { uniqBy } from "lodash";

import type { Retriever } from "../core/type";
import { getUpdateMemoryMessages } from "../lib/prompts";
import { getFactRetrievalMessages, parseMessages } from "../lib/utils";

export type ShortTermMemoryRunnerCustomData = { retriever: Retriever<string> };

export type ShortTermMemoryRunnerInput = MemoryRunnerInput<ShortTermMemoryRunnerCustomData>;

export type ShortTermMemoryRunnerOutput = {
  actions: MemoryActionItem<string>[];
};

export class ShortTermMemoryRunner extends MemoryRunner<string, ShortTermMemoryRunnerCustomData> {
  constructor(public llmModel: LLMModel) {
    super("short_term_memory");
  }

  async process(input: ShortTermMemoryRunnerInput): Promise<ShortTermMemoryRunnerOutput> {
    const { messages, filter } = input;

    const retriever = input.customData?.retriever;
    if (!retriever) throw new Error("retriever is required in the customData");

    const parsedMessages = parseMessages(messages);
    const [systemPrompt, userPrompt] = getFactRetrievalMessages(parsedMessages);

    const response = await this.llmModel.run({
      modelOptions: {
        model: "gpt-4o-mini",
        temperature: 0.3,
      },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      responseFormat: {
        type: "json_schema",
        jsonSchema: {
          name: "facts_schema",
          schema: {
            type: "object",
            properties: {
              facts: {
                type: "array",
                description: "Array of extracted facts from the input text",
                items: {
                  type: "string",
                },
              },
            },
            additionalProperties: false,
            required: ["facts"],
          },
          strict: true,
        },
      },
    });

    if (!response.$text) throw new Error("No response from LLM");

    const newRetrievedFacts: string[] = JSON.parse(response.$text).facts;
    logger.debug("newRetrievedFacts", newRetrievedFacts);

    const allExistingMemories = await Promise.all(
      newRetrievedFacts.map((fact) =>
        retriever.search(fact, 5, {
          filter: {
            ...filter,
            ...(input.userId ? { userId: input.userId } : {}),
            ...(input.sessionId ? { sessionId: input.sessionId } : {}),
          },
        }),
      ),
    );

    const retrievedOldMemories = uniqBy(
      allExistingMemories.flatMap((existingMemories) => {
        return existingMemories.map((memory) => ({
          id: memory.id,
          text: memory.memory,
        }));
      }),
      "id",
    );

    logger.debug("Retrieved Old Memories", retrievedOldMemories);

    // mapping UUIDs with integers for handling UUID hallucinations
    const tempUuidMapping: Record<string, string> = {};
    retrievedOldMemories.forEach((item, idx) => {
      if (item.id) {
        const idxStr = idx.toString();
        tempUuidMapping[idxStr] = item.id;
        item.id = idxStr;
      }
    });

    const funcCallingPrompt = getUpdateMemoryMessages(retrievedOldMemories, newRetrievedFacts);

    const newMemoriesWithActions = await this.llmModel.run({
      modelOptions: {
        model: "gpt-4o-mini",
        temperature: 0.3,
      },
      messages: [{ role: "system", content: funcCallingPrompt }],
      responseFormat: {
        type: "json_schema",
        jsonSchema: {
          name: "memory_schema",
          schema: {
            type: "object",
            properties: {
              memory: {
                type: "array",
                description: "Array of memory operations and their details",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "Memory entry identifier from 0 to n",
                    },
                    text: {
                      type: "string",
                      description: "Content of the memory",
                    },
                    event: {
                      type: "string",
                      enum: ["add", "update", "delete", "none"],
                      description: "Type of memory operation",
                    },
                    oldMemory: {
                      type: "string",
                      description: "Previous content for UPDATE operations",
                    },
                  },
                  required: ["id", "text", "event"],
                  additionalProperties: false,
                },
              },
            },
            required: ["memory"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    });

    if (!newMemoriesWithActions.$text) throw new Error("No response from LLM");

    const result: {
      memory: {
        id: string;
        text: string;
        event: "add" | "update" | "delete" | "none";
        oldMemory?: string | null;
      }[];
    } = JSON.parse(newMemoriesWithActions.$text);

    return {
      actions: result.memory.map<ShortTermMemoryRunnerOutput["actions"][number]>((m) => ({
        id: tempUuidMapping[m.id],
        memory: m.text,
        oldMemory: m.oldMemory ?? undefined,
        event: m.event.toLowerCase() as any,
      })),
    };
  }
}
