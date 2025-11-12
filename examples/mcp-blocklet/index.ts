#!/usr/bin/env bunwrapper

import assert from "node:assert";
import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, MCPAgent, PromptBuilder } from "@aigne/core";
import { DefaultMemory } from "@aigne/default-memory";
import { refreshAuthorization, UnauthorizedError } from "@modelcontextprotocol/sdk/client/auth.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import JWT from "jsonwebtoken";
import { TerminalOAuthProvider } from "./oauth.js";
import { joinURL } from 'ufo';

const rawUrl = process.argv.find((arg) => arg.startsWith("https://") || arg.startsWith("http://")) || process.env.BLOCKLET_APP_URL;
assert(
  rawUrl,
  "Please provide a blocklet url as an argument or set the BLOCKLET_APP_URL environment variable",
);

const appUrl = new URL(rawUrl);
try {
  const result = await fetch(joinURL(appUrl.href, "__blocklet__.js"));
  if (result.status !== 200) {
    console.error("Seems like the provided url is not a valid blocklet url: ", rawUrl);
    process.exit(1);
  }
} catch (error) {
  console.error("Error verifying blocklet url", error);
  process.exit(1);
}

console.info("Connecting to blocklet", appUrl.href);

let transport: StreamableHTTPClientTransport;

const provider = new TerminalOAuthProvider(appUrl.host);

const authCodePromise = new Promise((resolve, reject) => {
  provider.once("authorized", async (code) => {
    await transport.finishAuth(code);
    resolve(code);
  });
  provider.once("error", reject);
});

transport = new StreamableHTTPClientTransport(appUrl, {
  authProvider: provider,
});

try {
  let tokens = await provider.tokens();
  if (tokens) {
    let decoded = JWT.decode(tokens.access_token);
    if (decoded && typeof decoded === "object") {
      const exp = decoded.exp;
      assert(typeof exp === "number", "Invalid access token");

      const now = Date.now();
      const expiresAt = exp * 1000;
      if (now < expiresAt) {
        console.info("Tokens already exist and not expired, skipping authorization");
      } else if (tokens.refresh_token) {
        console.info("Access token expired:", { now, expiresAt, decoded });
        decoded = JWT.decode(tokens.refresh_token);
        if (decoded) {
          const now = Date.now();
          const expiresAt = exp * 1000;
          if (now < expiresAt) {
            console.info("Refresh token already exists and not expired, refreshing authorization");
            try {
              const oauthUrl = new URL(appUrl.href);
              oauthUrl.pathname = "/.well-known/oauth-authorization-server";
              const metadata = await fetch(oauthUrl.href).then((res) => res.json());
              tokens = await refreshAuthorization(appUrl.href, {
                metadata,
                // biome-ignore lint/style/noNonNullAssertion: non-null assertion
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
    console.info("No tokens found, starting authorization...");
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

await runWithAIGNE(
  async () => {

    const url = joinURL(appUrl.origin, '/.well-known/service/mcp');
    const blocklet = await MCPAgent.from({
      url,
      transport: "streamableHttp",
      opts: {
        authProvider: provider,
      },
    });

    const agent = AIAgent.from({
      name: "example_blocklet",
      instructions: PromptBuilder.from(
        "You are a helpful assistant that can help users query and analyze data from the blocklet. You can perform various database queries on the blocklet database, before performing any queries, please try to understand the user's request and generate a query base on the database schema.",
      ),
      skills: [blocklet],
      memory: new DefaultMemory(),
      inputKey: "message",
    });

    return agent;
  },
  {
    chatLoopOptions: {
      welcome:
        "Hello! I'm a chatbot that can help you interact with the blocklet. Try asking me a question about the blocklet!",
      defaultQuestion: "How many users are there in the database?",
    },
  },
);

process.exit(0);
