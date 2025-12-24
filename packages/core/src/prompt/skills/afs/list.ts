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
      description: `List contents within the Agentic File System (AFS)
- Returns files and directories at the specified AFS path
- Supports recursive listing with configurable depth
- Supports glob pattern filtering to match specific files
- By default respects .gitignore rules to filter out ignored files
- Use this tool when you need to explore AFS contents or understand file organization

Usage:
- The path must be an absolute AFS path starting with "/" (e.g., "/", "/docs", "/memory/user")
- This is NOT a local system file path - it operates within the AFS virtual file system
- Use maxDepth to control recursion depth (default: 1, current directory only)
- Use pattern to filter entries by glob pattern:
  - "*.ts" - match TypeScript files in current directory
  - "**/*.js" - match all JavaScript files recursively
  - "src/**/*.{ts,tsx}" - match TypeScript files in src directory
- Results are filtered by .gitignore by default; set disableGitignore to include ignored files`,
      ...options,
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Absolute AFS path to list (e.g., '/', '/docs', '/memory/user'). Must start with '/'",
          ),
        options: z
          .object({
            maxDepth: z
              .number()
              .optional()
              .describe(
                "Maximum depth of directory recursion. 1 = current directory only, 2 = include subdirectories, etc. Default: 1",
              ),
            disableGitignore: z
              .boolean()
              .optional()
              .describe(
                "Set to true to include files normally ignored by .gitignore rules. Default: false (respects .gitignore)",
              ),
            maxChildren: z
              .number()
              .optional()
              .describe(
                "Maximum number of entries to return per directory. Useful for large directories to avoid overwhelming output",
              ),
            pattern: z.string().optional().describe("Glob pattern to filter entries by path"),
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
