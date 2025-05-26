# Using MCP Server to Create Agents

[English](./mcp-server-as-agent.md) | [中文](./mcp-server-as-agent.zh.md)

Model Context Protocol (MCP) is a standardized protocol that can be used to create specialized domain Agent services. The AIGNE framework provides the MCPAgent class, enabling you to easily integrate MCP servers as Agents into your applications. This guide will introduce how to use MCP Servers to create powerful functional Agents.

## Basic Process

The process of creating Agents using MCP Servers includes the following steps:

1. **Import Necessary Modules** - Import the MCPAgent class from the framework
2. **Create MCPAgent Instance** - Configure and connect to a specific MCP server
3. **Explore Agent-Provided Skills** - Understand available functionality and select needed skills
4. **Invoke Skills to Execute Tasks** - Use selected skills to handle specific business requirements

Let's understand the implementation details of each step:

### Create MCP Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-mcp-server-as-agent-create-agent" exclude_imports
const ccxt = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});
```

**Explanation**:

* **Creation Method**: Use `MCPAgent.from()` factory method to create and connect to MCP server
* **Startup Configuration**:
  * `command` parameter specifies the startup command (here it's "npx")
  * `args` parameter array defines startup arguments to specify the specific MCP server package
* **Server Selection**: This example uses the `@mcpfun/mcp-server-ccxt` package, providing cryptocurrency trading data access
* **Asynchronous Processing**: Method returns Promise, requiring `await` to wait for server startup and connection completion
* **Convenience**: The `-y` flag automatically confirms all prompts, simplifying the startup process

### Explore Agent Skills

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-mcp-server-as-agent-explore-skills" exclude_imports
console.log(ccxt.skills);
// Output: [ cache-stats, clear-cache, set-log-level, list-exchanges, get-ticker, batch-get-tickers, get-orderbook, get-ohlcv, get-trades, get-markets, get-exchange-info, get-leverage-tiers, get-funding-rates, get-market-types, account-balance, place-market-order, set-leverage, set-margin-mode, place-futures-market-order, get-proxy-config, set-proxy-config, test-proxy-connection, clear-exchange-cache, set-market-type ]

const getTicker = ccxt.skills["get-ticker"];
```

**Explanation**:

* **Skill Discovery**: Get a list of all available skills provided by the server through the `skills` property
* **Skill Categories**: Skills provided by CCXT server can be divided into several main categories:
  * **Market Data Retrieval**: Get prices, order books, trading history, and other information
  * **Trading Operation Execution**: Place orders, set leverage, set margin modes, etc.
  * **System Management**: Cache control, log level settings, proxy configuration, etc.
* **Skill Selection**: Use key-value access method (`skills["skill-name"]`) to get specific skills
* **Dynamism**: Servers may update their provided skill sets at any time, code needs to adapt to these changes

### Invoke Skills to Get Data

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-mcp-server-as-agent-invoke-skill" exclude_imports
const result = await getTicker.invoke({
  exchange: "coinbase",
  symbol: "ABT/USD",
});
console.log(result);
// Output: { content: [ { type: 'text', text: '{\n  "symbol": "ABT/USD",\n  "timestamp": 1747789089514,\n  "datetime": "2025-05-21T00:58:09.514083Z",\n  "bid": 0.9336,\n  "ask": 0.935,\n  "last": 0.9338,\n  "close": 0.9338,\n  "info": {\n    "trade_id": "5572965",\n    "product_id": "ABT-USD",\n    "price": "0.9338",\n    "size": "17",\n    "time": "2025-05-21T00:58:09.514083Z",\n    "side": "BUY",\n    "bid": "",\n    "ask": "",\n    "exchange": "coinbase"\n  }\n}' } ] }
```

**Explanation**:

* **Invocation Method**: Use the skill object's `invoke()` method to execute specific functionality
* **Parameter Passing**: Pass necessary parameters according to skill requirements
  * `exchange`: Specify data source exchange (in this example "coinbase")
  * `symbol`: Specify trading pair (in this example "ABT/USD")
* **Return Format**: Returns standardized MCP response object containing various possible content types
* **Data Parsing**: The `content` array in the response contains different types of content blocks, here it's a text block containing JSON data
* **Asynchronous Operation**: The invocation process is asynchronous, requiring `await` to wait for results

## Example Code

The following example shows how to use CCXT MCP server to create a cryptocurrency data Agent:

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-mcp-server-as-agent"
import { MCPAgent } from "@aigne/core";

const ccxt = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});

console.log(ccxt.skills);
// Output: [ cache-stats, clear-cache, set-log-level, list-exchanges, get-ticker, batch-get-tickers, get-orderbook, get-ohlcv, get-trades, get-markets, get-exchange-info, get-leverage-tiers, get-funding-rates, get-market-types, account-balance, place-market-order, set-leverage, set-margin-mode, place-futures-market-order, get-proxy-config, set-proxy-config, test-proxy-connection, clear-exchange-cache, set-market-type ]

const getTicker = ccxt.skills["get-ticker"];

const result = await getTicker.invoke({
  exchange: "coinbase",
  symbol: "ABT/USD",
});
console.log(result);
// Output: { content: [ { type: 'text', text: '{\n  "symbol": "ABT/USD",\n  "timestamp": 1747789089514,\n  "datetime": "2025-05-21T00:58:09.514083Z",\n  "bid": 0.9336,\n  "ask": 0.935,\n  "last": 0.9338,\n  "close": 0.9338,\n  "info": {\n    "trade_id": "5572965",\n    "product_id": "ABT-USD",\n    "price": "0.9338",\n    "size": "17",\n    "time": "2025-05-21T00:58:09.514083Z",\n    "side": "BUY",\n    "bid": "",\n    "ask": "",\n    "exchange": "coinbase"\n  }\n}' } ] }
```

## Tips

* **MCP Server Diversity**: Different MCP servers provide specialized skills in different domains, such as cryptocurrency, weather forecasting, natural language processing, etc.
* **Skill Discovery**: Use `console.log(agent.skills)` to view all available skills provided by a specific server
* **Parameter Documentation**: Parameter requirements for each skill should refer to the documentation of the corresponding MCP server
