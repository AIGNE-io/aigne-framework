# MCPAgent

[English](./mcp-agent.md) | [中文](./mcp-agent.zh.md)

## Overview

MCPAgent is a specialized component in the AIGNE framework for interacting with servers that follow the Model Context Protocol (MCP). It allows developers to connect to remote MCP servers and access the tools, prompts, and resources provided by these servers. MCPAgent acts as a bridge between applications and MCP servers, enabling developers to easily integrate external services into their AI applications.

Key features:

* Supports multiple connection methods, including command line, HTTP/SSE, and StreamableHTTP
* Automatically discovers and accesses server-provided tools (as skills), prompts, and resources
* Provides automatic reconnection mechanism to ensure connection stability
* Simplifies the integration process with external services

## Creating MCP Agent from Command

MCPAgent can be created through command line, which starts an external process as an MCP server. This is a very flexible approach that allows you to use any command-line tool or service that supports the MCP protocol. In the example below, we use the npx command to start a cryptocurrency exchange data server.

```ts file="../../docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-basic-create-agent"
import { MCPAgent } from "@aigne/core";

const ccxt = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});
```

Key features:

* Specify the command to execute through the `command` parameter
* Provide command-line arguments through the `args` parameter
* Automatically start external process and establish connection
* Support any command-line tool that complies with the MCP protocol

## Skills

After MCPAgent connects to an MCP server, it automatically discovers and loads all tools provided by the server as skills. These skills can be accessed through the `skills` property, which is an array that also supports indexing by name. The example below shows how to view the list of available skills and get a specific skill.

```ts file="../../docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-basic-explore-skills"
console.log(ccxt.skills);
// Output: [ cache-stats, clear-cache, set-log-level, list-exchanges, get-ticker, batch-get-tickers, get-orderbook, get-ohlcv, get-trades, get-markets, get-exchange-info, get-leverage-tiers, get-funding-rates, get-market-types, account-balance, place-market-order, set-leverage, set-margin-mode, place-futures-market-order, get-proxy-config, set-proxy-config, test-proxy-connection, clear-exchange-cache, set-market-type ]

const getTicker = ccxt.skills["get-ticker"];
```

After obtaining a specific skill, you can use the `invoke` method to call that skill and pass in the required parameters. Each skill has its own parameter requirements, which depend on the MCP server implementation. The example below shows how to call the `get-ticker` skill to get market data for a specific exchange and trading pair.

```ts file="../../docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-basic-invoke-skill"
const result = await getTicker.invoke({
  exchange: "coinbase",
  symbol: "ABT/USD",
});
console.log(result);
// Output: { content: [ { type: 'text', text: '{\n  "symbol": "ABT/USD",\n  "timestamp": 1747789089514,\n  "datetime": "2025-05-21T00:58:09.514083Z",\n  "bid": 0.9336,\n  "ask": 0.935,\n  "last": 0.9338,\n  "close": 0.9338,\n  "info": {\n    "trade_id": "5572965",\n    "product_id": "ABT-USD",\n    "price": "0.9338",\n    "size": "17",\n    "time": "2025-05-21T00:58:09.514083Z",\n    "side": "BUY",\n    "bid": "",\n    "ask": "",\n    "exchange": "coinbase"\n  }\n}' } ] }
```

Key features:

* Each skill is an independent agent that can be called separately
* Pass parameters and get results through the `invoke` method
* Parameter and return value formats depend on the specific MCP server implementation
* Skills can perform various operations, from simple data queries to complex business logic

## Creating MCP Agent from StreamableHTTP API

In addition to creating MCP Agent through command line, you can also connect to remote MCP servers via HTTP. The AIGNE framework supports two HTTP connection methods: SSE (Server-Sent Events, default) and StreamableHTTP. StreamableHTTP is a more modern connection method that supports bidirectional communication and streaming responses, suitable for scenarios requiring high performance and real-time data.

```ts file="../../docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-streamable-http-create-agent"
import { MCPAgent } from "@aigne/core";

const ccxt = await MCPAgent.from({
  url: "http://api.example.com/mcp",
  transport: "streamableHttp",
});
```

Key features:

* Specify the MCP server address through the `url` parameter
* Specify the transport method through the `transport` parameter ("streamableHttp" or "sse")
* Support remote connections without starting server processes locally
* Suitable for integration with cloud or remote services

## Summary

MCPAgent is a powerful tool in the AIGNE framework for connecting to external services. It provides a standardized way to access various external functions and data sources through the MCP protocol. Whether starting local services through command line or connecting to remote HTTP APIs, MCPAgent can automatically discover and provide server functionality as skills, enabling developers to easily integrate these functions into their AI applications.

The main advantages of MCPAgent are:

1. Standardized Interface: Provides a unified interface through the MCP protocol, simplifying the integration process
2. Automatic Discovery: Automatically discovers and loads tools, prompts, and resources provided by servers
3. Multiple Connection Methods: Supports various connection methods including command line, HTTP/SSE, and StreamableHTTP
4. Reliability: Provides automatic reconnection mechanism to ensure connection stability

Through MCPAgent, developers can easily integrate various external services and data sources into their AI applications, expanding the functionality and capabilities of their applications.
