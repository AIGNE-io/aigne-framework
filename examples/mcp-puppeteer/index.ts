#!/usr/bin/env bunwrapper

import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, MCPAgent } from "@aigne/core";
import { DefaultMemory } from "@aigne/default-memory";

await runWithAIGNE(
  async () => {
    const puppeteer = await MCPAgent.from({
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-puppeteer"],
      env: process.env as Record<string, string>,
    });

    const agent = AIAgent.from({
      name: "example_puppeteer",
      instructions: `\
  ## Steps to extract content from a website
  1. navigate to the url
  2. evaluate document.body.innerText to get the content
  `,
      skills: [puppeteer],
      memory: new DefaultMemory(),
      inputKey: "message",
    });

    return agent;
  },
  {
    chatLoopOptions: {
      welcome:
        "Hello! I'm a chatbot that can extract content from a website. Try asking me a question!",
      defaultQuestion: "What is the content of https://www.arcblock.io",
    },
  },
);

process.exit(0);
