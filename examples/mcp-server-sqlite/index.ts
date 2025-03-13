#!/usr/bin/env npx -y bun

import assert from "node:assert";
import { join } from "node:path";
import {
  AIAgent,
  ChatModelOpenAI,
  ExecutionEngine,
  MCPAgent,
  PromptBuilder,
  logger,
  runChatLoopInTerminal,
} from "@aigne/core-next";

const { OPENAI_API_KEY } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");

logger.enable(`aigne:mcp,${process.env.DEBUG}`);

const model = new ChatModelOpenAI({
  apiKey: OPENAI_API_KEY,
});

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
  enableHistory: true,
  instructions: PromptBuilder.from(prompt),
});

const userAgent = await engine.run(agent);

await runChatLoopInTerminal(userAgent, {
  initialCall: {},
  onResponse: (response) => console.log(response.text),
});

process.exit(0);
