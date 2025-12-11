import { z } from "zod";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type Message,
} from "../../../agents/agent.js";

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

export class AFSRenameAgent extends Agent<AFSRenameInput, AFSRenameOutput> {
  constructor(options: AFSRenameAgentOptions) {
    super({
      name: "afs_rename",
      description:
        "Rename or move files and directories. Use when reorganizing files, changing names, or moving to different locations.",
      ...options,
      inputSchema: z.object({
        oldPath: z.string().describe("Absolute current file or directory path"),
        newPath: z.string().describe("Absolute new file or directory path"),
        overwrite: z
          .boolean()
          .optional()
          .default(false)
          .describe("Overwrite if destination exists (default: false)"),
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
