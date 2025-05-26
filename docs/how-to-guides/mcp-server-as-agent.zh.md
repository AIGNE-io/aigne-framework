# 使用 MCP Server 创建 Agent

Model Context Protocol (MCP) 是一种标准化协议，可用于创建专业领域的 Agent 服务。aigne 框架提供了 MCPAgent 类，使您能够轻松地将 MCP 服务器作为 Agent 集成到您的应用中。本指南将介绍如何使用 MCP Server 创建强大的功能型 Agent。

## 基本流程

使用 MCP Server 创建 Agent 的过程包括以下几个步骤：

1. **导入必要的模块** - 引入框架中的 MCPAgent 类
2. **创建 MCPAgent 实例** - 配置并连接到特定的 MCP 服务器
3. **探索 Agent 提供的技能** - 了解可用功能并选择所需技能
4. **调用技能执行任务** - 使用选定的技能处理具体业务需求

让我们逐步了解各个环节的实现细节：

### 创建 MCP Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-mcp-server-as-agent-create-agent" exclude_imports
const ccxt = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});
```

**说明**：

* **创建方式**：使用 `MCPAgent.from()` 工厂方法创建并连接到 MCP 服务器
* **启动配置**：
  * `command` 参数指定启动命令（这里是 "npx"）
  * `args` 参数数组定义启动参数，用于指定具体的 MCP 服务器包
* **服务器选择**：本例使用 `@mcpfun/mcp-server-ccxt` 包，提供加密货币交易数据访问
* **异步处理**：方法返回 Promise，需要使用 `await` 等待服务器启动和连接完成
* **便捷性**：`-y` 标志自动确认所有提示，简化启动流程

### 探索 Agent 的技能

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-mcp-server-as-agent-explore-skills" exclude_imports
console.log(ccxt.skills);
// Output: [ cache-stats, clear-cache, set-log-level, list-exchanges, get-ticker, batch-get-tickers, get-orderbook, get-ohlcv, get-trades, get-markets, get-exchange-info, get-leverage-tiers, get-funding-rates, get-market-types, account-balance, place-market-order, set-leverage, set-margin-mode, place-futures-market-order, get-proxy-config, set-proxy-config, test-proxy-connection, clear-exchange-cache, set-market-type ]

const getTicker = ccxt.skills["get-ticker"];
```

**说明**：

* **技能发现**：通过 `skills` 属性获取服务器提供的所有可用技能列表
* **技能分类**：CCXT 服务器提供的技能可分为几个主要类别：
  * **市场数据获取**：获取价格、订单簿、交易历史等信息
  * **交易操作执行**：下单、设置杠杆、设置保证金模式等
  * **系统管理**：缓存控制、日志级别设置、代理配置等
* **技能选择**：使用键值访问方式（`skills["skill-name"]`）获取特定技能
* **动态性**：服务器可能随时更新提供的技能集，代码需要适应这种变化

### 调用技能获取数据

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-mcp-server-as-agent-invoke-skill" exclude_imports
const result = await getTicker.invoke({
  exchange: "coinbase",
  symbol: "ABT/USD",
});
console.log(result);
// Output: { content: [ { type: 'text', text: '{\n  "symbol": "ABT/USD",\n  "timestamp": 1747789089514,\n  "datetime": "2025-05-21T00:58:09.514083Z",\n  "bid": 0.9336,\n  "ask": 0.935,\n  "last": 0.9338,\n  "close": 0.9338,\n  "info": {\n    "trade_id": "5572965",\n    "product_id": "ABT-USD",\n    "price": "0.9338",\n    "size": "17",\n    "time": "2025-05-21T00:58:09.514083Z",\n    "side": "BUY",\n    "bid": "",\n    "ask": "",\n    "exchange": "coinbase"\n  }\n}' } ] }
```

**说明**：

* **调用方法**：使用技能对象的 `invoke()` 方法执行特定功能
* **参数传递**：根据技能要求传入必要参数
  * `exchange`：指定数据源交易所（本例为 "coinbase"）
  * `symbol`：指定交易对（本例为 "ABT/USD"）
* **返回格式**：返回标准化的 MCP 响应对象，包含多种可能的内容类型
* **数据解析**：响应中的 `content` 数组包含不同类型的内容块，这里是包含 JSON 数据的文本块
* **异步操作**：调用过程是异步的，需要使用 `await` 等待结果返回

## 示例代码

下面的示例展示了如何使用 CCXT MCP 服务器创建加密货币数据 Agent：

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

## 提示

* **MCP Server 多样性**：不同的 MCP 服务器提供不同领域的专业技能，如加密货币、天气预报、自然语言处理等
* **技能发现**：使用 `console.log(agent.skills)` 查看特定服务器提供的所有可用技能
* **参数文档**：每个技能的参数要求应参考相应 MCP 服务器的文档
