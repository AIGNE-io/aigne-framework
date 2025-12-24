import type { AFSEntry } from "@aigne/afs";
import { z } from "zod";
import type { AgentInvokeOptions, AgentOptions, Message } from "../../../agents/agent.js";
import { AFSSkillBase } from "./base.js";

export interface AFSReadInput extends Message {
  path: string;
  withLineNumbers?: boolean;
}

export interface AFSReadOutput extends Message {
  status: string;
  tool: string;
  path: string;
  withLineNumbers?: boolean;
  data?: AFSEntry;
  message?: string;
}

export interface AFSReadAgentOptions extends AgentOptions<AFSReadInput, AFSReadOutput> {
  afs: NonNullable<AgentOptions<AFSReadInput, AFSReadOutput>["afs"]>;
}

export class AFSReadAgent extends AFSSkillBase<AFSReadInput, AFSReadOutput> {
  constructor(options: AFSReadAgentOptions) {
    super({
      name: "afs_read",
      description: `Read file contents from the Agentic File System (AFS)
- Returns the complete content of a file at the specified AFS path
- Supports line numbers output for precise editing references
- Use this tool when you need to review, analyze, or understand file content

Usage:
- The path must be an absolute AFS path starting with "/" (e.g., "/docs/readme.md", "/memory/user/notes")
- This is NOT a local system file path - it operates within the AFS virtual file system
- IMPORTANT: You MUST set withLineNumbers to true before using afs_edit, as line numbers are required for precise edits
- Returns the file's content along with metadata (id, path, timestamps, etc.)`,
      ...options,
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Absolute AFS path to the file to read (e.g., '/docs/readme.md'). Must start with '/'",
          ),
        withLineNumbers: z
          .boolean()
          .optional()
          .describe(
            "MUST be set to true before using afs_edit. Adds line numbers to output (format: '1| line content')",
          ),
      }),
      outputSchema: z.object({
        status: z.string(),
        tool: z.string(),
        path: z.string(),
        withLineNumbers: z.boolean().optional(),
        data: z.custom<AFSEntry>().optional(),
        message: z.string().optional(),
      }),
    });
  }

  async process(input: AFSReadInput, _options: AgentInvokeOptions): Promise<AFSReadOutput> {
    if (!this.afs) throw new Error("AFS is not configured for this agent.");

    const result = await this.afs.read(input.path);

    let content = result.data?.content;

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
      data: result.data && {
        ...result.data,
        content,
      },
    };
  }
}
