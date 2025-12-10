import type { AFS, AFSEntry } from "@aigne/afs";
import { z } from "zod";
import { type Agent, FunctionAgent } from "../../agents/agent.js";

export async function getAFSSkills(afs: AFS): Promise<Agent[]> {
  return [
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
          tool: "afs_list",
          path: input.path,
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
            caseSensitive: z
              .boolean()
              .optional()
              .describe("Whether the search is case sensitive, default is false"),
          })
          .optional(),
      }),
      process: async (input) => {
        const result = await afs.search(input.path, input.query, input.options);

        return {
          status: "success",
          tool: "afs_search",
          path: input.path,
          query: input.query,
          options: input.options,
          ...result,
        };
      },
    }),
    FunctionAgent.from({
      name: "afs_read",
      description: `\
Read file contents from the AFS - path must be an exact file path from list or search results

Usage:
- Use withLineNumbers=true to get line numbers for code reviews or edits
`,
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Exact file path from list or search results (e.g., '/docs/api.md', '/src/utils/helper.js')",
          ),
        withLineNumbers: z
          .boolean()
          .optional()
          .describe(`Whether to include line numbers in the returned content, default is false`),
      }),
      process: async (input) => {
        const result = await afs.read(input.path);

        let content = result.result?.content;

        if (input.withLineNumbers && typeof content === "string") {
          content = content
            .split("\n")
            .map((line, idx) => `${idx + 1}| ${line}`)
            .join("\n");
        }

        return {
          status: "success",
          tool: "afs_read",
          path: input.path,
          withLineNumbers: input.withLineNumbers,
          ...result,
          result: {
            ...result.result,
            content,
          },
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

function buildTreeView(entries: AFSEntry[]): string {
  const tree: Record<string, any> = {};
  const entryMap = new Map<string, AFSEntry>();

  for (const entry of entries) {
    entryMap.set(entry.path, entry);
    const parts = entry.path.split("/").filter(Boolean);
    let current = tree;

    for (const part of parts) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  }

  function renderTree(node: Record<string, any>, prefix = "", currentPath = ""): string {
    let result = "";
    const keys = Object.keys(node);
    keys.forEach((key, index) => {
      const isLast = index === keys.length - 1;
      const fullPath = currentPath ? `${currentPath}/${key}` : `/${key}`;
      const entry = entryMap.get(fullPath);

      // Build metadata suffix
      const metadataParts: string[] = [];

      // Children count
      const childrenCount = entry?.metadata?.childrenCount;
      if (childrenCount !== undefined && childrenCount > 0) {
        metadataParts.push(`${childrenCount} items`);
      }

      // Executable
      if (entry?.metadata?.execute) {
        metadataParts.push("executable");
      }

      const metadataSuffix = metadataParts.length > 0 ? ` [${metadataParts.join(", ")}]` : "";

      result += `${prefix}${isLast ? "└── " : "├── "}${key}${metadataSuffix}`;
      result += `\n`;
      result += renderTree(node[key], `${prefix}${isLast ? "    " : "│   "}`, fullPath);
    });
    return result;
  }

  return renderTree(tree);
}
