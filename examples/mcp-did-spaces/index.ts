import { MCPAgent, AIGNE, AIAgent } from '@aigne/core';
import { OpenAIChatModel as Model } from '@aigne/openai';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv-flow';

dotenv.config({ silent: true });

const aigne = new AIGNE({
  model: new Model({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4o-mini',
  }),
});

// Create MCP agent for DID Spaces
const mcpAgent = await MCPAgent.from({
  url: process.env.DID_SPACES_URL!,
  transport: 'streamableHttp',
  opts: {
    requestInit: {
      headers: {
        Authorization: process.env.DID_SPACES_AUTHORIZATION!,
      },
    },
  },
});
console.log('Available MCP Skills:', mcpAgent.skills);

// Create AI agent with MCP skills
const agent = AIAgent.from({
  instructions: `You are a DID Spaces assistant. Show data only, no explanations.

- Execute the requested operation
- Show only the raw data result
- No formatting, headers, or explanations`,
  skills: Object.values(mcpAgent.skills),
  inputKey: 'message',
});

// Test MCP DID Spaces functionality
const result1 = await aigne.invoke(agent, {
  message: `Get space metadata`,
});
console.log(result1.message);

const result2 = await aigne.invoke(agent, {
  message: `List root objects`,
});
console.log(result2.message);

const result3 = await aigne.invoke(agent, {
  message: `Write test.txt with "Hello MCP"`,
});
console.log(result3.message);

// Save results to markdown file
const filename = `mcp-did-spaces-results.md`;
const content = `# MCP DID Spaces Test Results\n\n${result1.message}\n\n${result2.message}\n\n${result3.message}`;
writeFileSync(filename, content, 'utf8');
