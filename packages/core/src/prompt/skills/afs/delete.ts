import { z } from "zod";
import type { AgentInvokeOptions, AgentOptions, Message } from "../../../agents/agent.js";
import { AFSSkillBase } from "./base.js";

export interface AFSDeleteInput extends Message {
  path: string;
  recursive?: boolean;
}

export interface AFSDeleteOutput extends Message {
  status: string;
  tool: string;
  path: string;
  message?: string;
}

export interface AFSDeleteAgentOptions extends AgentOptions<AFSDeleteInput, AFSDeleteOutput> {
  afs: NonNullable<AgentOptions<AFSDeleteInput, AFSDeleteOutput>["afs"]>;
}

export class AFSDeleteAgent extends AFSSkillBase<AFSDeleteInput, AFSDeleteOutput> {
  constructor(options: AFSDeleteAgentOptions) {
    super({
      name: "afs_delete",
      description: `Permanently delete files or directories from the Agentic File System (AFS)
- Removes files or directories at the specified AFS path
- Supports recursive deletion for directories with contents
- Use with caution as deletion is permanent

Usage:
- The path must be an absolute AFS path starting with "/" (e.g., "/docs/old-file.md", "/temp")
- This is NOT a local system file path - it operates within the AFS virtual file system
- To delete a directory, you MUST set recursive=true
- Deleting a non-empty directory without recursive=true will fail
- This operation cannot be undone`,
      ...options,
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Absolute AFS path to delete (e.g., '/docs/old-file.md', '/temp'). Must start with '/'",
          ),
        recursive: z
          .boolean()
          .optional()
          .default(false)
          .describe("MUST be set to true to delete directories. Default: false (files only)"),
      }),
      outputSchema: z.object({
        status: z.string(),
        tool: z.string(),
        path: z.string(),
        message: z.string().optional(),
      }),
    });
  }

  async process(input: AFSDeleteInput, _options: AgentInvokeOptions): Promise<AFSDeleteOutput> {
    if (!this.afs) throw new Error("AFS is not configured for this agent.");

    const result = await this.afs.delete(input.path, {
      recursive: input.recursive ?? false,
    });

    return {
      status: "success",
      tool: "afs_delete",
      path: input.path,
      ...result,
    };
  }
}
