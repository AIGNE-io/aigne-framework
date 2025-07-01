#!/usr/bin/env bunwrapper

import { join } from "node:path";
import { DefaultMemory } from "@aigne/agent-library/default-memory/index.js";
import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, MCPAgent, PromptBuilder } from "@aigne/core";

await runWithAIGNE(
  async () => {
    const sqlite = await MCPAgent.from({
      command: "uvx",
      args: [
        "-q",
        "mcp-server-sqlite",
        "--db-path",
        join(process.cwd(), "aigne-example-sqlite-mcp-server.db"),
      ],
    });

    const prompt = await sqlite.prompts["mcp-demo"]?.invoke({ topic: "product service" });
    if (!prompt) throw new Error("Prompt mcp-demo not found");

    const agent = AIAgent.from({
      name: "example_sqlite",
      instructions: PromptBuilder.from(prompt),
      skills: [sqlite],
      memory: new DefaultMemory(),
      inputKey: "message",
    });

    return agent;
  },
  {
    chatLoopOptions: {
      initialCall: {},
    },
  },
);

process.exit(0);
