import type { AFSEntry, AFSSearchOptions } from "@aigne/afs";
import { z } from "zod";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type Message,
} from "../../../agents/agent.js";

export interface AFSSearchInput extends Message {
  path: string;
  query: string;
  options?: AFSSearchOptions;
}

export interface AFSSearchOutput extends Message {
  status: string;
  tool: string;
  path: string;
  query: string;
  options?: AFSSearchOptions;
  data: AFSEntry[];
  message?: string;
}

export interface AFSSearchAgentOptions extends AgentOptions<AFSSearchInput, AFSSearchOutput> {
  afs: NonNullable<AgentOptions<AFSSearchInput, AFSSearchOutput>["afs"]>;
}

export class AFSSearchAgent extends Agent<AFSSearchInput, AFSSearchOutput> {
  constructor(options: AFSSearchAgentOptions) {
    super({
      name: "afs_search",
      description:
        "Search file contents by keywords. Use when finding files containing specific text or code patterns.",
      ...options,
      inputSchema: z.object({
        path: z.string().describe("Absolute directory path to search in"),
        query: z.string().describe("Search keywords or patterns"),
        options: z
          .object({
            limit: z.number().optional().describe("Max results to return"),
            caseSensitive: z
              .boolean()
              .optional()
              .describe("Case-sensitive search (default: false)"),
          })
          .optional(),
      }),
      outputSchema: z.object({
        status: z.string(),
        tool: z.string(),
        path: z.string(),
        query: z.string(),
        options: z
          .object({
            limit: z.number().optional(),
            caseSensitive: z.boolean().optional(),
          })
          .optional(),
        data: z.array(z.custom<AFSEntry>()),
        message: z.string().optional(),
      }),
    });
  }

  async process(input: AFSSearchInput, _options: AgentInvokeOptions): Promise<AFSSearchOutput> {
    if (!this.afs) throw new Error("AFS is not configured for this agent.");

    const result = await this.afs.search(input.path, input.query, input.options);

    return {
      status: "success",
      tool: "afs_search",
      path: input.path,
      query: input.query,
      options: input.options,
      ...result,
    };
  }
}
