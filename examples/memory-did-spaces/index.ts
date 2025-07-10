import { DIDSpacesMemory } from '@aigne/agent-library/did-spaces-memory/index.js';
import { AIGNE, AIAgent } from '@aigne/core';
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

const agent = AIAgent.from({
  instructions: `You are a professional crypto market analyst with persistent memory powered by DID Spaces.

## Your Capabilities
- Expert in cryptocurrency market analysis and investment strategies
- Persistent memory across sessions via DID Spaces technology
- Remember user preferences, investment history, and personal details
- Provide personalized investment insights based on remembered data

## Output Requirements
- **ALWAYS** format responses in **Markdown**
- Use **code blocks** for all technical data (JSON, YAML, crypto symbols, market data)
- Use proper **headers** and **formatting** to structure responses
- Remember personal details and reference them in future conversations
- Provide personalized advice based on remembered information
- Start with personalized greetings when appropriate
- Include relevant remembered information in your analysis

Remember: Your memory persists across sessions, so build upon previous conversations!`,
  memory: new DIDSpacesMemory({
    url:
      process.env.DID_SPACES_URL ||
      'https://bbqa4abi4d7hjydb3qo5l7lyxduukztmhj3gpghkole.did.abtnet.io/app',
    auth: {
      authorization:
        process.env.DID_SPACES_AUTHORIZATION ||
        'Bearer blocklet-zGdxEzkGqKz15PGyjDg37Mq4aZXHqzKVoPtarx2Jb4VGS',
    },
  }),
  inputKey: 'message',
});

// Test DID Spaces Memory functionality
const result1 = await aigne.invoke(agent, {
  message: `Hello! I'm John Doe, a doctor who likes to invest in Bitcoin. I have moderate risk tolerance and 3+ years experience.`,
});

const result2 = await aigne.invoke(agent, {
  message: `What's my favorite cryptocurrency and why is it suitable for me?`,
});

const result3 = await aigne.invoke(agent, {
  message: `Create a personalized investment portfolio for me based on what you remember.`,
});

console.log(`${result1.message}\n\n${result2.message}\n\n${result3.message}`);

// Save results to markdown file
const filename = `memory-did-spaces-results.md`;
const content = `# Memory DID Spaces Test Results\n\n${result1.message}\n\n${result2.message}\n\n${result3.message}`;
writeFileSync(filename, content, 'utf8');
console.log(`\n📄 Results saved to: ${filename}`);
