import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { Agent, type AgentOptions, type Context, FunctionAgent, type Message } from "@aigne/core";
import { z } from "zod";
import { validatePath } from "./utils.js";

/**
 * Options for configuring a FilesystemAgent.
 * @interface FilesystemAgentOptions
 * @extends {AgentOptions}
 */
export interface FilesystemAgentOptions extends AgentOptions {
  /**
   * Root directory for file operations. All file operations will be restricted to this directory.
   */
  rootDir: string;
}

/**
 * An agent that provides filesystem operations with safety constraints.
 * FilesystemAgent allows safely reading, writing, listing, and deleting files
 * within a specified root directory. All paths are validated to prevent
 * operations outside the root directory.
 *
 * @example
 * Here is an example of how to use the FilesystemAgent:
 * {@includeCode ../../test/filesystem/filesystem.test.ts#example-filesystem-simple}
 */
export class FilesystemAgent extends Agent {
  /**
   * Creates a new FilesystemAgent.
   */
  constructor({ rootDir, ...options }: FilesystemAgentOptions) {
    super({
      ...options,
      skills: [
        ...(options.skills ?? []),
        FunctionAgent.from({
          name: "readDir",
          description: "Read a directory and return the list of files",
          inputSchema: z.object({
            path: z.string().describe("Path to the directory, use / for root directory"),
          }),
          outputSchema: z.object({
            path: z.string().describe("Path to the directory"),
            files: z
              .array(z.string().describe("Path to the file"))
              .describe("List all files in the directory recursively"),
          }),
          process: async ({ path }) => {
            const p = join(rootDir, path);
            await validatePath(p, [rootDir]);

            const files = await readdir(p, { recursive: true, withFileTypes: true });
            return {
              path,
              files: files.map((i) => relative(rootDir, join(i.parentPath, i.name))),
              message: `Directory ${path} read successfully with ${files.length} files`,
            };
          },
        }),
        FunctionAgent.from({
          name: "readFile",
          description: "Read a file and return its content",
          inputSchema: z.object({
            path: z.string().describe("Path to the file"),
          }),
          outputSchema: z.object({
            path: z.string().describe("Path to the file"),
            content: z.string().describe("Content of the file"),
            message: z.string().describe("Confirmation message"),
          }),
          process: async ({ path }) => {
            const p = join(rootDir, path);
            await validatePath(p, [rootDir]);

            const content = await readFile(p, "utf-8");
            return { path, content, message: `File ${path} read successfully` };
          },
        }),
        FunctionAgent.from({
          name: "writeFile",
          description: "Write content to a file",
          inputSchema: z.object({
            path: z.string().describe("Path to the file"),
            content: z.string().describe("Content to write to the file"),
          }),
          outputSchema: z.object({
            message: z.string().describe("Confirmation message"),
          }),
          process: async ({ path, content }) => {
            const p = join(rootDir, path);
            await validatePath(p, [rootDir]);

            await writeFile(p, content);
            return { message: `File ${path} written successfully` };
          },
        }),
        FunctionAgent.from({
          name: "rm",
          description: "Delete a file or directory",
          inputSchema: z.object({
            path: z.string().describe("Path to the file"),
            recursive: z.boolean().optional().default(false).describe("Delete recursively"),
          }),
          outputSchema: z.object({
            message: z.string().describe("Confirmation message"),
          }),
          process: async ({ path, recursive }) => {
            const p = join(rootDir, path);
            await validatePath(p, [rootDir]);

            await rm(p, { recursive, force: true });
            return { message: `File ${path} deleted successfully` };
          },
        }),
      ],
    });
  }

  get isCallable(): boolean {
    return false;
  }

  /**
   * Process method required by the Agent interface but not implemented for FilesystemAgent.
   * FilesystemAgent operates through its exposed skills rather than direct processing.
   */
  async process(_input: Message, _context: Context): Promise<Message> {
    throw new Error("Not implemented");
  }
}
