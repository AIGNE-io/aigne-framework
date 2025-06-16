import { join } from "node:path";
import { AIAgent, PromptBuilder } from "@aigne/core";
import { z } from "zod";
import { ReflectionAgent } from "../reflection-agent.ts";

export default new ReflectionAgent({
  name: "reviewAndEdit",
  maxIterations: 2,
  inputSchema: z.object({
    sources: z.string().describe("Sources to generate markdown from"),
    markdown: z.string().describe("Markdown to review and edit"),
  }),
  reviewer: AIAgent.from({
    name: "reviewer",
    inputSchema: z.object({
      sources: z.string(),
      markdown: z.string(),
    }),
    outputSchema: z.object({
      approved: z.boolean().describe("Whether the markdown is approved"),
      feedback: z.string().describe("Feedback for the markdown"),
    }),
    instructions: await PromptBuilder.from({
      path: join(import.meta.dirname, "../prompts/reviewer.zh.md"),
    }),
  }),
  isApproved: (result) => result.approved,
  editor: AIAgent.from<{ markdown: string; feedback?: string | null }, { markdown: string }>({
    name: "editor",
    inputSchema: z.object({
      sources: z.string(),
      markdown: z.string(),
      feedback: z.string().nullish().describe("Feedback from the reviewer"),
    }),
    outputKey: "markdown",
    instructions: await PromptBuilder.from({
      path: join(import.meta.dirname, "../prompts/editor.zh.md"),
    }),
  }),
});
