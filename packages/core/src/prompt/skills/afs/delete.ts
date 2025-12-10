import { z } from "zod";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type Message,
} from "../../../agents/agent.js";

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

export class AFSDeleteAgent extends Agent<AFSDeleteInput, AFSDeleteOutput> {
  constructor(options: AFSDeleteAgentOptions) {
    super({
      name: "afs_delete",
      description:
        "Delete a file or directory from the AFS - use with caution as this is irreversible",
      ...options,
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "The file or directory path to delete (e.g., '/docs/old-file.md', '/temp/backup')",
          ),
        recursive: z
          .boolean()
          .optional()
          .default(false)
          .describe(
            "Whether to recursively delete directories. Default is false. Must be true to delete directories.",
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

  async process(input: AFSDeleteInput, _options: AgentInvokeOptions): Promise<AFSDeleteOutput> {
    if (!this.afs) {
      throw new Error("AFS is not configured for this agent.");
    }

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
