import { z } from "zod";
import type { AgentInvokeOptions, AgentOptions, Message } from "../../../agents/agent.js";
import { AFSSkillBase } from "./base.js";

export interface AFSRenameInput extends Message {
  oldPath: string;
  newPath: string;
  overwrite?: boolean;
}

export interface AFSRenameOutput extends Message {
  status: string;
  tool: string;
  oldPath: string;
  newPath: string;
  message?: string;
}

export interface AFSRenameAgentOptions extends AgentOptions<AFSRenameInput, AFSRenameOutput> {
  afs: NonNullable<AgentOptions<AFSRenameInput, AFSRenameOutput>["afs"]>;
}

export class AFSRenameAgent extends AFSSkillBase<AFSRenameInput, AFSRenameOutput> {
  constructor(options: AFSRenameAgentOptions) {
    super({
      name: "afs_rename",
      description: `Rename or move files and directories within the Agentic File System (AFS)
- Renames a file or directory to a new name
- Can also move files/directories to a different location
- Optionally overwrites existing files at the destination

Usage:
- Both paths must be absolute AFS paths starting with "/" (e.g., "/docs/old-name.md" -> "/docs/new-name.md")
- This is NOT a local system file path - it operates within the AFS virtual file system
- To move a file, specify a different directory in newPath (e.g., "/docs/file.md" -> "/archive/file.md")
- If newPath already exists, the operation will fail unless overwrite=true
- Moving directories moves all contents recursively`,
      ...options,
      inputSchema: z.object({
        oldPath: z
          .string()
          .describe("Current absolute AFS path (e.g., '/docs/old-name.md'). Must start with '/'"),
        newPath: z
          .string()
          .describe("New absolute AFS path (e.g., '/docs/new-name.md'). Must start with '/'"),
        overwrite: z
          .boolean()
          .optional()
          .default(false)
          .describe(
            "Set to true to overwrite if destination already exists. Default: false (fails if exists)",
          ),
      }),
      outputSchema: z.object({
        status: z.string(),
        tool: z.string(),
        oldPath: z.string(),
        newPath: z.string(),
        message: z.string().optional(),
      }),
    });
  }

  async process(input: AFSRenameInput, _options: AgentInvokeOptions): Promise<AFSRenameOutput> {
    if (!this.afs) throw new Error("AFS is not configured for this agent.");

    const result = await this.afs.rename(input.oldPath, input.newPath, {
      overwrite: input.overwrite ?? false,
    });

    return {
      status: "success",
      tool: "afs_rename",
      oldPath: input.oldPath,
      newPath: input.newPath,
      ...result,
    };
  }
}
