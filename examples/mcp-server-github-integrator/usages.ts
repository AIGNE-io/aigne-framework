import assert from "node:assert";
import { AIAgent, ChatModelOpenAI, ExecutionEngine, MCPAgent } from "@aigne/core-next";

const { OPENAI_API_KEY, GITHUB_PERSONAL_ACCESS_TOKEN } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");
assert(
  GITHUB_PERSONAL_ACCESS_TOKEN,
  "Please set the GITHUB_PERSONAL_ACCESS_TOKEN environment variable",
);

const model = new ChatModelOpenAI({
  apiKey: OPENAI_API_KEY,
});

const githubMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_PERSONAL_ACCESS_TOKEN,
  },
});

const engine = new ExecutionEngine({
  model,
  tools: [githubMCPAgent],
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
const searchResult = await engine.call(
  agent,
  "Search for repositories related to 'modelcontextprotocol' and limit to 3 results",
);
console.log(searchResult.text);
console.log("\n------------------------\n");

// Example 2: Get file contents
console.log("Example 2: Getting file contents");
const fileResult = await engine.call(
  agent,
  "Get the content of README.md from modelcontextprotocol/servers repository",
);
console.log(fileResult.text);
console.log("\n------------------------\n");

// Example 3: List commits
console.log("Example 3: Listing commits");
const commitsResult = await engine.call(
  agent,
  "List the latest 3 commits from the modelcontextprotocol/servers repository",
);
console.log(commitsResult.text);

await engine.shutdown();
