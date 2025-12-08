#!/usr/bin/env bunwrapper

import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, MCPAgent } from "@aigne/core";

const { DID_SPACES_URL, DID_SPACES_AUTHORIZATION } = process.env;
if (!DID_SPACES_URL || !DID_SPACES_AUTHORIZATION) {
  console.error("Please set DID_SPACES_URL and DID_SPACES_AUTHORIZATION environment variables.");
  process.exit(1);
}

console.log("DID_SPACES_URL:", DID_SPACES_URL);
console.log(
  "DID_SPACES_AUTHORIZATION:",
  `${DID_SPACES_AUTHORIZATION.slice(0, 20)}***${DID_SPACES_AUTHORIZATION.slice(-10)}`,
);

// Create MCP agent for DID Spaces
const mcpAgent = await MCPAgent.from({
  url: DID_SPACES_URL,
  transport: "streamableHttp",
  opts: {
    requestInit: {
      headers: {
        Authorization: DID_SPACES_AUTHORIZATION,
      },
    },
  },
});
console.log("Available MCP Skills:", mcpAgent.skills);

// Create AI agent with MCP skills
const agent = AIAgent.from({
  instructions: `You are a DID Spaces assistant. Show data only, no explanations.

- Execute the requested operation
- Show only the raw data result
- No formatting, headers, or explanations`,
  skills: [mcpAgent],
  inputKey: "message",
});

await runWithAIGNE(agent, {
  chatLoopOptions: {
    welcome: "Hello! I'm a chatbot with DID Space MCP Server. Try asking me a question!",
    defaultQuestion: `Get space metadata`,
  },
});
