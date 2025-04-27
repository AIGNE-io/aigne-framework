import assert from "node:assert";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY, GITHUB_TOKEN } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");
assert(GITHUB_TOKEN, "Please set the GITHUB_TOKEN environment variable");

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const githubMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN,
  },
});

const aigne = new AIGNE({
  model,
  skills: [githubMCPAgent],
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
});

// Example 1: Search for repositories
console.log("Example 1: Searching for repositories");
const searchResult = await aigne.invoke(
  agent,
  "Search for repositories related to 'modelcontextprotocol' and limit to 3 results",
);
console.log(searchResult);
console.log("\n------------------------\n");

// Example 2: Get file contents
console.log("Example 2: Getting file contents");
const fileResult = await aigne.invoke(
  agent,
  "Get the content of README.md from modelcontextprotocol/servers repository",
);
console.log(fileResult);
console.log("\n------------------------\n");

// Example 3: List commits
console.log("Example 3: Listing commits");
const commitsResult = await aigne.invoke(
  agent,
  "List the latest 3 commits from the modelcontextprotocol/servers repository",
);
console.log(commitsResult);

await aigne.shutdown();
