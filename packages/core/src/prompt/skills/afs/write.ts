import { z } from "zod";
import type { AgentInvokeOptions, AgentOptions, Message } from "../../../agents/agent.js";
import { AFSSkillBase } from "./base.js";

export interface AFSWriteInput extends Message {
  path: string;
  content: string;
  append?: boolean;
}

export interface AFSWriteOutput extends Message {
  status: string;
  tool: string;
  path: string;
  message?: string;
}

export interface AFSWriteAgentOptions extends AgentOptions<AFSWriteInput, AFSWriteOutput> {
  afs: NonNullable<AgentOptions<AFSWriteInput, AFSWriteOutput>["afs"]>;
}

export class AFSWriteAgent extends AFSSkillBase<AFSWriteInput, AFSWriteOutput> {
  constructor(options: AFSWriteAgentOptions) {
    super({
      name: "afs_write",
      description: `Write or create files in the Agentic File System (AFS)
- Creates a new file or overwrites an existing file with the provided content
- Supports append mode to add content to the end of existing files
- Use this tool when creating new files or completely replacing file contents

Usage:
- The path must be an absolute AFS path starting with "/" (e.g., "/docs/new-file.md", "/memory/user/notes")
- This is NOT a local system file path - it operates within the AFS virtual file system
- By default, this tool overwrites the entire file content
- Use append mode to add content to the end of an existing file without replacing it
- For partial edits to existing files, prefer using afs_edit instead`,
      ...options,
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Absolute AFS path for the file to write (e.g., '/docs/new-file.md'). Must start with '/'",
          ),
        content: z
          .string()
          .describe(
            "The content to write to the file. In overwrite mode, this replaces the entire file",
          ),
        append: z
          .boolean()
          .optional()
          .default(false)
          .describe(
            "Set to true to append content to the end of an existing file. Default: false (overwrites entire file)",
          ),
      }),
      outputSchema: z.object({
        status: z.string(),
        tool: z.string(),
        path: z.string(),
        message: z.string().optional(),
      }),
    });
  }

  async process(input: AFSWriteInput, _options: AgentInvokeOptions): Promise<AFSWriteOutput> {
    if (!this.afs) throw new Error("AFS is not configured for this agent.");

    const result = await this.afs.write(
      input.path,
      {
        content: input.content,
      },
      {
        append: input.append ?? false,
      },
    );

    return {
      status: "success",
      tool: "afs_write",
      path: input.path,
      ...result,
    };
  }
}
