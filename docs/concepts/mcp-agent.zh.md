# MCPAgent

[English](./mcp-agent.md) | [中文](./mcp-agent.zh.md)

## 概述

MCPAgent 是 AIGNE 框架中的一个专门组件，用于与遵循模型上下文协议（Model Context Protocol，MCP）的服务器进行交互。它允许开发者连接到远程 MCP 服务器，并访问这些服务器提供的工具、提示和资源。MCPAgent 充当应用程序与 MCP 服务器之间的桥梁，使开发者能够轻松地将外部服务集成到他们的 AI 应用中。

主要特点：

* 支持多种连接方式，包括命令行、HTTP/SSE 和 StreamableHTTP
* 自动发现并访问服务器提供的工具（作为技能）、提示和资源
* 提供自动重连机制，确保连接稳定性
* 简化与外部服务的集成流程

## 从 command 创建 MCP Agent

MCPAgent 可以通过命令行方式创建，这种方式会启动一个外部进程作为 MCP 服务器。这是一种非常灵活的方式，允许你使用任何支持 MCP 协议的命令行工具或服务。在下面的示例中，我们使用 npx 命令启动一个加密货币交易所数据服务器。

```ts file="../../docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-basic-create-agent"
import { MCPAgent } from "@aigne/core";

const ccxt = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});
```

主要特点：

* 通过 `command` 参数指定要执行的命令
* 通过 `args` 参数提供命令行参数
* 自动启动外部进程并建立连接
* 支持任何符合 MCP 协议的命令行工具

## Skills

MCPAgent 连接到 MCP 服务器后，会自动发现并加载服务器提供的所有工具作为技能（skills）。这些技能可以通过 `skills` 属性访问，该属性是一个数组，同时也支持通过名称索引。下面的示例展示了如何查看可用的技能列表并获取特定技能。

```ts file="../../docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-basic-explore-skills"
console.log(ccxt.skills);
// Output: [ cache-stats, clear-cache, set-log-level, list-exchanges, get-ticker, batch-get-tickers, get-orderbook, get-ohlcv, get-trades, get-markets, get-exchange-info, get-leverage-tiers, get-funding-rates, get-market-types, account-balance, place-market-order, set-leverage, set-margin-mode, place-futures-market-order, get-proxy-config, set-proxy-config, test-proxy-connection, clear-exchange-cache, set-market-type ]

const getTicker = ccxt.skills["get-ticker"];
```

获取到特定技能后，可以使用 `invoke` 方法调用该技能，并传入所需的参数。每个技能都有自己的参数要求，这取决于 MCP 服务器的实现。下面的示例展示了如何调用 `get-ticker` 技能获取特定交易所和交易对的行情数据。

```ts file="../../docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-basic-invoke-skill"
const result = await getTicker.invoke({
  exchange: "coinbase",
  symbol: "ABT/USD",
});
console.log(result);
// Output: { content: [ { type: 'text', text: '{\n  "symbol": "ABT/USD",\n  "timestamp": 1747789089514,\n  "datetime": "2025-05-21T00:58:09.514083Z",\n  "bid": 0.9336,\n  "ask": 0.935,\n  "last": 0.9338,\n  "close": 0.9338,\n  "info": {\n    "trade_id": "5572965",\n    "product_id": "ABT-USD",\n    "price": "0.9338",\n    "size": "17",\n    "time": "2025-05-21T00:58:09.514083Z",\n    "side": "BUY",\n    "bid": "",\n    "ask": "",\n    "exchange": "coinbase"\n  }\n}' } ] }
```

主要特点：

* 每个技能都是一个独立的代理，可以单独调用
* 通过 `invoke` 方法传递参数并获取结果
* 参数和返回值格式取决于具体的 MCP 服务器实现
* 技能可以执行各种操作，从简单的数据查询到复杂的业务逻辑

## 从 StreamableHTTP API 创建 MCP Agent

除了通过命令行创建 MCP Agent 外，还可以通过 HTTP 连接到远程 MCP 服务器。AIGNE 框架支持两种 HTTP 连接方式：SSE（Server-Sent Events，默认）和 StreamableHTTP。StreamableHTTP 是一种更现代的连接方式，支持双向通信和流式响应，适合需要高性能和实时数据的场景。

```ts file="../../docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-streamable-http-create-agent"
import { MCPAgent } from "@aigne/core";

const ccxt = await MCPAgent.from({
  url: "http://api.example.com/mcp",
  transport: "streamableHttp",
});
```

主要特点：

* 通过 `url` 参数指定 MCP 服务器的地址
* 通过 `transport` 参数指定传输方式（"streamableHttp" 或 "sse"）
* 支持远程连接，无需在本地启动服务器进程
* 适合与云端或远程服务集成

## 总结

MCPAgent 是 AIGNE 框架中连接外部服务的强大工具，它通过 MCP 协议提供了一种标准化的方式来访问各种外部功能和数据源。无论是通过命令行启动本地服务，还是连接到远程 HTTP API，MCPAgent 都能自动发现并提供服务器的功能作为技能，使开发者能够轻松地将这些功能集成到他们的 AI 应用中。

MCPAgent 的主要优势在于：

1. 标准化接口：通过 MCP 协议提供统一的接口，简化集成流程
2. 自动发现：自动发现并加载服务器提供的工具、提示和资源
3. 多种连接方式：支持命令行、HTTP/SSE 和 StreamableHTTP 等多种连接方式
4. 可靠性：提供自动重连机制，确保连接稳定性

通过 MCPAgent，开发者可以轻松地将各种外部服务和数据源集成到他们的 AI 应用中，扩展应用的功能和能力。
