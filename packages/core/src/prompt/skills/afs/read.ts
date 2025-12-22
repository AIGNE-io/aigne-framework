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
      description:
        "Read complete file contents. Use when you need to review, analyze, or understand file content before making changes.",
      ...options,
      inputSchema: z.object({
        path: z.string().describe("Absolute file path to read"),
        withLineNumbers: z
          .boolean()
          .optional()
          .describe("Include line numbers in output (required when planning to edit the file)"),
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
