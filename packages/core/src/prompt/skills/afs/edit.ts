import { z } from "zod";
import type { AgentInvokeOptions, AgentOptions, Message } from "../../../agents/agent.js";
import { AFSSkillBase } from "./base.js";

const CONTEXT_LINES = 4; // Number of lines to show before and after the edit

export interface AFSEditInput extends Message {
  path: string;
  oldString: string;
  newString: string;
  replaceAll?: boolean;
}

export interface AFSEditOutput extends Message {
  status: string;
  tool: string;
  path: string;
  message: string;
  snippet: string;
}

export interface AFSEditAgentOptions extends AgentOptions<AFSEditInput, AFSEditOutput> {
  afs: NonNullable<AgentOptions<AFSEditInput, AFSEditOutput>["afs"]>;
}

export class AFSEditAgent extends AFSSkillBase<AFSEditInput, AFSEditOutput> {
  constructor(options: AFSEditAgentOptions) {
    super({
      name: "afs_edit",
      description: `Performs exact string replacements in files within the Agentic File System (AFS).

Usage:
- You must use afs_read at least once before editing to understand the file content
- The path must be an absolute AFS path starting with "/" (e.g., "/docs/readme.md")
- Preserve exact indentation (tabs/spaces) as it appears in the file
- The edit will FAIL if oldString is not found in the file
- The edit will FAIL if oldString appears multiple times (unless replaceAll is true)
- Use replaceAll to replace/rename strings across the entire file`,
      ...options,
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Absolute AFS path to the file to edit (e.g., '/docs/readme.md'). Must start with '/'",
          ),
        oldString: z
          .string()
          .describe(
            "The exact text to replace. Must match file content exactly including whitespace",
          ),
        newString: z
          .string()
          .describe("The text to replace it with (must be different from oldString)"),
        replaceAll: z
          .boolean()
          .optional()
          .default(false)
          .describe("Replace all occurrences of oldString (default: false)"),
      }),
      outputSchema: z.object({
        status: z.string(),
        tool: z.string(),
        path: z.string(),
        message: z.string(),
        snippet: z.string(),
      }),
    });
  }

  async process(input: AFSEditInput, _options: AgentInvokeOptions): Promise<AFSEditOutput> {
    if (!this.afs) throw new Error("AFS is not configured for this agent.");

    const { path, oldString, newString, replaceAll = false } = input;

    if (oldString === newString) {
      throw new Error("oldString and newString must be different");
    }

    const readResult = await this.afs.read(path);
    if (!readResult.data?.content || typeof readResult.data.content !== "string") {
      throw new Error(`Cannot read file content from: ${path}`);
    }

    const originalContent = readResult.data.content;

    // Check if oldString exists in the file
    const occurrences = this.countOccurrences(originalContent, oldString);
    if (occurrences === 0) {
      throw new Error(`oldString not found in file: ${path}`);
    }

    if (occurrences > 1 && !replaceAll) {
      throw new Error(
        `oldString appears ${occurrences} times in file. Use replaceAll=true to replace all occurrences, or provide more context to make oldString unique.`,
      );
    }

    // Find the position of the first occurrence for snippet extraction
    const firstOccurrenceIndex = originalContent.indexOf(oldString);

    // Perform the replacement
    const updatedContent = replaceAll
      ? originalContent.split(oldString).join(newString)
      : originalContent.replace(oldString, newString);

    await this.afs.write(path, {
      content: updatedContent,
    });

    // Generate snippet around the edit location
    const snippet = this.extractSnippet(updatedContent, firstOccurrenceIndex, newString.length);

    const replacementCount = replaceAll ? occurrences : 1;
    return {
      status: "success",
      tool: "afs_edit",
      path,
      message: `Replaced ${replacementCount} occurrence${replacementCount > 1 ? "s" : ""} in ${path}`,
      snippet,
    };
  }

  private countOccurrences(text: string, search: string): number {
    let count = 0;
    let position = text.indexOf(search);
    while (position !== -1) {
      count++;
      position = text.indexOf(search, position + search.length);
    }
    return count;
  }

  private extractSnippet(content: string, editStartIndex: number, newStringLength: number): string {
    const lines = content.split("\n");

    // Find the line number where the edit starts
    let charCount = 0;
    let editStartLine = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineLength = (lines[i]?.length ?? 0) + 1; // +1 for newline
      if (charCount + lineLength > editStartIndex) {
        editStartLine = i;
        break;
      }
      charCount += lineLength;
    }

    // Calculate how many lines the new content spans
    const newContentLines = content
      .substring(editStartIndex, editStartIndex + newStringLength)
      .split("\n").length;
    const editEndLine = editStartLine + newContentLines - 1;

    // Extract lines with context
    const startLine = Math.max(0, editStartLine - CONTEXT_LINES);
    const endLine = Math.min(lines.length - 1, editEndLine + CONTEXT_LINES);

    // Format with line numbers (1-based)
    const snippetLines = lines.slice(startLine, endLine + 1).map((line, idx) => {
      const lineNum = startLine + idx + 1;
      return `${String(lineNum).padStart(4)}| ${line}`;
    });

    return snippetLines.join("\n");
  }
}
