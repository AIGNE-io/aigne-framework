import { MCPAgent } from '@aigne/core';
import { AIGNE, AIAgent } from '@aigne/core';
import { OpenAIChatModel as Model } from '@aigne/openai';
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
  instructions:
    'You are a helpful assistant with access to DID Spaces through MCP. You can help users manage their DID Spaces data.',
  skills: Object.values(mcpAgent.skills),
  inputKey: 'message',
});

// Test MCP DID Spaces functionality
const result1 = await aigne.invoke(agent, {
  message:
    'Can you check the metadata of my DID Space? Please output structure data.',
});
console.log('result1', result1);

const result2 = await aigne.invoke(agent, {
  message: 'What objects in root folder are available in my DID Space?',
});
console.log('result2', result2);

const result3 = await aigne.invoke(agent, {
  message:
    'Can you write a test file to my DID Space with the content "Hello from MCP test" and name it "test.txt"?',
});
console.log('result3', result3);
