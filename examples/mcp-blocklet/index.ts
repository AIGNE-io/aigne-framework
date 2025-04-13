#!/usr/bin/env npx -y bun

import assert from 'node:assert';
import JWT from 'jsonwebtoken';
import { AIAgent, ExecutionEngine, MCPAgent, PromptBuilder, getMessage } from '@aigne/core';
import { logger } from '@aigne/core/utils/logger.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { runChatLoopInTerminal } from '@aigne/core/utils/run-chat-loop.js';
import { ClaudeChatModel } from '@aigne/core/models/claude-chat-model';
import { refreshAuthorization, UnauthorizedError } from '@modelcontextprotocol/sdk/client/auth.js';

import { TerminalOAuthProvider } from './oauth.js';

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
  let tokens = await provider.tokens();
  if (tokens) {
    let decoded = JWT.decode(tokens.access_token);
    console.info('Decoded access token:', decoded);
    if (decoded) {
      const now = Date.now();
      const expiresAt = decoded.exp * 1000;
      if (now < expiresAt) {
        console.info('Tokens already exist and not expired, skipping authorization');
      } else if (tokens.refresh_token) {
        decoded = JWT.decode(tokens.refresh_token);
        console.info('Decoded refresh token:', decoded);
        if (decoded) {
          const now = Date.now();
          const expiresAt = decoded.exp * 1000;
          if (now < expiresAt) {
            console.info('Refresh token already exists and not expired, refreshing authorization');
            try {
              tokens = await refreshAuthorization(appUrl.href, {
                clientInformation: (await provider.clientInformation())!,
                refreshToken: tokens.refresh_token,
              });
              await provider.saveTokens(tokens);
            } catch (error) {
              console.error('Error refreshing authorization, resetting tokens and starting authorization', error);
              await provider.saveTokens(undefined);
              await transport.start();
            }
          } else {
            console.info('Refresh token already expired, starting authorization');
            await transport.start();
          }
        }
      }
    }
  } else {
    console.info('No tokens found, starting authorization');
    await transport.start();
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
