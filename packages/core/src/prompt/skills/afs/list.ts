import type { AFSEntry, AFSListOptions } from "@aigne/afs";
import { z } from "zod";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type Message,
} from "../../../agents/agent.js";

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
  result: string;
}

export interface AFSListAgentOptions extends AgentOptions<AFSListInput, AFSListOutput> {
  afs: NonNullable<AgentOptions<AFSListInput, AFSListOutput>["afs"]>;
}

export class AFSListAgent extends Agent<AFSListInput, AFSListOutput> {
  constructor(options: AFSListAgentOptions) {
    super({
      name: "afs_list",
      description:
        "Get a tree view of directory contents in the AFS - shows hierarchical structure of files and folders",
      ...options,
      inputSchema: z.object({
        path: z.string().describe("The directory path to browse (e.g., '/', '/docs', '/src')"),
        options: z
          .object({
            maxDepth: z.number().optional().describe("Maximum depth to display in the tree view"),
          })
          .optional(),
      }),
      outputSchema: z.object({
        status: z.string(),
        tool: z.string(),
        path: z.string(),
        options: z
          .object({
            maxDepth: z.number().optional(),
          })
          .optional(),
        message: z.string().optional(),
        result: z.string(),
      }),
    });
  }

  async process(input: AFSListInput, _options: AgentInvokeOptions): Promise<AFSListOutput> {
    if (!this.afs) {
      throw new Error("AFS is not configured for this agent.");
    }

    const { list, message } = await this.afs.list(input.path, input.options);
    const result = this.buildTreeView(list);

    return {
      status: "success",
      tool: "afs_list",
      path: input.path,
      options: input.options,
      message,
      result,
    };
  }

  private buildTreeView(entries: AFSEntry[]): string {
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

    const renderTree = (node: Record<string, any>, prefix = "", currentPath = ""): string => {
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
    };

    return renderTree(tree);
  }
}
