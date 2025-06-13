import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, type Agent, FunctionAgent, PromptBuilder, TeamAgent } from "@aigne/core";
import { z } from "zod";
import { ReflectionAgent } from "./reflection-agent.js";

type AgentOutputType<T extends Agent> = T extends AIAgent<infer _I, infer O> ? O : unknown;

export const outline = AIAgent.from({
  name: "outline",
  description: "Generate an outline for a wiki article",
  inputSchema: z.object({
    sources: z.string().describe("Sources to generate the outline from"),
  }),
  outputSchema: z.object({
    title: z.string().describe("Title of the wiki article"),
    sections: z
      .array(
        z.object({
          title: z.string().describe("Title of the section"),
          description: z.string().describe("Description of the section"),
          code: z.string().describe("Code snippet for the section"),
          codePath: z.string().describe("Path to the code snippet file"),
          codeRegion: z.string().describe("Region of the code snippet"),
        }),
      )
      .describe("Sections of the wiki article"),
  }),
  instructions: await PromptBuilder.from({ path: "./prompts/outline.zh.md" }),
});

const outlineToMarkdown = FunctionAgent.from((input: AgentOutputType<typeof outline>) => {
  const renderSection = (section: (typeof input)["sections"][number]) => {
    return `\
## ${section.title}

${section.description}

${"```"}ts file="${section.codePath}" region="${section.codeRegion}"
${section.code}
${"```"}
`;
  };

  return {
    $message: `\
# ${input.title}

${input.sections.map((section) => renderSection(section)).join("\n")}
`,
  };
});

const sectionRefiner = AIAgent.from({
  name: "sectionRefiner",
  description: "Refine a section of the wiki article",
  inputSchema: z.object({
    $message: z.string().describe("Message to refine the section"),
  }),
  instructions: await PromptBuilder.from({ path: "./prompts/section-refiner.zh.md" }),
});

const summarizer = AIAgent.from({
  name: "summarizer",
  description: "Add summary to the wiki article",
  inputSchema: z.object({
    $message: z.string(),
  }),
  instructions: await PromptBuilder.from({ path: "./prompts/summarizer.zh.md" }),
});

const root = join(import.meta.dir, "../..");

await runWithAIGNE(
  TeamAgent.from({
    inputSchema: z.object({
      language: z.string().default("en_US").describe("Language of the wiki article"),
      sources: z.string().describe("Path to the sources file"),
      examples: z.string().describe("Path to the examples file"),
    }),
    skills: [
      FunctionAgent.from({
        name: "inputLoader",
        includeInputInOutput: true,
        inputSchema: z.object({
          language: z.string().default("en_US").describe("Language of the wiki article"),
          sources: z.string().describe("Path to the sources file"),
          examples: z.string().describe("Path to the examples file"),
        }),
        outputSchema: z.object({
          sources: z.string().describe("Contents of the sources file"),
          examples: z.string().describe("Contents of the examples file"),
        }),
        process: async ({ sources: sourcesPath, examples: examplesPath }) => {
          const sources = await readFile(join(root, sourcesPath), "utf-8");
          const examples = await readFile(join(root, examplesPath), "utf-8");

          return {
            sources: `// file: ${sourcesPath}\n${sources}`,
            examples: `// file: ${examplesPath}\n${examples}`,
          };
        },
      }),
      outline,
      outlineToMarkdown,
      sectionRefiner,
      summarizer,
      new ReflectionAgent({
        name: "reviewAndEdit",
        maxIterations: 2,
        reviewer: AIAgent.from({
          name: "reviewer",
          inputSchema: z.object({
            $message: z.string(),
          }),
          outputSchema: z.object({
            approved: z.boolean().describe("Whether the markdown is approved"),
            feedback: z.string().describe("Feedback for the markdown"),
          }),
          instructions: await PromptBuilder.from({ path: "./prompts/reviewer.zh.md" }),
        }),
        isApproved: (result) => result.approved,
        editor: AIAgent.from({
          name: "editor",
          inputSchema: z.object({
            $message: z.string(),
            feedback: z.string().nullish().describe("Feedback from the reviewer"),
          }),
          instructions: await PromptBuilder.from({ path: "./prompts/editor.zh.md" }),
        }),
      }),
    ],
  }),
);
