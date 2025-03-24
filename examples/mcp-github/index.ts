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
} from "@aigne/core";

const { OPENAI_API_KEY, GITHUB_PERSONAL_ACCESS_TOKEN } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");
assert(
  GITHUB_PERSONAL_ACCESS_TOKEN,
  "Please set the GITHUB_PERSONAL_ACCESS_TOKEN environment variable",
);

logger.enable(`aigne:mcp,${process.env.DEBUG}`);

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const github = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_PERSONAL_ACCESS_TOKEN,
  },
});

const engine = new ExecutionEngine({
  model,
  tools: [github],
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
  memory: true,
});

const userAgent = engine.call(agent);

await runChatLoopInTerminal(userAgent, {
  welcome:
    "Hello! I'm a chatbot that can help you interact with GitHub. Try asking me a question about GitHub repositories!",
  defaultQuestion: "Search for repositories related to 'aigne-framework'",
  onResponse: (response) => console.log(getMessage(response)),
});

process.exit(0);
