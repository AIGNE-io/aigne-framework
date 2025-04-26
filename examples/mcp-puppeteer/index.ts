#!/usr/bin/env bunwrapper

import { runChatLoopInTerminal } from "@aigne/cli/utils/run-chat-loop.js";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { loadModel } from "@aigne/core/loader/index.js";
import { logger } from "@aigne/core/utils/logger.js";

logger.enable(`aigne:mcp,${process.env.DEBUG}`);

const model = await loadModel();

const puppeteer = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
  env: process.env as Record<string, string>,
});

const aigne = new AIGNE({
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

const userAgent = aigne.call(agent);

await runChatLoopInTerminal(userAgent, {
  welcome:
    "Hello! I'm a chatbot that can extract content from a website. Try asking me a question!",
  defaultQuestion: "What is the content of https://www.arcblock.io",
});

process.exit(0);
