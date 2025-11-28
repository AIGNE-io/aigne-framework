import type { AFS } from "@aigne/afs";
import { z } from "zod";
import { type Agent, FunctionAgent } from "../../agents/agent.js";

export async function getAFSSkills(afs: AFS): Promise<Agent[]> {
  return [
    // FunctionAgent.from({
    //   name: "afs_list",
    //   description:
    //     "Browse directory contents in the AFS like filesystem ls/tree command - shows files and folders in the specified path",
    //   inputSchema: z.object({
    //     path: z.string().describe("The directory path to browse (e.g., '/', '/docs', '/src')"),
    //     options: z
    //       .object({
    //         recursive: z.boolean().optional().describe("Whether to list files recursively"),
    //         maxDepth: z.number().optional().describe("Maximum depth to list files"),
    //         limit: z.number().optional().describe("Maximum number of entries to return"),
    //       })
    //       .optional(),
    //   }),
    //   process: async (input) => {
    //     const result = await afs.list(input.path, input.options);

    //     return {
    //       status: "success",
    //       tool: "afs_list",
    //       options: input.options,
    //       ...result,
    //     };
    //   },
    // }),
    FunctionAgent.from({
      name: "afs_list",
      description:
        "Get a tree view of directory contents in the AFS - shows hierarchical structure of files and folders",
      inputSchema: z.object({
        path: z.string().describe("The directory path to browse (e.g., '/', '/docs', '/src')"),
        options: z
          .object({
            maxDepth: z.number().optional().describe("Maximum depth to display in the tree view"),
          })
          .optional(),
      }),
      process: async (input) => {
        const { list, message } = await afs.list(input.path, input.options);

        const result = buildTreeView(list);

        return {
          status: "success",
          tool: "afs_tree",
          options: input.options,
          message,
          result,
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
    FunctionAgent.from({
      name: "afs_exec",
      description: "Execute a function or command available in the AFS modules",
      inputSchema: z.object({
        path: z.string().describe("The exact path to the executable entry in AFS"),
        args: z
          .string()
          .describe(
            "JSON stringified arguments to pass to the executable, must be an object matching the input schema of the executable",
          ),
      }),
      process: async ({ path, args }, options) => {
        return await afs.exec(path, JSON.parse(args), options);
      },
    }),
  ];
}

function buildTreeView(entries: { path: string }[]): string {
  const tree: Record<string, any> = {};

  for (const entry of entries) {
    const parts = entry.path.split("/").filter(Boolean);
    let current = tree;

    for (const part of parts) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  }

  function renderTree(node: Record<string, any>, prefix = ""): string {
    let result = "";
    const keys = Object.keys(node);
    keys.forEach((key, index) => {
      const isLast = index === keys.length - 1;
      result += `${prefix}${isLast ? "└── " : "├── "}${key}\n`;
      result += renderTree(node[key], `${prefix}${isLast ? "    " : "│   "}`);
    });
    return result;
  }

  return renderTree(tree);
}
