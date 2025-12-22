import type { AFSListOptions } from "@aigne/afs";
import { z } from "zod";
import type { AgentInvokeOptions, AgentOptions, Message } from "../../../agents/agent.js";
import { AFSSkillBase } from "./base.js";

export interface AFSListInput extends Message {
  path: string;
  options?: AFSListOptions;
}

export interface AFSListOutput extends Message {
  status: string;
  tool: string;
  path: string;
  options?: AFSListOptions;
  message?: string;
  data?: unknown;
}

export interface AFSListAgentOptions extends AgentOptions<AFSListInput, AFSListOutput> {
  afs: NonNullable<AgentOptions<AFSListInput, AFSListOutput>["afs"]>;
}

export class AFSListAgent extends AFSSkillBase<AFSListInput, AFSListOutput> {
  constructor(options: AFSListAgentOptions) {
    super({
      name: "afs_list",
      description:
        "Browse directory structure as a tree view. Use when exploring directory contents or understanding file organization.",
      ...options,
      inputSchema: z.object({
        path: z.string().describe("Absolute directory path to browse"),
        options: z
          .object({
            maxDepth: z.number().optional().describe("Tree depth limit (default: 1)"),
            disableGitignore: z
              .boolean()
              .optional()
              .describe("Disable .gitignore filtering, default is enabled"),
            maxChildren: z
              .number()
              .optional()
              .describe("Maximum number of children to list per directory"),
            format: z
              .union([z.literal("simple-list"), z.literal("tree")])
              .optional()
              .default("simple-list")
              .describe("Output format, either 'simple-list', or 'tree', default is 'simple-list'"),
          })
          .optional(),
      }),
      outputSchema: z.object({
        status: z.string(),
        tool: z.string(),
        path: z.string(),
        options: z.record(z.any()).optional(),
        message: z.string().optional(),
        data: z.unknown(),
      }),
    });
  }

  async process(input: AFSListInput, _options: AgentInvokeOptions): Promise<AFSListOutput> {
    if (!this.afs) throw new Error("AFS is not configured for this agent.");

    const { data, message } = await this.afs.list(input.path, input.options);

    return {
      status: "success",
      tool: "afs_list",
      path: input.path,
      options: input.options,
      message,
      data,
    };
  }
}
