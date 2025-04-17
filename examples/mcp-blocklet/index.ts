#!/usr/bin/env npx -y bun

import assert from "node:assert";
import { runChatLoopInTerminal } from "@aigne/cli/utils/run-chat-loop.js";
import { AIAgent, ExecutionEngine, MCPAgent, PromptBuilder } from "@aigne/core";
import { loadModel } from "@aigne/core/loader/index.js";
import { logger } from "@aigne/core/utils/logger.js";
import { UnauthorizedError, refreshAuthorization } from "@modelcontextprotocol/sdk/client/auth.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
// @ts-ignore
import JWT from "jsonwebtoken";

import { TerminalOAuthProvider } from "./oauth.js";

logger.enable(`aigne:mcp,${process.env.DEBUG}`);

const { BLOCKLET_APP_URL } = process.env;
assert(BLOCKLET_APP_URL, "Please set the BLOCKLET_APP_URL environment variable");
console.info("Connecting to blocklet app", BLOCKLET_APP_URL);

const appUrl = new URL(BLOCKLET_APP_URL);
appUrl.pathname = "/.well-known/service/mcp/sse";

const provider = new TerminalOAuthProvider(appUrl.host);
const authCodePromise = new Promise((resolve, reject) => {
  provider.once("authorized", resolve);
  provider.once("error", reject);
});

const transport = new SSEClientTransport(appUrl, {
  authProvider: provider,
});

try {
  let tokens = await provider.tokens();
  if (tokens) {
    let decoded = JWT.decode(tokens.access_token);
    console.info("Decoded access token:", decoded);
    if (decoded) {
      const now = Date.now();
      const expiresAt = decoded.exp * 1000;
      if (now < expiresAt) {
        console.info("Tokens already exist and not expired, skipping authorization");
      } else if (tokens.refresh_token) {
        decoded = JWT.decode(tokens.refresh_token);
        console.info("Decoded refresh token:", decoded);
        if (decoded) {
          const now = Date.now();
          const expiresAt = decoded.exp * 1000;
          if (now < expiresAt) {
            console.info("Refresh token already exists and not expired, refreshing authorization");
            try {
              tokens = await refreshAuthorization(appUrl.href, {
                // biome-ignore lint/style/noNonNullAssertion: <explanation>
                clientInformation: (await provider.clientInformation())!,
                refreshToken: tokens.refresh_token,
              });
              await provider.saveTokens(tokens);
            } catch (error) {
              console.error(
                "Error refreshing authorization, resetting tokens and starting authorization",
                error,
              );
              await provider.saveTokens(undefined);
              await transport.start();
            }
          } else {
            console.info("Refresh token already expired, starting authorization");
            await transport.start();
          }
        }
      }
    }
  } else {
    console.info("No tokens found, starting authorization");
    await transport.start();
  }
} catch (error) {
  if (error instanceof UnauthorizedError) {
    const code = await authCodePromise;
    console.info("Authorization code received, finishing authorization...", Date.now());
    await transport.finishAuth(code as string);
    await transport.close();
  } else {
    console.error("Error authorizing:", error);
    process.exit(1);
  }
}

console.info("Starting connecting to blocklet mcp...");

const model = await loadModel();

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
  instructions: PromptBuilder.from(
    "You are a helpful assistant that can help users query and analyze data from the blocklet. You can perform various database queries on the blocklet database, before performing any queries, please try to understand the user's request and generate a query base on the database schema.",
  ),
  memory: true,
});

const userAgent = engine.call(agent);

await runChatLoopInTerminal(userAgent, {
  welcome:
    "Hello! I'm a chatbot that can help you interact with the blocklet. Try asking me a question about the blocklet!",
  defaultQuestion: "How many users are there in the database?",
});

process.exit(0);
