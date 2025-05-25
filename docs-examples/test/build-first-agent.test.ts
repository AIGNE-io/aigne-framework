import { expect, mock, spyOn, test } from "bun:test";
import assert from "node:assert";
import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AIAgent, AIGNE, FunctionAgent, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import detectPort from "detect-port";
import express from "express";

test("Build first agent: basic", async () => {
  // #region example-build-first-agent

  // #region example-build-first-agent-create-aigne
  const aigne = new AIGNE({
    model: new OpenAIChatModel({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
    }),
  });
  // #endregion example-build-first-agent-create-aigne
  assert(aigne.model);

  // #region example-build-first-agent-create-agent
  const agent = AIAgent.from({
    instructions: "You are a helpful assistant for Crypto market cap",
  });
  // #endregion example-build-first-agent-create-agent

  spyOn(aigne.model, "process").mockReturnValueOnce({
    text: "Cryptocurrency, often referred to as crypto, is a type of digital or virtual currency that uses cryptography for security",
  });

  // #region example-build-first-agent-invoke-agent
  const result = await aigne.invoke(agent, "What is crypto?");
  console.log(result);
  // Output: { $message: "Cryptocurrency, often referred to as crypto, is a type of digital or virtual currency that uses cryptography for security" }
  // #endregion example-build-first-agent-invoke-agent

  expect(result).toEqual({
    $message:
      "Cryptocurrency, often referred to as crypto, is a type of digital or virtual currency that uses cryptography for security",
  });

  // #endregion example-build-first-agent
});

test("Build first agent: MCP server as Agent", async () => {
  // #region example-mcp-server-as-agent

  // #region example-mcp-server-as-agent-create-agent
  spyOn(MCPAgent, "from").mockReturnValueOnce(
    new MCPAgent({
      name: "ccxt",
      client: mock() as unknown as MCPAgent["client"],
      skills: [
        FunctionAgent.from({
          name: "get-ticker",
          process: () => ({}),
        }),
      ],
    }),
  );

  const ccxt = await MCPAgent.from({
    command: "npx",
    args: ["-y", "@mcpfun/mcp-server-ccxt"],
  });
  // #endregion example-mcp-server-as-agent-create-agent

  // #region example-mcp-server-as-agent-explore-skills
  console.log(ccxt.skills);
  // Output: [ cache-stats, clear-cache, set-log-level, list-exchanges, get-ticker, batch-get-tickers, get-orderbook, get-ohlcv, get-trades, get-markets, get-exchange-info, get-leverage-tiers, get-funding-rates, get-market-types, account-balance, place-market-order, set-leverage, set-margin-mode, place-futures-market-order, get-proxy-config, set-proxy-config, test-proxy-connection, clear-exchange-cache, set-market-type ]

  const getTicker = ccxt.skills["get-ticker"];
  assert(getTicker);
  // #endregion example-mcp-server-as-agent-explore-skills

  spyOn(getTicker, "process").mockReturnValueOnce({
    content: [
      {
        type: "text",
        text: '{\n  "symbol": "ABT/USD",\n  "timestamp": 1747789089514,\n  "datetime": "2025-05-21T00:58:09.514083Z",\n  "bid": 0.9336,\n  "ask": 0.935,\n  "last": 0.9338,\n  "close": 0.9338,\n  "info": {\n    "trade_id": "5572965",\n    "product_id": "ABT-USD",\n    "price": "0.9338",\n    "size": "17",\n    "time": "2025-05-21T00:58:09.514083Z",\n    "side": "BUY",\n    "bid": "",\n    "ask": "",\n    "exchange": "coinbase"\n  }\n}',
      },
    ],
  });

  // #region example-mcp-server-as-agent-invoke-skill
  const result = await getTicker.invoke({ exchange: "coinbase", symbol: "ABT/USD" });
  console.log(result);
  // Output: { content: [ { type: 'text', text: '{\n  "symbol": "ABT/USD",\n  "timestamp": 1747789089514,\n  "datetime": "2025-05-21T00:58:09.514083Z",\n  "bid": 0.9336,\n  "ask": 0.935,\n  "last": 0.9338,\n  "close": 0.9338,\n  "info": {\n    "trade_id": "5572965",\n    "product_id": "ABT-USD",\n    "price": "0.9338",\n    "size": "17",\n    "time": "2025-05-21T00:58:09.514083Z",\n    "side": "BUY",\n    "bid": "",\n    "ask": "",\n    "exchange": "coinbase"\n  }\n}' } ] }
  expect(result).toEqual({
    content: [
      {
        type: "text",
        text: '{\n  "symbol": "ABT/USD",\n  "timestamp": 1747789089514,\n  "datetime": "2025-05-21T00:58:09.514083Z",\n  "bid": 0.9336,\n  "ask": 0.935,\n  "last": 0.9338,\n  "close": 0.9338,\n  "info": {\n    "trade_id": "5572965",\n    "product_id": "ABT-USD",\n    "price": "0.9338",\n    "size": "17",\n    "time": "2025-05-21T00:58:09.514083Z",\n    "side": "BUY",\n    "bid": "",\n    "ask": "",\n    "exchange": "coinbase"\n  }\n}',
      },
    ],
  });
  // #endregion example-mcp-server-as-agent-invoke-skill

  // #endregion example-mcp-server-as-agent
});

test("Build first agent: add skills to agent", async () => {
  spyOn(MCPAgent, "from").mockReturnValueOnce(
    new MCPAgent({
      name: "ccxt",
      client: mock() as unknown as MCPAgent["client"],
      skills: [
        FunctionAgent.from({
          name: "get-ticker",
          process: () => ({}),
        }),
      ],
    }),
  );

  // #region example-add-skills-to-agent

  const aigne = new AIGNE({
    model: new OpenAIChatModel(),
  });
  assert(aigne.model);

  // #region example-add-skills-to-agent-create-skill-agent
  const ccxt = await MCPAgent.from({
    command: "npx",
    args: ["-y", "@mcpfun/mcp-server-ccxt"],
  });
  // #endregion example-add-skills-to-agent-create-skill-agent

  // #region example-add-skills-to-agent-add-skills
  const agent = AIAgent.from({
    instructions: "You are a helpful assistant for Crypto market cap",
    skills: [ccxt],
  });
  // #endregion example-add-skills-to-agent-add-skills

  spyOn(aigne.model, "process").mockReturnValueOnce({
    text: "The current price of ABT/USD on Coinbase is $0.9684.",
  });

  // #region example-add-skills-to-agent-invoke-agent
  const result = await aigne.invoke(agent, "What is the crypto price of ABT/USD on coinbase?");
  console.log(result);
  // Output: { $message:"The current price of ABT/USD on Coinbase is $0.9684." }
  expect(result).toEqual({ $message: "The current price of ABT/USD on Coinbase is $0.9684." });
  // #endregion example-add-skills-to-agent-invoke-agent

  // #endregion example-add-skills-to-agent
});

test("Build first agent: enable memory for agent", async () => {
  const tmp = join(tmpdir(), randomUUID());
  const memoryStoragePath = join(tmp, "memory.db");
  await mkdir(tmp, { recursive: true });

  // #region example-enable-memory-for-agent

  const aigne = new AIGNE({
    model: new OpenAIChatModel(),
  });
  assert(aigne.model);

  // #region example-enable-memory-for-agent-enable-memory
  const agent = AIAgent.from({
    instructions: "You are a helpful assistant for Crypto market analysis",
    memory: {
      storage: {
        path: memoryStoragePath, // Path to store memory data, such as './memory.db'
      },
    },
  });
  // #endregion example-enable-memory-for-agent-enable-memory

  spyOn(aigne.model, "process")
    .mockReturnValueOnce({
      text: "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?",
    })
    .mockReturnValueOnce({
      text: "Your favorite cryptocurrency is Bitcoin.",
    })
    .mockReturnValueOnce({
      text: "Got it, you've invested $5000 in Ethereum! That's a good investment. If there's anything else you'd like to share about your crypto portfolio or have questions, feel free!",
    })
    .mockReturnValueOnce({
      text: "You've invested $5000 in Ethereum.",
    });

  // #region example-enable-memory-for-agent-invoke-agent-1
  const result1 = await aigne.invoke(agent, "My name is John Doe and I like to invest in Bitcoin.");
  console.log(result1);
  // Output: { $message: "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?" }
  expect(result1).toEqual({
    $message:
      "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?",
  });
  // #endregion example-enable-memory-for-agent-invoke-agent-1

  // #region example-enable-memory-for-agent-invoke-agent-2
  const result2 = await aigne.invoke(agent, "What is my favorite cryptocurrency?");
  console.log(result2);
  // Output: { $message: "Your favorite cryptocurrency is Bitcoin." }
  expect(result2).toEqual({ $message: "Your favorite cryptocurrency is Bitcoin." });
  // #endregion example-enable-memory-for-agent-invoke-agent-2

  // #region example-enable-memory-for-agent-invoke-agent-3
  const result3 = await aigne.invoke(agent, "I've invested $5000 in Ethereum.");
  console.log(result3);
  // Output: { $message: "Got it, you've invested $5000 in Ethereum! That's a good investment. If there's anything else you'd like to share about your crypto portfolio or have questions, feel free!" }
  expect(result3).toEqual({
    $message:
      "Got it, you've invested $5000 in Ethereum! That's a good investment. If there's anything else you'd like to share about your crypto portfolio or have questions, feel free!",
  });
  // #endregion example-enable-memory-for-agent-invoke-agent-3

  // #region example-enable-memory-for-agent-invoke-agent-4
  const result4 = await aigne.invoke(agent, "How much have I invested in Ethereum?");
  console.log(result4);
  // Output: { $message: "You've invested $5000 in Ethereum." }
  expect(result4).toEqual({ $message: "You've invested $5000 in Ethereum." });
  // #endregion example-enable-memory-for-agent-invoke-agent-4

  // #endregion example-enable-memory-for-agent

  await rm(tmp, { recursive: true, force: true });
});

test("Build first agent: custom user context", async () => {
  const tmp = join(tmpdir(), randomUUID());
  const memoryStoragePath = join(tmp, "memory.db");
  await mkdir(tmp, { recursive: true });

  // #region example-custom-user-context

  const aigne = new AIGNE({
    model: new OpenAIChatModel(),
  });
  assert(aigne.model);

  // #region example-custom-user-context-create-agent
  const agent = AIAgent.from({
    instructions: "You are a helpful assistant for Crypto market analysis",
    memory: {
      storage: {
        path: memoryStoragePath, // Path to store memory data, such as './memory.db'
        getSessionId: ({ userContext }) => userContext.userId as string, // Use userId from userContext as session ID
      },
    },
  });
  // #endregion example-custom-user-context-create-agent

  // #region example-custom-user-context-invoke-agent
  spyOn(aigne.model, "process").mockReturnValueOnce({
    text: "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?",
  });
  const result = await aigne.invoke(agent, "My name is John Doe and I like to invest in Bitcoin.", {
    userContext: { userId: "user_123" },
  });
  console.log(result);
  // Output: { $message: "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?" }
  expect(result).toEqual({
    $message:
      "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?",
  });
  // #endregion example-custom-user-context-invoke-agent

  // #endregion example-custom-user-context

  await rm(tmp, { recursive: true, force: true });
});

test("Build first agent: serve agent as API service", async () => {
  const tmp = join(tmpdir(), randomUUID());
  const memoryStoragePath = join(tmp, "memory.db");
  await mkdir(tmp, { recursive: true });

  // #region example-serve-agent-as-api-service

  // #region example-serve-agent-as-api-service-create-named-agent
  const agent = AIAgent.from({
    name: "chatbot",
    instructions: "You are a helpful assistant",
    memory: {
      storage: {
        path: memoryStoragePath, // Path to store memory data, such as './memory.db'
        getSessionId: ({ userContext }) => userContext.userId as string, // Use userId from userContext as session ID
      },
    },
  });
  // #endregion example-serve-agent-as-api-service-create-named-agent

  // #region example-serve-agent-as-api-service-create-aigne
  const aigne = new AIGNE({
    model: new OpenAIChatModel(),
    agents: [agent],
  });
  assert(aigne.model);
  // #endregion example-serve-agent-as-api-service-create-aigne

  // #region example-serve-agent-as-api-service-create-http-server
  const server = new AIGNEHTTPServer(aigne);

  const app = express();

  app.post("/api/chat", async (req, res) => {
    const userId = "user_123"; // Example user ID, replace with actual logic to get user ID, such as `req.user.id` in a real application
    await server.invoke(req, res, { userContext: { userId } });
  });

  let port = 3000;
  port = await detectPort();

  const httpServer = app.listen(port);
  // #endregion example-serve-agent-as-api-service-create-http-server

  // #endregion example-serve-agent-as-api-service

  // #region example-aigne-http-client-usage

  // #region example-aigne-http-client-create-client
  const client = new AIGNEHTTPClient({ url: `http://localhost:${port}/api/chat` });
  // #endregion example-aigne-http-client-create-client

  spyOn(aigne.model, "process").mockReturnValueOnce({
    text: "The current price of ABT/USD on Coinbase is $0.9684.",
  });

  // #region example-aigne-http-client-invoke-agent
  const result = await client.invoke("chatbot", "What is the crypto price of ABT/USD on coinbase?");
  console.log(result);
  // Output: { $message: "The current price of ABT/USD on Coinbase is $0.9684." }
  expect(result).toEqual({ $message: "The current price of ABT/USD on Coinbase is $0.9684." });
  // #endregion example-aigne-http-client-invoke-agent

  // #endregion example-aigne-http-client-usage

  httpServer.closeAllConnections();
  httpServer.close();

  await rm(tmp, { recursive: true, force: true });
});
