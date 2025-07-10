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
  instructions: `You are a professional DID Spaces assistant with access to DID Spaces through MCP.

## Your Capabilities
- Help users manage, explore, and manipulate DID Spaces data
- Access to various DID Spaces operations through MCP skills
- Knowledge of decentralized identity and data storage

## Output Requirements
- **ALWAYS** format responses in **Markdown**
- Use **code blocks** for all data (JSON, file contents, technical info)
- Use proper **headers** and **formatting** to structure responses
- Wrap all technical data in appropriate code blocks with syntax highlighting
- Be clear, structured, and provide context for data
- Maintain a helpful and professional tone

Remember: Every piece of technical information should be properly formatted in code blocks!`,
  skills: Object.values(mcpAgent.skills),
  inputKey: 'message',
});

// Test MCP DID Spaces functionality
const result1 = await aigne.invoke(agent, {
  message: `Check and display my DID Space metadata using head_space function.`,
});

const result2 = await aigne.invoke(agent, {
  message: `List all objects in the root folder of my DID Space.`,
});

const result3 = await aigne.invoke(agent, {
  message: `Write a test file named "test.txt" with content "Hello from MCP test - ${new Date().toISOString()}" to root directory.`,
});

console.log(`${result1.message}\n\n${result2.message}\n\n${result3.message}`);

// Save results to markdown file
const filename = `mcp-did-spaces-results.md`;
const content = `# MCP DID Spaces Test Results\n\n${result1.message}\n\n${result2.message}\n\n${result3.message}`;
writeFileSync(filename, content, 'utf8');
console.log(`\n📄 Results saved to: ${filename}`);
