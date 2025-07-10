#!/usr/bin/env npx -y bun

import { MCPAgent } from '@aigne/core';
import { runWithAIGNE } from '@aigne/cli/utils/run-with-aigne.js';
import { AIAgent } from '@aigne/core';

async function main() {
  // Create MCP agent for DID Spaces
  const mcpAgent = await MCPAgent.from({
    url: 'https://bbqa4abi4d7hjydb3qo5l7lyxduukztmhj3gpghkole.did.abtnet.io/app/mcp',
    transport: 'streamableHttp',
    opts: {
      requestInit: {
        headers: {
          Authorization:
            'Bearer blocklet-z7QAdYvhxBLVcHfFsLwRryKEjDgQ3aLM46ycEQViV2qSe',
        },
      },
    },
  });

  console.log('Available MCP Skills:', Object.keys(mcpAgent.skills));

  // Create AI agent with MCP skills
  const agent = AIAgent.from({
    name: 'mcp_did_spaces_example',
    instructions:
      'You are a helpful assistant with access to DID Spaces through MCP. You can help users manage their DID Spaces data.',
    skills: Object.values(mcpAgent.skills),
    inputKey: 'message',
  });

  await runWithAIGNE(agent, {
    chatLoopOptions: {
      welcome:
        "Hello! I'm a chatbot with MCP DID Spaces integration. I can help you manage your DID Spaces data!",
    },
  });
}

main().catch(console.error);
