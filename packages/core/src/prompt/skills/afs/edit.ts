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
        "Apply precise line-based patches to modify file content. Use when making targeted changes without rewriting the entire file.",
      ...options,
      inputSchema: z.object({
        path: z.string().describe("Absolute file path to edit"),
        patches: z
          .array(
            z.object({
              start_line: z.number().int().describe("Start line number (0-based, inclusive)"),
              end_line: z.number().int().describe("End line number (0-based, exclusive)"),
              replace: z.string().optional().describe("New content to replace the line range"),
              delete: z.boolean().describe("Delete mode: true to delete lines, false to replace"),
            }),
          )
          .min(1)
          .describe("List of patches to apply sequentially"),
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
