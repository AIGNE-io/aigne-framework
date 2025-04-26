# MCP Agent API 参考

**中文** | [English](./mcp-agent-api.md)

MCP Agent 是为了与符合 Model Context Protocol (MCP) 的服务器进行交互的 Agent 实现。它可以调用由 MCP 服务器提供的工具、检索提示模板和访问资源。

## MCPAgent 类

`MCPAgent` 继承自 `Agent` 基类，专门用于与 MCP 服务器交互。

### 基本属性

- `client`: `Client` - MCP 客户端实例，用于与 MCP 服务器通信
- `prompts`: `MCPPrompt[]` - MCP 服务器提供的提示模板列表
- `resources`: `MCPResource[]` - MCP 服务器提供的资源列表
- `isCallable`: `boolean` - 始终为 false，因为 MCPAgent 本身不可直接调用

### 构造函数

```typescript
constructor(options: MCPAgentOptions)
```

#### 参数

- `options`: `MCPAgentOptions` - MCPAgent 配置选项
  - `client`: `Client` - MCP 客户端实例
  - `prompts`: `MCPPrompt[]` - 可选的提示模板列表
  - `resources`: `MCPResource[]` - 可选的资源列表

### 静态方法

#### `from`

创建 MCPAgent 的工厂方法，可以从服务器选项或 MCPAgentOptions 创建实例。

```typescript
static from(options: MCPServerOptions): Promise<MCPAgent>;
static from(options: MCPAgentOptions): MCPAgent;
```

##### 参数

- `options`: `MCPServerOptions | MCPAgentOptions` - 服务器选项或 MCPAgent 配置
  - 当传入 `SSEServerParameters` 时：
    - `url`: `string` - MCP 服务器的 URL 地址
    - `maxReconnects`: `number` - 可选，最大重连次数，默认为10，设置为0表示禁用自动重连
    - `shouldReconnect`: `(error: Error) => boolean` - 可选，自定义判断哪些错误需要重连的函数，默认为所有错误都会触发重连
  - 当传入 `StdioServerParameters` 时：
    - `command`: `string` - 启动 MCP 服务器的命令
    - `args`: `string[]` - 可选，命令的参数列表
    - `env`: `Record<string, string>` - 可选，环境变量配置

##### 返回值

- `MCPAgent | Promise<MCPAgent>` - 返回创建的 MCPAgent 实例或创建实例的 Promise

### 方法

#### `shutdown`

关闭 MCPAgent 并释放资源。

```typescript
async shutdown()
```

## MCPBase 类

`MCPBase` 是 `MCPTool`、`MCPPrompt` 和 `MCPResource` 的基类，提供了与 MCP 服务器交互的共同功能。

### 基本属性

- `client`: `ClientWithReconnect` - 支持自动重连的 MCP 客户端实例
- `mcpServer`: `string \| undefined` - MCP 服务器名称

### 构造函数

```typescript
constructor(options: MCPBaseOptions<I, O>)
```

#### 参数

- `options`: `MCPBaseOptions<I, O>` - MCPBase 配置选项
  - `client`: `ClientWithReconnect` - 支持自动重连的 MCP 客户端实例

## MCPTool 类

`MCPTool` 继承自 `MCPBase`，用于调用 MCP 服务器提供的工具。

## MCPPrompt 类

`MCPPrompt` 继承自 `MCPBase`，用于获取 MCP 服务器提供的提示模板。

## MCPResource 类

`MCPResource` 继承自 `MCPBase`，用于访问 MCP 服务器提供的资源。

### 基本属性

- `uri`: `string` - 资源 URI 或 URI 模板

### 构造函数

```typescript
constructor(options: MCPResourceOptions)
```

#### 参数

- `options`: `MCPResourceOptions` - MCPResource 配置选项
  - `client`: `Client` - MCP 客户端实例
  - `uri`: `string` - 资源 URI 或 URI 模板

## 相关类型

### `MCPAgentOptions`

定义 MCPAgent 的配置选项。

```typescript
interface MCPAgentOptions extends AgentOptions {
  client: Client;
  prompts?: MCPPrompt[];
  resources?: MCPResource[];
}
```

### `MCPServerOptions`

定义 MCP 服务器的配置选项。

```typescript
type MCPServerOptions = SSEServerParameters | StdioServerParameters;
```

### `SSEServerParameters`

定义基于 SSE 的 MCP 服务器参数。

```typescript
type SSEServerParameters = {
  url: string;
  maxReconnects?: number;
  shouldReconnect?: (error: Error) => boolean;
};
```

- `url`: `string` - MCP 服务器的 URL 地址
- `maxReconnects`: `number` - 可选，最大重连次数，默认为10，设置为0表示禁用自动重连
- `shouldReconnect`: `(error: Error) => boolean` - 可选，自定义判断哪些错误需要重连的函数，如果未提供则所有错误都会触发重连

### `StdioServerParameters`

定义基于标准输入/输出的 MCP 服务器参数。

```typescript
interface StdioServerParameters {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}
```

- `command`: `string` - 启动 MCP 服务器的命令
- `args`: `string[]` - 可选，命令的参数列表
- `env`: `Record<string, string>` - 可选，环境变量配置

### `MCPResourceOptions`

定义 MCPResource 的配置选项。

```typescript
interface MCPResourceOptions extends MCPBaseOptions<MCPPromptInput, ReadResourceResult> {
  uri: string;
}
```

## 示例

### 使用 Puppeteer MCP 服务器提取网站内容

以下示例展示了如何使用 AIGNE 框架和 Puppeteer MCP 服务器来提取网站内容：

```typescript
import {
  AIAgent,
  OpenAIChatModel,
  AIGNE,
  MCPAgent
} from "@aigne/core";

// 创建 AI 模型
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY
});

// 通过 npx 命令连接到 Puppeteer MCP 服务器
const puppeteerMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"]
});

// 创建执行引擎，并添加 Puppeteer MCP Agent 作为工具
const aigne = new AIGNE({
  model,
  tools: [puppeteerMCPAgent]
});

// 创建 AI Agent，添加提取网站内容的指令
const agent = AIAgent.from({
  instructions: `\
## Steps to extract content from a website
1. navigate to the url
2. evaluate document.body.innerText to get the content
`
});

// 运行 Agent 提取指定网站的内容
const result = await aigne.call(
  agent,
  "extract content from https://www.arcblock.io"
);

console.log(result);
// 输出示例:
// {
//   text: "The content extracted from the website [ArcBlock](https://www.arcblock.io) is as follows:\n\n---\n\n**Redefining Software Architect and Ecosystems**\n\nA total solution for building decentralized applications ..."
// }

// 关闭执行引擎
await aigne.shutdown();
```

### 使用其他 MCP 服务器

除了 Puppeteer MCP 服务器外，你还可以使用其他 MCP 服务器，如 SQLite MCP 服务器：

```typescript
import { MCPAgent } from "@aigne/core";

// 连接到 SQLite MCP 服务器
const sqliteMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-sqlite"]
});

// 获取可用工具列表
console.log("可用工具:", sqliteMCPAgent.tools.map(tool => tool.name));

// 使用查询工具
const queryTool = sqliteMCPAgent.tools.query;
if (queryTool) {
  const result = await queryTool.call({
    query: "SELECT * FROM users LIMIT 5"
  });
  console.log("查询结果:", result);
}

// 关闭 MCP 客户端
await sqliteMCPAgent.shutdown();
