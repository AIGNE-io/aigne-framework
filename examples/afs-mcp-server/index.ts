#!/usr/bin/env npx -y bun

import { AFS } from "@aigne/afs";
import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, MCPAgent } from "@aigne/core";

const afs = new AFS().mount(
  "/github-mcp-server",
  await MCPAgent.from({
    command: "docker",
    args: [
      "run",
      "-i",
      "--rm",
      "-e",
      `GITHUB_PERSONAL_ACCESS_TOKEN=${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
      "ghcr.io/github/github-mcp-server",
    ],
  }),
);

const agent = AIAgent.from({
  instructions:
    "You are a friendly chatbot that can help users interact with a github repository via github-mcp-server mounted on AFS. Use the provided 'github-mcp-server' module to answer user questions about the repository. If you don't know the answer, just say you don't know. Do not try to make up an answer.",
  inputKey: "message",
  afs,
  afsConfig: {
    injectHistory: true,
  },
});

await runWithAIGNE(agent, {
  chatLoopOptions: {
    welcome:
      "Hello! I'm a chatbot that can help you interact with github by github-mcp-server. Ask me anything about the github repository!",
  },
});
