import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel as Model } from "@aigne/openai";
import dotenv from "dotenv-flow";
import { writeFileSync } from "fs";

dotenv.config({ silent: true });

const aigne = new AIGNE({
  model: new Model({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o-mini",
  }),
});

// Create MCP agent for DID Spaces
const mcpAgent = await MCPAgent.from({
  url: process.env.DID_SPACES_URL!,
  transport: "streamableHttp",
  opts: {
    requestInit: {
      headers: {
        Authorization: process.env.DID_SPACES_AUTHORIZATION!,
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
  skills: Object.values(mcpAgent.skills),
  inputKey: "message",
});

const writeObjectResponse = await aigne.invoke(agent, {
  message: `Write test.txt with "Hello MCP"`,
});
console.log("writeObjectResponse", writeObjectResponse.message);

const readObjectResponse = await aigne.invoke(agent, {
  message: `Read test.txt data`,
});
console.log("readObjectResponse", readObjectResponse.message);

const listRootResponse = await aigne.invoke(agent, {
  message: `List root objects`,
});
console.log("listRootResponse", listRootResponse.message);

// Test MCP DID Spaces functionality
const getSpaceMetadataResponse = await aigne.invoke(agent, {
  message: `Get space metadata`,
});
console.log("getSpaceMetadataResponse", getSpaceMetadataResponse.message);

// Save results to markdown file
const filename = `mcp-did-spaces-results.md`;
const content = `# MCP DID Spaces Test Results\n\n${writeObjectResponse.message}\n\n${readObjectResponse.message}\n\n${listRootResponse.message}\n\n${getSpaceMetadataResponse.message}`;
writeFileSync(filename, content, "utf8");
