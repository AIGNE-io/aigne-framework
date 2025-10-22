import type { AFS } from "@aigne/afs";
import { z } from "zod";
import { type Agent, FunctionAgent } from "../../agents/agent.js";

export async function getAFSSkills(afs: AFS): Promise<Agent[]> {
  return [
    FunctionAgent.from({
      name: "afs_list",
      description:
        "Browse directory contents in the AFS like filesystem ls/tree command - shows files and folders in the specified path",
      inputSchema: z.object({
        path: z.string().describe("The directory path to browse (e.g., '/', '/docs', '/src')"),
        options: z
          .object({
            recursive: z.boolean().optional().describe("Whether to list files recursively"),
            maxDepth: z.number().optional().describe("Maximum depth to list files"),
            limit: z.number().optional().describe("Maximum number of entries to return"),
          })
          .optional(),
      }),
      process: async (input) => {
        const result = await afs.list(input.path, input.options);

        return {
          status: "success",
          tool: "afs_list",
          options: input.options,
          ...result,
        };
      },
    }),
    FunctionAgent.from({
      name: "afs_search",
      description:
        "Find files by searching content using keywords - returns matching files with their paths",
      inputSchema: z.object({
        path: z.string().describe("The directory path to search in (e.g., '/', '/docs')"),
        query: z
          .string()
          .describe(
            "Keywords to search for in file contents (e.g., 'function authentication', 'database config')",
          ),
        options: z
          .object({
            limit: z.number().optional().describe("Maximum number of entries to return"),
          })
          .optional(),
      }),
      process: async (input) => {
        const result = await afs.search(input.path, input.query, input.options);

        return {
          status: "success",
          tool: "afs_search",
          query: input.query,
          options: input.options,
          ...result,
        };
      },
    }),
    FunctionAgent.from({
      name: "afs_read",
      description:
        "Read file contents from the AFS - path must be an exact file path from list or search results",
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Exact file path from list or search results (e.g., '/docs/api.md', '/src/utils/helper.js')",
          ),
      }),
      process: async (input) => {
        const result = await afs.read(input.path);

        return {
          status: "success",
          tool: "afs_read",
          path: input.path,
          ...result,
        };
      },
    }),
    FunctionAgent.from({
      name: "afs_write",
      description:
        "Create or update a file in the AFS with new content - overwrites existing files",
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Full file path where to write content (e.g., '/docs/new-file.md', '/src/component.js')",
          ),
        content: z.string().describe("The text content to write to the file"),
      }),
      process: async (input) => {
        const result = await afs.write(input.path, {
          content: input.content,
        });

        return {
          status: "success",
          tool: "afs_write",
          path: input.path,
          ...result,
        };
      },
    }),
  ];
}
