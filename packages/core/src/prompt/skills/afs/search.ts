import type { AFSEntry, AFSSearchOptions } from "@aigne/afs";
import { z } from "zod";
import type { AgentInvokeOptions, AgentOptions, Message } from "../../../agents/agent.js";
import { AFSSkillBase } from "./base.js";

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

export class AFSSearchAgent extends AFSSkillBase<AFSSearchInput, AFSSearchOutput> {
  constructor(options: AFSSearchAgentOptions) {
    super({
      name: "afs_search",
      description: `Search file contents within the Agentic File System (AFS)
- Searches for files containing specific text, keywords, or patterns
- Returns matching entries with their content and metadata
- Supports case-sensitive and case-insensitive search modes
- Use this tool when you need to find files by their content

Usage:
- The path must be an absolute AFS path starting with "/" (e.g., "/", "/docs", "/memory")
- This is NOT a local system file path - it operates within the AFS virtual file system
- The query can be keywords, phrases, or text patterns to search for
- Use limit to control the number of results returned
- Search is case-insensitive by default; set caseSensitive to true for exact case matching`,
      ...options,
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Absolute AFS path to search in (e.g., '/', '/docs', '/memory'). Must start with '/'",
          ),
        query: z.string().describe("Text, keywords, or patterns to search for in file contents"),
        options: z
          .object({
            limit: z
              .number()
              .optional()
              .describe("Maximum number of results to return. Useful for limiting output size"),
            caseSensitive: z
              .boolean()
              .optional()
              .describe(
                "Set to true for case-sensitive matching. Default: false (case-insensitive)",
              ),
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
