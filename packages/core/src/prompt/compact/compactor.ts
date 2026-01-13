import { optional, z } from "zod";
import { AIAgent, type AIAgentOptions } from "../../agents/ai-agent.js";
import { isNil, omitBy } from "../../utils/type-utils.js";
import type { CompactContent, CompactorInput } from "./types.js";

const COMPACTOR_INSTRUCTIONS = `\
You are a conversation summarizer. Your task is to create a concise but comprehensive summary of the conversation history provided.

## Conversation history

${"```"}yaml alt="previous-summary"
{{ previousSummary | yaml.stringify }}
${"```"}


${"```"}yaml alt="conversation-histories"
{{ messages | yaml.stringify }}
${"```"}

## Guidelines

1. Preserve key information, decisions, and context that would be needed for future conversation continuity
2. Include important facts, names, dates, and specific details mentioned
3. Summarize the user's goals and preferences expressed in the conversation
4. Note any pending tasks or follow-up items
5. Keep the summary focused and avoid unnecessary verbosity
6. Write in a neutral, factual tone

Output a single summary that captures the essence of the conversation.`;

export interface CreateCompactorOptions extends AIAgentOptions<CompactorInput, CompactContent> {}

export class AISessionCompactor extends AIAgent<CompactorInput, CompactContent> {
  constructor(options?: CreateCompactorOptions) {
    super({
      name: "SessionCompactor",
      description: "Generates conversation summaries for session compaction",
      inputSchema: z.object({
        previousSummary: optional(
          z.array(z.string()).describe("List of previous conversation summaries"),
        ),
        messages: z.array(z.any()),
      }),
      outputSchema: z.object({
        summary: z.string().describe("A comprehensive summary of the conversation history"),
      }),
      instructions: COMPACTOR_INSTRUCTIONS,
      taskRenderMode: "hide",
      ...omitBy(options ?? {}, (v) => isNil(v)),
      session: {
        mode: "disabled",
      },
    });
  }
}
