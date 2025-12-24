import type { AFSEntry } from "@aigne/afs";
import { z } from "zod";
import type { AgentInvokeOptions, AgentOptions, Message } from "../../../agents/agent.js";
import { AFSSkillBase } from "./base.js";

const DEFAULT_LINE_LIMIT = 2000;
const MAX_LINE_LENGTH = 2000;

export interface AFSReadInput extends Message {
  path: string;
  offset?: number;
  limit?: number;
}

export interface AFSReadOutput extends Message {
  status: string;
  tool: string;
  path: string;
  data?: AFSEntry;
  message?: string;
  totalLines?: number;
  returnedLines?: number;
  truncated?: boolean;
  offset?: number;
}

export interface AFSReadAgentOptions extends AgentOptions<AFSReadInput, AFSReadOutput> {
  afs: NonNullable<AgentOptions<AFSReadInput, AFSReadOutput>["afs"]>;
}

export class AFSReadAgent extends AFSSkillBase<AFSReadInput, AFSReadOutput> {
  constructor(options: AFSReadAgentOptions) {
    super({
      name: "afs_read",
      description: `Read file contents from the Agentic File System (AFS)
- Returns the content of a file at the specified AFS path
- By default reads up to ${DEFAULT_LINE_LIMIT} lines, use offset/limit for large files
- Lines longer than ${MAX_LINE_LENGTH} characters will be truncated

Usage:
- The path must be an absolute AFS path starting with "/" (e.g., "/docs/readme.md")
- Use offset to start reading from a specific line (0-based)
- Use limit to control number of lines returned (default: ${DEFAULT_LINE_LIMIT})
- Check truncated field to know if file was partially returned`,
      ...options,
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Absolute AFS path to the file to read (e.g., '/docs/readme.md'). Must start with '/'",
          ),
        offset: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe("Line number to start reading from (0-based, default: 0)"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(DEFAULT_LINE_LIMIT)
          .optional()
          .describe(`Maximum number of lines to read (default: ${DEFAULT_LINE_LIMIT})`),
      }),
      outputSchema: z.object({
        status: z.string(),
        tool: z.string(),
        path: z.string(),
        data: z.custom<AFSEntry>().optional(),
        message: z.string().optional(),
        totalLines: z.number().optional(),
        returnedLines: z.number().optional(),
        truncated: z.boolean().optional(),
        offset: z.number().optional(),
      }),
    });
  }

  async process(input: AFSReadInput, _options: AgentInvokeOptions): Promise<AFSReadOutput> {
    if (!this.afs) throw new Error("AFS is not configured for this agent.");

    const result = await this.afs.read(input.path);

    if (!result.data?.content || typeof result.data.content !== "string") {
      return {
        status: "success",
        tool: "afs_read",
        path: input.path,
        ...result,
      };
    }

    const offset = input.offset ?? 0;
    const limit = input.limit ?? DEFAULT_LINE_LIMIT;

    const allLines = result.data.content.split("\n");
    const totalLines = allLines.length;

    // Apply offset and limit
    const selectedLines = allLines.slice(offset, offset + limit);

    // Truncate long lines
    const processedLines = selectedLines.map((line) =>
      line.length > MAX_LINE_LENGTH ? `${line.substring(0, MAX_LINE_LENGTH)}... [truncated]` : line,
    );

    const returnedLines = processedLines.length;
    const truncated = offset > 0 || offset + limit < totalLines;

    const processedContent = processedLines.join("\n");

    let message: string | undefined;
    if (truncated) {
      const startLine = offset + 1;
      const endLine = offset + returnedLines;
      message = `Showing lines ${startLine}-${endLine} of ${totalLines}. Use offset/limit to read more.`;
    }

    return {
      status: "success",
      tool: "afs_read",
      path: input.path,
      totalLines,
      returnedLines,
      truncated,
      offset,
      message,
      ...result,
      data: {
        ...result.data,
        content: processedContent,
      },
    };
  }
}
