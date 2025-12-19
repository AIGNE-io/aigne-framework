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
      description:
        "Permanently delete files or directories. Use when removing unwanted files or cleaning up temporary data.",
      ...options,
      inputSchema: z.object({
        path: z.string().describe("Absolute file or directory path to delete"),
        recursive: z
          .boolean()
          .optional()
          .default(false)
          .describe("Allow directory deletion (default: false, required for directories)"),
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
