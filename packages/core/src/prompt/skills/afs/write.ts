import { z } from "zod";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type Message,
} from "../../../agents/agent.js";

export interface AFSWriteInput extends Message {
  path: string;
  content: string;
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

export class AFSWriteAgent extends Agent<AFSWriteInput, AFSWriteOutput> {
  constructor(options: AFSWriteAgentOptions) {
    super({
      name: "afs_write",
      description:
        "Create or update a file in the AFS with new content - overwrites existing files",
      ...options,
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Full file path where to write content (e.g., '/docs/new-file.md', '/src/component.js')",
          ),
        content: z.string().describe("The text content to write to the file"),
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
    if (!this.afs) {
      throw new Error("AFS is not configured for this agent.");
    }

    const result = await this.afs.write(input.path, {
      content: input.content,
    });

    return {
      status: "success",
      tool: "afs_write",
      path: input.path,
      ...result,
    };
  }
}
