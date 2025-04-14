#!/usr/bin/env npx -y bun

import { join } from "node:path";
import { runChatLoopInTerminal } from "@aigne/cli/utils/run-chat-loop.js";
import { AIAgent, ExecutionEngine, MCPAgent, PromptBuilder } from "@aigne/core";
import { createAdaptiveModel } from "@aigne/core/utils/create-adaptive-model.js";
import { logger } from "@aigne/core/utils/logger.js";

logger.enable(`aigne:mcp,${process.env.DEBUG}`);

const model = createAdaptiveModel();

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

const engine = new ExecutionEngine({
  model,
  tools: [sqlite],
});

const agent = AIAgent.from({
  instructions: PromptBuilder.from(prompt),
  memory: true,
});

const userAgent = engine.call(agent);

await runChatLoopInTerminal(userAgent, {
  initialCall: {},
});

process.exit(0);
