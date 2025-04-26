#!/usr/bin/env bunwrapper

import { join } from "node:path";
import { runChatLoopInTerminal } from "@aigne/cli/utils/run-chat-loop.js";
import { AIAgent, AIGNE, MCPAgent, PromptBuilder } from "@aigne/core";
import { loadModel } from "@aigne/core/loader/index.js";
import { logger } from "@aigne/core/utils/logger.js";

logger.enable(`aigne:mcp,${process.env.DEBUG}`);

const model = await loadModel();

const sqlite = await MCPAgent.from({
  command: "uvx",
  args: [
    "-q",
    "mcp-server-sqlite",
    "--db-path",
    join(process.cwd(), "aigne-example-sqlite-mcp-server.db"),
  ],
});

const prompt = await sqlite.prompts["mcp-demo"]?.call({ topic: "product service" });
if (!prompt) throw new Error("Prompt mcp-demo not found");

const aigne = new AIGNE({
  model,
  tools: [sqlite],
});

const agent = AIAgent.from({
  instructions: PromptBuilder.from(prompt),
  memory: true,
});

const userAgent = aigne.call(agent);

await runChatLoopInTerminal(userAgent, {
  initialCall: {},
});

process.exit(0);
