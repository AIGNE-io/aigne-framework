import type { AFS } from "@aigne/afs";
import { z } from "zod";
import { type Agent, FunctionAgent } from "../agents/agent.js";

export async function getAFSSkills(afs: AFS): Promise<Agent[]> {
  return [
    FunctionAgent.from({
      name: "listModules",
      description: "List all mounted AFS modules",
      process: async () => {
        const modules = await afs.listModules();
        return { modules };
      },
    }),
    FunctionAgent.from({
      name: "list",
      description: "List files in the AFS (AIGNE File System)",
      inputSchema: z.object({
        path: z.string().describe("The path to list files from"),
        options: z
          .object({
            recursive: z.boolean().optional().describe("Whether to list files recursively"),
            maxDepth: z.number().optional().describe("Maximum depth to list files"),
            limit: z.number().optional().describe("Maximum number of entries to return"),
          })
          .optional(),
      }),
      process: async (input) => {
        return afs.list(input.path, input.options);
      },
    }),
    FunctionAgent.from({
      name: "search",
      description: "Search files in the AFS (AIGNE File System)",
      inputSchema: z.object({
        path: z.string().describe("The path to search files in"),
        query: z.string().describe("The search query"),
        options: z
          .object({
            limit: z.number().optional().describe("Maximum number of entries to return"),
          })
          .optional(),
      }),
      process: async (input) => {
        return afs.search(input.path, input.query, input.options);
      },
    }),
    FunctionAgent.from({
      name: "read",
      description: "Read a file from the AFS (AIGNE File System)",
      inputSchema: z.object({
        path: z.string().describe("The path to the file to read"),
      }),
      process: async (input) => {
        const file = await afs.read(input.path);
        return {
          file,
        };
      },
    }),
    FunctionAgent.from({
      name: "write",
      description: "Write a file to the AFS (AIGNE File System)",
      inputSchema: z.object({
        path: z.string().describe("The path to the file to write"),
        content: z.string().describe("The content to write to the file"),
      }),
      process: async (input) => {
        const file = await afs.write(input.path, {
          content: input.content,
        });

        return { file };
      },
    }),
  ];
}
