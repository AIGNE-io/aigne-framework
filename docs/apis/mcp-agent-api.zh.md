# MCP Agent API 参考

**中文** | [English](./mcp-agent-api.md)

MCP Agent 是为了与符合 Model Context Protocol (MCP) 的服务器进行交互的 Agent 实现。它可以调用由 MCP 服务器提供的工具、检索提示模板和访问资源。

## MCPAgent 类

`MCPAgent` 继承自 `Agent` 基类，专门用于与 MCP 服务器交互。

### 基本属性

| 属性名 | 类型 | 描述 |
|-------|------|------|
| `client` | `Client` | MCP 客户端实例，用于与 MCP 服务器通信 |
| `prompts` | `MCPPrompt[]` | MCP 服务器提供的提示模板列表 |
| `resources` | `MCPResource[]` | MCP 服务器提供的资源列表 |
| `isCallable` | `boolean` | 始终为 false，因为 MCPAgent 本身不可直接调用 |

### 构造函数

```typescript
constructor(options: MCPAgentOptions)
```

#### 参数

- `options`: `MCPAgentOptions` - MCPAgent 配置选项

  | 选项名 | 类型 | 描述 |
  |-------|------|------|
  | `client` | `Client` | MCP 客户端实例 |
  | `prompts` | `MCPPrompt[]` | 可选的提示模板列表 |
  | `resources` | `MCPResource[]` | 可选的资源列表 |

### 静态方法

#### `from`

创建 MCPAgent 的工厂方法，可以从服务器选项或 MCPAgentOptions 创建实例。

```typescript
static from(options: MCPServerOptions): Promise<MCPAgent>;
static from(options: MCPAgentOptions): MCPAgent;
```

##### 参数

- `options`: `MCPServerOptions | MCPAgentOptions` - 服务器选项或 MCPAgent 配置

##### 返回值

- `MCPAgent | Promise<MCPAgent>` - 返回创建的 MCPAgent 实例或创建实例的 Promise

#### `fromTransport`

从传输接口创建 MCPAgent 的私有静态方法。

```typescript
private static async fromTransport(transport: Transport): Promise<MCPAgent>
```

##### 参数

- `transport`: `Transport` - MCP 传输接口

##### 返回值

- `Promise<MCPAgent>` - 返回创建的 MCPAgent 实例

### 方法

#### `process`

MCPAgent 本身不支持处理，所以这个方法始终抛出错误。

```typescript
async process(_input: AgentInput, _context?: Context): Promise<AgentOutput>
```

##### 参数

- `_input`: `AgentInput` - 输入数据（未使用）
- `_context`: `Context` (可选) - 执行上下文（未使用）

##### 返回值

- 总是抛出错误，不返回值

#### `shutdown`

关闭 MCPAgent 并释放资源。

```typescript
async shutdown()
```

## MCPTool 类

`MCPTool` 是用于调用 MCP 服务器提供的工具的 Agent 实现。

### 基本属性

| 属性名 | 类型 | 描述 |
|-------|------|------|
| `client` | `Client` | MCP 客户端实例 |
| `mcpServer` | `string \| undefined` | MCP 服务器名称 |

### 方法

#### `process`

调用 MCP 工具并返回结果。

```typescript
async process(input: AgentInput): Promise<CallToolResult>
```

##### 参数

- `input`: `AgentInput` - 输入数据，将作为参数传递给 MCP 工具

##### 返回值

- `Promise<CallToolResult>` - 返回 MCP 工具调用的结果

## MCPPrompt 类

`MCPPrompt` 是用于获取 MCP 服务器提供的提示模板的 Agent 实现。

### 基本属性

| 属性名 | 类型 | 描述 |
|-------|------|------|
| `client` | `Client` | MCP 客户端实例 |
| `mcpServer` | `string \| undefined` | MCP 服务器名称 |

### 方法

#### `process`

获取 MCP 提示模板并返回结果。

```typescript
async process(input: AgentInput): Promise<GetPromptResult>
```

##### 参数

- `input`: `AgentInput` - 输入数据，将作为参数传递给 MCP 提示模板

##### 返回值

- `Promise<GetPromptResult>` - 返回 MCP 提示模板的结果

## MCPResource 类

`MCPResource` 是用于访问 MCP 服务器提供的资源的 Agent 实现。

### 基本属性

| 属性名 | 类型 | 描述 |
|-------|------|------|
| `client` | `Client` | MCP 客户端实例 |
| `mcpServer` | `string \| undefined` | MCP 服务器名称 |
| `uri` | `string` | 资源 URI 或 URI 模板 |

### 构造函数

```typescript
constructor(options: MCPResourceOptions)
```

#### 参数

- `options`: `MCPResourceOptions` - MCPResource 配置选项

  | 选项名 | 类型 | 描述 |
  |-------|------|------|
  | `client` | `Client` | MCP 客户端实例 |
  | `uri` | `string` | 资源 URI 或 URI 模板 |

### 方法

#### `process`

读取 MCP 资源并返回结果。

```typescript
async process(input: { [key: string]: string }): Promise<ReadResourceResult>
```

##### 参数

- `input`: `{ [key: string]: string }` - 用于扩展 URI 模板的键值对

##### 返回值

- `Promise<ReadResourceResult>` - 返回读取的 MCP 资源

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
};
```

### `StdioServerParameters`

定义基于标准输入/输出的 MCP 服务器参数。

```typescript
interface StdioServerParameters {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}
```

### `MCPResourceOptions`

定义 MCPResource 的配置选项。

```typescript
interface MCPResourceOptions extends MCPToolBaseOptions<{ [key: string]: never }, ReadResourceResult> {
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
  ExecutionEngine,
  MCPAgent
} from "@aigne/core-next";

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
const engine = new ExecutionEngine({
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
const result = await engine.call(
  agent,
  "extract content from https://www.arcblock.io"
);

console.log(result);
// 输出示例:
// {
//   text: "The content extracted from the website [ArcBlock](https://www.arcblock.io) is as follows:\n\n---\n\n**Redefining Software Architect and Ecosystems**\n\nA total solution for building decentralized applications ..."
// }

// 关闭执行引擎
await engine.shutdown();
```

### 使用其他 MCP 服务器

除了 Puppeteer MCP 服务器外，你还可以使用其他 MCP 服务器，如 SQLite MCP 服务器：

```typescript
import { MCPAgent } from "@aigne/core-next";

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
