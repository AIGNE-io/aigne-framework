import { optional, z } from "zod";
import { AIAgent, type AIAgentOptions } from "../../agents/ai-agent.js";
import { isNil, omitBy } from "../../utils/type-utils.js";
import type { UserMemoryExtractorInput, UserMemoryExtractorOutput } from "./types.js";

const EXTRACTOR_INSTRUCTIONS = `\
You are a user memory extractor. Your task is to extract long-term user memory facts from session memory that represent verified, persistent user characteristics.

## Session Memory Facts (from current session)

${"```"}yaml alt="session-facts"
{{ sessionFacts | yaml.stringify }}
${"```"}

## Existing User Memory Facts

${"```"}yaml alt="existing-user-facts"
{{ existingUserFacts | yaml.stringify }}
${"```"}

## Guidelines

1. **Extract session facts into long-term user memory**:
   - Promote facts that represent lasting user characteristics (preferences, skills, working style)
   - Filter out temporary or session-specific information
   - Aggregate patterns observed across multiple sessions
   - Verify consistency with existing user memory

2. **User memory should focus on USER characteristics**:
   - **Preferences**: Lasting tool/framework/language preferences the user likes to use
   - **Skills**: Confirmed technical expertise and proficiency levels of the user
   - **Working style**: User's communication preferences, workflow patterns, coding standards
   - **Personal context**: Stable personal context (timezone, team structure, role, work hours)
   - **Project basic info**: What projects the user is working on and their role in them
     - Example: "User is building an AI Agent framework called aigne-framework"
     - Example: "User is the tech lead on a React e-commerce project"
     - DO NOT include project technical details, architecture, or implementation specifics

3. **DO NOT include in user memory**:
   - Session-specific tasks or temporary goals
   - Bugs or issues being debugged in a specific session
   - One-time decisions or experimental choices
   - Unverified assumptions or single-instance observations
   - **Project technical details**: architecture decisions, tech stack specifics, implementation details
   - **Project problems**: current bugs, issues, technical debt, or temporary blockers
   - Information about the codebase structure or specific files/modules

4. **Output only changes (CRITICAL)**:
   - Only output facts that need to be added or updated
   - DO NOT output facts that already exist and don't need changes
   - Each label in newFacts must be unique
   - When a label already exists in user memory:
     - Include it in newFacts ONLY if session provides new information to update it
     - Omit it from newFacts if it doesn't need changes
   - Use the same label format as session memory: "pref-*", "skill-*", "proj-*", "ctx-*"

5. **When to output a fact in newFacts**:
   - **New fact**: Extracting a brand new user characteristic not in existing user memory
   - **Updated fact**: Session provides new information that enhances an existing fact
   - **Refined fact**: Multiple sessions show patterns that refine existing facts
   - DO NOT output if: The fact already exists and session doesn't add new information

6. **When to remove facts** (add labels to removeFacts):
   - Facts are proven to be outdated or incorrect
   - User explicitly changed their approach permanently
   - Facts are redundant with newer, better facts

7. **Confidence scoring**:
   - Higher confidence (0.8-1.0): Verified across multiple sessions or explicitly stated
   - Medium confidence (0.5-0.7): Observed patterns but limited data
   - Lower confidence (0.3-0.4): Tentative patterns, may need more verification
   - Below 0.3: Don't extract into user memory yet

8. **Extraction criteria**:
   - Only extract facts that are clearly valuable long-term
   - Prefer quality over quantity - fewer high-confidence facts are better
   - When in doubt, wait for more sessions to verify the pattern

Output the extracted user memory facts and any facts to remove.`;

export interface CreateUserMemoryExtractorOptions
  extends AIAgentOptions<UserMemoryExtractorInput, UserMemoryExtractorOutput> {}

export class AIUserMemoryExtractor extends AIAgent<
  UserMemoryExtractorInput,
  UserMemoryExtractorOutput
> {
  constructor(options?: CreateUserMemoryExtractorOptions) {
    super({
      name: "UserMemoryExtractor",
      description: "Extracts long-term user memory facts from session memory",
      inputSchema: z.object({
        sessionFacts: z
          .array(
            z.object({
              label: z.string(),
              fact: z.string(),
              confidence: optional(z.number()),
              tags: optional(z.array(z.string())),
            }),
          )
          .describe("Session memory facts to extract from"),
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
            .describe("Existing user memory facts for context and deduplication"),
        ),
      }),
      outputSchema: z.object({
        newFacts: z
          .array(
            z.object({
              label: z.string().describe("Short, semantic label for the fact (must be unique)"),
              fact: z.string().describe("The extracted fact content"),
              confidence: optional(z.number().min(0).max(1).describe("Confidence score (0-1)")),
              tags: optional(z.array(z.string()).describe("Classification tags")),
            }),
          )
          .describe(
            "Facts to add or update in user memory. Only include facts that are new or need updates. Do not include unchanged facts.",
          ),
        removeFacts: optional(
          z.array(z.string()).describe("Labels of facts to remove from user memory"),
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
