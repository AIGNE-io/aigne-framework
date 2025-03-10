// Import required components from @aigne/core and environment variables
import { AIAgent, ChatModelOpenAI, ExecutionEngine, MCPAgent } from "@aigne/core";
import { DEFAULT_CHAT_MODEL, OPENAI_API_KEY } from "../env";

// Initialize OpenAI chat model with API key and model configuration
const model = new ChatModelOpenAI({
  apiKey: OPENAI_API_KEY,
  model: DEFAULT_CHAT_MODEL,
});

// Create an AI agent with specific instructions for web content extraction
const agent = AIAgent.from({
  instructions: `\
## Steps to extract content from a website
1. navigate to the url
2. evaluate document.body.innerText to get the content
`,
});

// Initialize Puppeteer MCP agent for browser automation
// This creates a new instance of a Puppeteer server using npx
const puppeteerMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
});

// Set up the execution engine with the model and Puppeteer tool
const engine = new ExecutionEngine({
  model,
  tools: [puppeteerMCPAgent],
});

// Execute the content extraction task for arcblock.io website
const result = await engine.run("extract content from https://www.arcblock.io", agent);

// Clean up resources by destroying the engine
await engine.destroy();

// Output the extracted content and exit the process
console.log(result);
process.exit(0);
