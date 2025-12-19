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
      description:
        "Create new file or append content to existing file. Use when creating files, rewriting entire files, or appending to files.",
      ...options,
      inputSchema: z.object({
        path: z.string().describe("Absolute file path to write"),
        content: z.string().describe("Complete file content or content to append"),
        append: z
          .boolean()
          .optional()
          .default(false)
          .describe("Append mode: add content to end of file (default: false, overwrites file)"),
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
