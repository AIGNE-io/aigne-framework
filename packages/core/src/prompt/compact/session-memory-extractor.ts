import { optional, z } from "zod";
import { AIAgent, type AIAgentOptions } from "../../agents/ai-agent.js";
import { isNil, omitBy } from "../../utils/type-utils.js";
import type { MemoryExtractorInput, MemoryExtractorOutput } from "./types.js";

const EXTRACTOR_INSTRUCTIONS = `\
You are a session memory fact extractor. Your task is to learn new facts about the user from the current session's conversation and maintain an up-to-date memory.

## Existing Session Memory Facts

${"```"}yaml alt="existing-facts"
{{ existingFacts | yaml.stringify }}
${"```"}

## Recent Conversation

${"```"}yaml alt="recent-messages"
{{ messages | yaml.stringify }}
${"```"}

## Guidelines

1. **Extract new facts** about the user from the recent conversation:
   - User preferences (tools, languages, frameworks, workflows)
   - User skills and expertise levels
   - Project-specific context (tech stack, architecture decisions)
   - Personal context relevant to work (timezone, working hours, communication style)

2. **Update existing facts** if new information contradicts or refines them:
   - Use the same label to update/replace the old fact
   - Example: If user previously preferred npm but now uses pnpm, update "pref-package-manager"

3. **Remove outdated facts** by including their labels in removeFacts:
   - Facts that are no longer relevant
   - Facts that have been superseded by new information

4. **Label naming conventions**:
   - Use short, descriptive, kebab-case labels
   - Categories: "pref-*" (preferences), "skill-*" (skills), "proj-*" (project-specific), "ctx-*" (context)
   - Examples: "pref-editor", "skill-typescript", "proj-main-db", "ctx-timezone"

5. **Fact content guidelines**:
   - Write concise, actionable facts (1-2 sentences max)
   - Be specific and avoid vague statements
   - Focus on information that helps in this and future sessions

6. **Only extract facts if**:
   - There's clear, explicit information in the conversation
   - The information is likely to be useful in this session or future sessions
   - Don't make assumptions or infer beyond what's stated

Output the learned facts and any facts to remove.`;

export interface CreateSessionMemoryExtractorOptions
  extends AIAgentOptions<MemoryExtractorInput, MemoryExtractorOutput> {}

export class AISessionMemoryExtractor extends AIAgent<MemoryExtractorInput, MemoryExtractorOutput> {
  constructor(options?: CreateSessionMemoryExtractorOptions) {
    super({
      name: "SessionMemoryExtractor",
      description: "Extracts and maintains session memory facts from conversations",
      inputSchema: z.object({
        existingFacts: optional(
          z
            .array(
              z.object({
                label: z.string(),
                fact: z.string(),
                confidence: optional(z.number()),
                tags: optional(z.array(z.string())),
              }),
            )
            .describe("Existing memory facts for context and deduplication"),
        ),
        messages: z.array(z.any()).describe("Recent conversation messages"),
      }),
      outputSchema: z.object({
        facts: z
          .array(
            z.object({
              label: z.string().describe("Short, semantic label for the fact"),
              fact: z.string().describe("The fact content"),
              confidence: optional(z.number().min(0).max(1).describe("Confidence score (0-1)")),
              tags: optional(z.array(z.string()).describe("Classification tags")),
            }),
          )
          .describe("Newly learned or updated facts"),
        removeFacts: optional(
          z.array(z.string()).describe("Labels of facts to remove from memory"),
        ),
      }),
      instructions: EXTRACTOR_INSTRUCTIONS,
      ...omitBy(options ?? {}, (v) => isNil(v)),
    });
  }
}
