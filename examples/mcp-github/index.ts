#!/usr/bin/env bunwrapper

import assert from "node:assert";
import { DefaultMemory } from "@aigne/agent-library/default-memory/index.js";
import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, MCPAgent } from "@aigne/core";

const { GITHUB_TOKEN } = process.env;

assert(GITHUB_TOKEN, "Please set the GITHUB_TOKEN environment variable");

await runWithAIGNE(
  async () => {
    const github = await MCPAgent.from({
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {
        GITHUB_TOKEN,
      },
    });

    const agent = AIAgent.from({
      instructions: `\
  ## GitHub Interaction Assistant
  You are an assistant that helps users interact with GitHub repositories.
  You can perform various GitHub operations like:
  1. Searching repositories
  2. Getting file contents
  3. Creating or updating files
  4. Creating issues and pull requests
  5. And many more GitHub operations

  Always provide clear, concise responses with relevant information from GitHub.
  `,
      skills: [github],
      memory: new DefaultMemory(),
      inputKey: "message",
    });

    return agent;
  },
  {
    chatLoopOptions: {
      welcome:
        "Hello! I'm a chatbot that can help you interact with GitHub. Try asking me a question about GitHub repositories!",
      defaultQuestion: "Search for repositories related to 'aigne-framework'",
    },
  },
);

process.exit(0);
