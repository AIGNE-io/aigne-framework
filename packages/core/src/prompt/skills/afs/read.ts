import type { AFSEntry } from "@aigne/afs";
import { z } from "zod";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type Message,
} from "../../../agents/agent.js";

export interface AFSReadInput extends Message {
  path: string;
  withLineNumbers?: boolean;
}

export interface AFSReadOutput extends Message {
  status: string;
  tool: string;
  path: string;
  withLineNumbers?: boolean;
  result?: AFSEntry;
  message?: string;
}

export interface AFSReadAgentOptions extends AgentOptions<AFSReadInput, AFSReadOutput> {
  afs: NonNullable<AgentOptions<AFSReadInput, AFSReadOutput>["afs"]>;
}

export class AFSReadAgent extends Agent<AFSReadInput, AFSReadOutput> {
  constructor(options: AFSReadAgentOptions) {
    super({
      name: "afs_read",
      description: `\
Read file contents from the AFS - path must be an exact file path from list or search results

Usage:
- Use withLineNumbers=true to get line numbers for code reviews or edits
`,
      ...options,
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Exact file path from list or search results (e.g., '/docs/api.md', '/src/utils/helper.js')",
          ),
        withLineNumbers: z
          .boolean()
          .optional()
          .describe(`Whether to include line numbers in the returned content, default is false`),
      }),
      outputSchema: z.object({
        status: z.string(),
        tool: z.string(),
        path: z.string(),
        withLineNumbers: z.boolean().optional(),
        result: z.custom<AFSEntry>().optional(),
        message: z.string().optional(),
      }),
    });
  }

  async process(input: AFSReadInput, _options: AgentInvokeOptions): Promise<AFSReadOutput> {
    if (!this.afs) {
      throw new Error("AFS is not configured for this agent.");
    }

    const result = await this.afs.read(input.path);

    let content = result.result?.content;

    if (input.withLineNumbers && typeof content === "string") {
      content = content
        .split("\n")
        .map((line, idx) => `${idx + 1}| ${line}`)
        .join("\n");
    }

    return {
      status: "success",
      tool: "afs_read",
      path: input.path,
      withLineNumbers: input.withLineNumbers,
      ...result,
      result: result.result && {
        ...result.result,
        content,
      },
    };
  }
}
