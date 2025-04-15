#!/usr/bin/env npx -y bun

import assert from "node:assert";
import { runChatLoopInTerminal } from "@aigne/cli/utils/run-chat-loop.js";
import { AIAgent, ExecutionEngine, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { logger } from "@aigne/core/utils/logger.js";

const { OPENAI_API_KEY } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");

logger.enable(`aigne:mcp,${process.env.DEBUG}`);

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const puppeteer = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
});

const engine = new ExecutionEngine({
  model,
  tools: [puppeteer],
});

const agent = AIAgent.from({
  name: "example_puppeteer",
  instructions: `\
## Steps to extract content from a website
1. navigate to the url
2. evaluate document.body.innerText to get the content
`,
  memory: true,
});

const userAgent = engine.call(agent);

await runChatLoopInTerminal(userAgent, {
  welcome:
    "Hello! I'm a chatbot that can extract content from a website. Try asking me a question!",
  defaultQuestion: "What is the content of https://www.arcblock.io",
});

process.exit(0);
