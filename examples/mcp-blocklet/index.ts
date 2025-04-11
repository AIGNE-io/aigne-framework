#!/usr/bin/env npx -y bun

import assert from 'node:assert';
import { AIAgent, ExecutionEngine, MCPAgent, PromptBuilder, getMessage } from '@aigne/core';
import { logger } from '@aigne/core/utils/logger.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { runChatLoopInTerminal } from '@aigne/core/utils/run-chat-loop.js';
import { ClaudeChatModel } from '@aigne/core/models/claude-chat-model';
import { TerminalOAuthProvider } from './oauth.js';
import { UnauthorizedError } from '@modelcontextprotocol/sdk/client/auth.js';

logger.enable(`aigne:mcp,${process.env.DEBUG}`);

const { ANTHROPIC_API_KEY, BLOCKLET_APP_URL } = process.env;
assert(ANTHROPIC_API_KEY, 'Please set the ANTHROPIC_API_KEY environment variable');
assert(BLOCKLET_APP_URL, 'Please set the BLOCKLET_APP_URL environment variable');

const appUrl = new URL(BLOCKLET_APP_URL);
appUrl.pathname = '/.well-known/service/mcp/sse';

const provider = new TerminalOAuthProvider();
const authCodePromise = new Promise((resolve, reject) => {
  console.info('Waiting for authorization code...', Date.now());
  provider.once('authorized', resolve);
  provider.once('error', reject);
});

const transport = new SSEClientTransport(appUrl, {
  authProvider: provider,
});

try {
  const tokens = await provider.tokens();
  if (!tokens) {
    console.info('No tokens found, starting authorization');
    await transport.start();
  } else {
    console.info('Tokens already exist, skipping authorization');
  }
} catch (error) {
  if (error instanceof UnauthorizedError) {
    const code = await authCodePromise;
    console.info('Authorization code received, finishing authorization...', Date.now());
    await transport.finishAuth(code as string);
    await transport.close();
  } else {
    console.error('Error authorizing:', error);
    process.exit(1);
  }
}

console.info('Starting connecting to blocklet mcp...');

const model = new ClaudeChatModel({
  apiKey: ANTHROPIC_API_KEY,
});

const blocklet = await MCPAgent.from({
  url: appUrl.href,
  timeout: 8000,
  opts: {
    authProvider: provider,
  },
});

const engine = new ExecutionEngine({
  model,
  tools: [blocklet],
});

const agent = AIAgent.from({
  instructions: PromptBuilder.from('How many users are there in the database?'),
  memory: true,
});

const userAgent = engine.call(agent);

await runChatLoopInTerminal(userAgent, {
  initialCall: {},
  onResponse: (response) => console.log(getMessage(response)),
});

process.exit(0);
