import { expect, mock, spyOn, test } from "bun:test";
import assert from "node:assert";
import { FunctionAgent, MCPAgent } from "@aigne/core";

test("Example MCPAgent: basic", async () => {
  // #region example-agent-basic

  // #region example-agent-basic-create-agent
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
  // #endregion example-agent-basic-create-agent

  // #region example-agent-basic-explore-skills
  console.log(ccxt.skills);
  // Output: [ cache-stats, clear-cache, set-log-level, list-exchanges, get-ticker, batch-get-tickers, get-orderbook, get-ohlcv, get-trades, get-markets, get-exchange-info, get-leverage-tiers, get-funding-rates, get-market-types, account-balance, place-market-order, set-leverage, set-margin-mode, place-futures-market-order, get-proxy-config, set-proxy-config, test-proxy-connection, clear-exchange-cache, set-market-type ]

  const getTicker = ccxt.skills["get-ticker"];
  assert(getTicker);
  // #endregion example-agent-basic-explore-skills

  spyOn(getTicker, "process").mockReturnValueOnce({
    content: [
      {
        type: "text",
        text: '{\n  "symbol": "ABT/USD",\n  "timestamp": 1747789089514,\n  "datetime": "2025-05-21T00:58:09.514083Z",\n  "bid": 0.9336,\n  "ask": 0.935,\n  "last": 0.9338,\n  "close": 0.9338,\n  "info": {\n    "trade_id": "5572965",\n    "product_id": "ABT-USD",\n    "price": "0.9338",\n    "size": "17",\n    "time": "2025-05-21T00:58:09.514083Z",\n    "side": "BUY",\n    "bid": "",\n    "ask": "",\n    "exchange": "coinbase"\n  }\n}',
      },
    ],
  });

  // #region example-agent-basic-invoke-skill
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
  // #endregion example-agent-basic-invoke-skill

  // #endregion example-agent-basic
});

test("Example MCPAgent: streamable http", async () => {
  // #region example-agent-streamable-http

  // #region example-agent-streamable-http-create-agent
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
    url: "http://api.example.com/mcp",
    transport: "streamableHttp",
  });

  expect(ccxt).toBeInstanceOf(MCPAgent);
  // #endregion example-agent-streamable-http-create-agent

  // #endregion example-agent-streamable-http
});
