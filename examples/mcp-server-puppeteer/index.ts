#!/usr/bin/env npx -y bun

import assert from "node:assert";
import {
  AIAgent,
  ExecutionEngine,
  MCPAgent,
  OpenAIChatModel,
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

const puppeteer = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
});

const engine = new ExecutionEngine({
  model,
  tools: [puppeteer],
});

const agent = AIAgent.from({
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
  onResponse: (response) => console.log(getMessage(response)),
});

process.exit(0);
