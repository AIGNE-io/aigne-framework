import { z } from "zod";
import type { AgentInvokeOptions, AgentOptions, Message } from "../../../agents/agent.js";
import { AFSSkillBase } from "./base.js";

export interface Patch {
  start_line: number;
  end_line: number;
  replace?: string;
  delete: boolean;
}

export interface AFSEditInput extends Message {
  path: string;
  patches: Patch[];
}

export interface AFSEditOutput extends Message {
  status: string;
  tool: string;
  path: string;
  message: string;
  data: string;
}

export interface AFSEditAgentOptions extends AgentOptions<AFSEditInput, AFSEditOutput> {
  afs: NonNullable<AgentOptions<AFSEditInput, AFSEditOutput>["afs"]>;
}

export class AFSEditAgent extends AFSSkillBase<AFSEditInput, AFSEditOutput> {
  constructor(options: AFSEditAgentOptions) {
    super({
      name: "afs_edit",
      description: `Apply precise line-based patches to modify files in the Agentic File System (AFS)
- Performs targeted edits using line numbers without rewriting the entire file
- Supports both replacing and deleting line ranges
- Multiple patches can be applied in a single operation

Usage:
- The path must be an absolute AFS path starting with "/" (e.g., "/docs/readme.md")
- This is NOT a local system file path - it operates within the AFS virtual file system
- IMPORTANT: You MUST use afs_read with withLineNumbers=true before editing to get accurate line numbers
- Line numbers are 0-based: first line is 0, second line is 1, etc.
- The range [start_line, end_line) is exclusive on end_line`,
      ...options,
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Absolute AFS path to the file to edit (e.g., '/docs/readme.md'). Must start with '/'",
          ),
        patches: z
          .array(
            z.object({
              start_line: z
                .number()
                .int()
                .describe("Start line number (0-based, inclusive). First line is 0"),
              end_line: z
                .number()
                .int()
                .describe(
                  "End line number (0-based, exclusive). To edit line 5 only, use start_line=5, end_line=6",
                ),
              replace: z
                .string()
                .optional()
                .describe("New content to insert. Omit when delete=true"),
              delete: z
                .boolean()
                .describe(
                  "Set to true to delete the line range. Set to false to replace with 'replace' content",
                ),
            }),
          )
          .min(1)
          .describe(
            "Array of patches to apply. Each patch specifies a line range and the operation (delete or replace)",
          ),
      }),
      outputSchema: z.object({
        status: z.string(),
        tool: z.string(),
        path: z.string(),
        message: z.string(),
        data: z.string(),
      }),
    });
  }

  async process(input: AFSEditInput, _options: AgentInvokeOptions): Promise<AFSEditOutput> {
    if (!this.afs) throw new Error("AFS is not configured for this agent.");

    if (!input.patches?.length) {
      throw new Error("No patches provided for afs_edit.");
    }

    const readResult = await this.afs.read(input.path);
    if (!readResult.data?.content || typeof readResult.data.content !== "string") {
      throw new Error(`Cannot read file content from: ${input.path}`);
    }

    const originalContent = readResult.data.content;
    const updatedContent = this.applyCustomPatches(originalContent, input.patches);

    await this.afs.write(input.path, {
      content: updatedContent,
    });

    return {
      status: "success",
      tool: "afs_edit",
      path: input.path,
      message: `Applied ${input.patches.length} patches to ${input.path}`,
      data: updatedContent,
    };
  }

  applyCustomPatches(text: string, patches: Patch[]): string {
    // Sort by start_line to ensure sequential application
    const sorted = [...patches].sort((a, b) => a.start_line - b.start_line);
    const lines = text.split("\n");

    for (let i = 0; i < sorted.length; i++) {
      const patch = sorted[i];
      if (!patch) continue;

      const start = patch.start_line;
      const end = patch.end_line;
      const deleteCount = end - start; // [start, end) range

      let delta = 0;

      if (patch.delete) {
        // Delete mode: remove the specified lines [start, end)
        lines.splice(start, deleteCount);
        delta = -deleteCount;
      } else {
        // Replace mode: replace the specified lines with new content
        const replaceLines = patch.replace ? patch.replace.split("\n") : [];
        lines.splice(start, deleteCount, ...replaceLines);
        delta = replaceLines.length - deleteCount;
      }

      // Update subsequent patches' line numbers
      // For exclusive-end semantics [start, end), we adjust patches that start >= current patch's start_line
      // after the current patch has been applied
      if (delta !== 0) {
        for (let j = i + 1; j < sorted.length; j++) {
          const next = sorted[j];
          if (!next) continue;

          // Adjust patches that start at or after the current patch's end line
          if (next.start_line >= patch.end_line) {
            next.start_line += delta;
            next.end_line += delta;
          }
        }
      }
    }

    return lines.join("\n");
  }
}
