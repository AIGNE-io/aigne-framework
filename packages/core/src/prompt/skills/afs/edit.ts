import { z } from "zod";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type Message,
} from "../../../agents/agent.js";

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
  content: string;
}

export interface AFSEditAgentOptions extends AgentOptions<AFSEditInput, AFSEditOutput> {
  afs: NonNullable<AgentOptions<AFSEditInput, AFSEditOutput>["afs"]>;
}

export class AFSEditAgent extends Agent<AFSEditInput, AFSEditOutput> {
  constructor(options: AFSEditAgentOptions) {
    super({
      name: "afs_edit",
      description:
        "Edit an existing file in the AFS by applying a series of custom patches to its content - preserves unchanged parts",
      ...options,
      inputSchema: z.object({
        path: z
          .string()
          .describe("The file path to the target file to be edited (e.g., '/docs/api.md')"),
        patches: z
          .array(
            z.object({
              start_line: z
                .number()
                .int()
                .describe(
                  "The starting line number (0-based) in the original target file where the patch should be applied",
                ),
              end_line: z
                .number()
                .int()
                .describe(
                  "The ending line number (0-based, exclusive) in the original target file. The range is [start_line, end_line). To insert at line N without deleting, use start_line=N, end_line=N.",
                ),
              replace: z
                .string()
                .optional()
                .describe(
                  "The new content that will replace the lines from start_line to end_line in the original target file",
                ),
              delete: z
                .boolean()
                .describe(
                  "Indicates whether the specified lines should be deleted (true) or replaced (false)",
                ),
            }),
          )
          .min(1)
          .describe(
            "A list of patches to update the target file, each patch specifies a line range and replacement content",
          ),
      }),
      outputSchema: z.object({
        status: z.string(),
        tool: z.string(),
        path: z.string(),
        message: z.string(),
        content: z.string(),
      }),
    });
  }

  async process(input: AFSEditInput, _options: AgentInvokeOptions): Promise<AFSEditOutput> {
    if (!input.patches?.length) {
      throw new Error("No patches provided for afs_edit.");
    }

    if (!this.afs) {
      throw new Error("AFS is not configured for this agent.");
    }

    const readResult = await this.afs.read(input.path);
    if (!readResult.result?.content || typeof readResult.result.content !== "string") {
      throw new Error(`Cannot read file content from: ${input.path}`);
    }

    const originalContent = readResult.result.content;
    const updatedContent = this.applyCustomPatches(originalContent, input.patches);

    await this.afs.write(input.path, {
      content: updatedContent,
    });

    return {
      status: "success",
      tool: "afs_edit",
      path: input.path,
      message: `Applied ${input.patches.length} patches to ${input.path}`,
      content: updatedContent,
    };
  }

  applyCustomPatches(text: string, patches: Patch[]): string {
    // 按 start_line 升序是链式 patch 通用方式
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

      // 更新后续 patch 行号偏移
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
