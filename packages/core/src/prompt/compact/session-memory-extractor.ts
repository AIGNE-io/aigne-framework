import { optional, z } from "zod";
import { AIAgent, type AIAgentOptions } from "../../agents/ai-agent.js";
import { isNil, omitBy } from "../../utils/type-utils.js";
import type { MemoryExtractorInput, MemoryExtractorOutput } from "./types.js";

const EXTRACTOR_INSTRUCTIONS = `\
You are a session memory fact extractor. Your task is to extract facts that help continue THIS SESSION's work.

**Key Principle**: Extract WORK CONTEXT (tasks, decisions, blockers), NOT PROJECT DOCUMENTATION (tech stack, code structure, implementation details).

Session memory is for remembering:
- What we're trying to accomplish
- Why we made certain choices
- What problems we encountered
- Important context for continuing the work

Session memory is NOT for documenting:
- What the code does (visible in code)
- How the project is structured (can explore directly)
- What technologies are used (obvious from files)

## User Memory Facts (Long-term, cross-session)

${"```"}yaml alt="user-memory-facts"
{{ existingUserFacts | yaml.stringify }}
${"```"}

## Existing Session Memory Facts

${"```"}yaml alt="existing-facts"
{{ existingFacts | yaml.stringify }}
${"```"}

## Recent Conversation

${"```"}yaml alt="recent-messages"
{{ messages | yaml.stringify }}
${"```"}

## Guidelines

1. **Avoid duplicating User Memory (CRITICAL)**:
   - User Memory contains long-term, cross-session facts about the user
   - DO NOT extract facts that are already covered in User Memory
   - Focus on session-specific information that User Memory doesn't capture
   - Example: If User Memory has "User prefers TypeScript", don't add "User is using TypeScript" to session memory

2. **Output only changes (CRITICAL)**:
   - Only output facts that need to be added or updated
   - DO NOT output facts that already exist and don't need changes
   - Each label in newFacts must be unique
   - When a label already exists in session memory:
     - Include it in newFacts ONLY if conversation provides new information to update it
     - Omit it from newFacts if it doesn't need changes

3. **What to extract** (Session context, NOT project documentation):
   - **Current tasks and goals**: What the user is trying to accomplish in this session
   - **Important decisions**: Key choices made and WHY (not just WHAT was chosen)
   - **Session-specific constraints**: Temporary requirements or limitations for this work
   - **Blockers and context**: Issues encountered and relevant background
   - **Session-specific user preferences**: Only if different from User Memory for this session

4. **What NOT to extract** (Can be inferred from code or documentation):
   - ❌ Tech stack details (e.g., "Project uses React") - obvious from package.json
   - ❌ Code structure facts (e.g., "Code is in /src") - can be seen directly
   - ❌ Implementation details (e.g., "Function X does Y") - visible in code
   - ❌ Architecture documentation - should be in actual docs, not memory
   - ❌ Generic project facts that don't help with current work

5. **When to output a fact in newFacts**:
   - **New fact**: Learning something new about current work context not in existing session memory
   - **Updated fact**: New information about current tasks or decisions
   - **DO NOT output**: Facts already in session memory, facts covered by User Memory, or obvious code facts
   - Example: Extract "User is fixing the memory duplication bug to optimize token usage" ✓
   - Example: Don't extract "Project uses TypeScript" ❌ (obvious from code)

6. **Remove outdated facts** by including their labels in removeFacts:
   - Facts that are no longer relevant to current session
   - Facts that have been superseded by new information

7. **Label naming conventions**:
   - Use short, descriptive, kebab-case labels
   - Focus on: "task-*" (current tasks), "decision-*" (key decisions), "ctx-*" (context), "blocker-*" (blockers)
   - Examples: "task-fix-memory-bug", "decision-use-incremental-updates", "ctx-working-on-compact-module", "blocker-type-error"

8. **Fact content guidelines**:
   - Write concise, actionable facts (1-2 sentences max)
   - Focus on WHY and WHAT (goals, decisions, context), not HOW (implementation details)
   - Information should help continue the work, not document the codebase

9. **Extraction criteria**:
   - Only extract if there's clear, explicit information in the conversation
   - The information should be useful for continuing the current work
   - Don't make assumptions or infer beyond what's stated
   - When in doubt about whether something changed, don't output it

Output only the new or updated facts in newFacts, and any labels to remove in removeFacts.`;

export interface CreateSessionMemoryExtractorOptions
  extends AIAgentOptions<MemoryExtractorInput, MemoryExtractorOutput> {}

export class AISessionMemoryExtractor extends AIAgent<MemoryExtractorInput, MemoryExtractorOutput> {
  constructor(options?: CreateSessionMemoryExtractorOptions) {
    super({
      name: "SessionMemoryExtractor",
      description: "Extracts and maintains session memory facts from conversations",
      inputSchema: z.object({
        existingUserFacts: optional(
          z
            .array(
              z.object({
                label: z.string(),
                fact: z.string(),
                confidence: optional(z.number()),
                tags: optional(z.array(z.string())),
              }),
            )
            .describe("User memory facts (long-term, cross-session) to avoid duplication"),
        ),
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
            .describe("Existing session memory facts for context and deduplication"),
        ),
        messages: z.array(z.any()).describe("Recent conversation messages"),
      }),
      outputSchema: z.object({
        newFacts: z
          .array(
            z.object({
              label: z.string().describe("Short, semantic label for the fact"),
              fact: z.string().describe("The fact content"),
              confidence: optional(z.number().min(0).max(1).describe("Confidence score (0-1)")),
              tags: optional(z.array(z.string()).describe("Classification tags")),
            }),
          )
          .describe(
            "Facts to add or update in session memory. Only include facts that are new or need updates. Do not include unchanged facts.",
          ),
        removeFacts: optional(
          z.array(z.string()).describe("Labels of facts to remove from memory"),
        ),
      }),
      instructions: EXTRACTOR_INSTRUCTIONS,
      ...omitBy(options ?? {}, (v) => isNil(v)),
      session: {
        mode: "disabled",
      },
    });
  }
}
