#!/usr/bin/env npx -y bun

import assert from "node:assert";
import { join } from "node:path";
import {
  AIAgent,
  ExecutionEngine,
  MCPAgent,
  OpenAIChatModel,
  PromptBuilder,
  getMessage,
  logger,
  runChatLoopInTerminal,
} from "@aigne/core-next";

const { OPENAI_API_KEY } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");

logger.enable(`aigne:mcp,${process.env.DEBUG}`);

const model = new OpenAIChatModel({
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
  instructions: PromptBuilder.from(prompt),
  memory: true,
});

const userAgent = engine.call(agent);

await runChatLoopInTerminal(userAgent, {
  initialCall: {},
  onResponse: (response) => console.log(getMessage(response)),
});

process.exit(0);
