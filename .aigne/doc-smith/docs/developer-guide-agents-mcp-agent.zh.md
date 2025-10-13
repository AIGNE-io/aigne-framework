# MCPAgent

`MCPAgent` 是一个专门的 Agent，旨在与实现模型上下文协议（MCP）的服务器进行交互。它充当您的应用程序和 MCP 服务器之间的桥梁，使您能够无缝地连接它们、发现其功能，并利用其工具、提示和资源。

该 Agent 通过提供标准化的通信接口来简化外部服务的集成，无论服务器是作为本地命令行进程运行，还是通过 HTTP 在网络上可用。

## 架构概述

`MCPAgent` 扩展了基础 `Agent` 类，并封装了一个 MCP `Client` 来管理与远程服务器的连接和通信。它会自动发现服务器提供的内容，并将其表示为原生的 AIGNE 组件，如技能、提示和资源。

# MCPAgent

`MCPAgent` 是一个专门的 Agent，旨在与实现模型上下文协议（MCP）的服务器进行交互。它充当您的应用程序和 MCP 服务器之间的桥梁，使您能够无缝地连接它们、发现其功能，并利用其工具、提示和资源。

该 Agent 通过提供标准化的通信接口来简化外部服务的集成，无论服务器是作为本地命令行进程运行，还是通过 HTTP 在网络上可用。

## 架构概述

`MCPAgent` 扩展了基础 `Agent` 类，并封装了一个 MCP `Client` 来管理与远程服务器的连接和通信。它会自动发现服务器提供的内容，并将其表示为原生的 AIGNE 组件，如技能、提示和资源。
```d2
direction: down

Application: {
  label: "你的应用程序"
  shape: rectangle
}

MCPAgent: {
  label: "MCPAgent"
  shape: rectangle

  MCP-Client: {
    label: "MCP 客户端\n（管理连接）"
  }
}

Agent-Base: {
  label: "Agent (基类)"
}

MCP-Server: {
  label: "MCP 服务器\n（本地 CLI 或远程 HTTP）"
  shape: rectangle
  style.stroke-dash: 4

  Server-Offerings: {
    label: "服务器提供的内容"
    grid-columns: 3
    Skills: {}
    Prompts: {}
    Resources: {}
  }
}

Application -> MCPAgent: "1. 使用"
MCPAgent -> Agent-Base: "extends" {
  style.stroke-dash: 2
}
MCPAgent.MCP-Client -> MCP-Server: "2. 连接与通信"
MCP-Server.Server-Offerings -> MCPAgent: "3. 发现" {
  style.stroke-dash: 2
}
MCPAgent -> Application: "4. 提供组件\n（技能、提示、资源）"

```

## 创建 MCPAgent

创建 `MCPAgent` 主要有两种方式：通过建立与 MCP 服务器的新连接，或使用预先配置的 MCP 客户端实例。

### 1. 从服务器连接创建

静态 `MCPAgent.from()` 方法是创建 Agent 的最常用方式。它负责处理连接过程并自动发现服务器的功能。

#### 使用 SSE 传输

你可以使用服务器发送事件（SSE）连接到远程 MCP 服务器。当提供 URL 时，这是默认的传输机制。

**参数**

<x-field-group>
  <x-field data-name="url" data-type="string" data-required="true" data-desc="远程 MCP 服务器的 URL。"></x-field>
  <x-field data-name="transport" data-type="'sse' | 'streamableHttp'" data-default="'sse'" data-desc="指定传输协议。默认为 'sse'。"></x-field>
  <x-field data-name="timeout" data-type="number" data-default="60000" data-desc="请求超时时间（毫秒）。"></x-field>
  <x-field data-name="maxReconnects" data-type="number" data-default="10" data-desc="如果连接丢失，最大自动重连尝试次数。设置为 0 可禁用。"></x-field>
  <x-field data-name="shouldReconnect" data-type="(error: Error) => boolean" data-desc="一个函数，用于根据收到的错误判断是否应尝试重连。默认对所有错误都返回 true。"></x-field>
  <x-field data-name="opts" data-type="SSEClientTransportOptions" data-desc="传递给底层 SSEClientTransport 的附加选项。"></x-field>
</x-field-group>

**示例**

```typescript
import { MCPAgent } from "@aigne/core";

// 使用 SSE 传输创建 MCPAgent 的示例
const agent = await MCPAgent.from({
  url: "http://example.com/mcp-server",
});

console.log("MCPAgent created from SSE server:", agent.name);
```

#### 使用 StreamableHTTP 传输

对于支持该功能的服务器，你可以使用 `streamableHttp` 传输，这可以提供性能优势。

**示例**

```typescript
import { MCPAgent } from "@aigne/core";

// 使用 StreamableHTTP 传输创建 MCPAgent 的示例
const agent = await MCPAgent.from({
  url: "http://example.com/mcp-server",
  transport: "streamableHttp",
});

console.log("MCPAgent created from StreamableHTTP server:", agent.name);
```

#### 使用 Stdio 传输

要连接到通过标准输入/输出（stdio）通信的本地 MCP 服务器，你可以指定要执行的命令。

**参数**

<x-field-group>
    <x-field data-name="command" data-type="string" data-required="true" data-desc="启动 MCP 服务器进程要执行的命令。"></x-field>
    <x-field data-name="args" data-type="string[]" data-desc="传递给命令的字符串参数数组。"></x-field>
    <x-field data-name="env" data-type="Record<string, string>" data-desc="为进程设置的环境变量。"></x-field>
</x-field-group>

**示例**

```typescript
import { MCPAgent } from "@aigne/core";

// 使用 Stdio 传输创建 MCPAgent 的示例
const agent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});

console.log("MCPAgent created from stdio server:", agent.name);
```

### 2. 从预配置的客户端创建

如果你已有一个现有的 MCP `Client` 实例，可以直接将其传递给 `MCPAgent` 构造函数。这对于需要单独管理客户端生命周期或配置的场景很有用。

**参数**

<x-field-group>
    <x-field data-name="client" data-type="Client" data-required="true" data-desc="一个预先配置的 MCP Client 实例。"></x-field>
    <x-field data-name="prompts" data-type="MCPPrompt[]" data-desc="一个可选的预定义 MCP 提示数组。"></x-field>
    <x-field data-name="resources" data-type="MCPResource[]" data-desc="一个可选的预定义 MCP 资源数组。"></x-field>
</x-field-group>

**示例**

```typescript
import { MCPAgent } from "@aigne/core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// 使用直接客户端实例创建 MCPAgent 的示例
const client = new Client({ name: "MyClient", version: "1.0.0" });
await client.connect(new SSEClientTransport(new URL("http://example.com/mcp-server")));

const agent = new MCPAgent({
  name: "MyDirectAgent",
  client,
});

console.log("MCPAgent created from direct client:", agent.name);
```

## 属性

`MCPAgent` 实例通过几个属性提供对服务器功能的访问。

### `client`

用于与 MCP 服务器进行所有通信的底层 `Client` 实例。

<x-field data-name="client" data-type="Client" data-desc="MCP 客户端实例。"></x-field>

### `skills`

MCP 服务器暴露的工具会被自动发现，并作为 `Agent` 实例数组在 `skills` 属性中提供。你可以通过索引或名称访问技能。

<x-field data-name="skills" data-type="Agent[]" data-desc="从服务器发现的可调用技能数组。"></x-field>

**示例：访问技能**

```typescript
// 列出所有可用的技能名称
const skillNames = agent.skills.map(skill => skill.name);
console.log("Available skills:", skillNames);

// 通过名称访问特定技能
const getTickerSkill = agent.skills["get-ticker"];
if (getTickerSkill) {
  console.log("Found skill:", getTickerSkill.description);
}
```

### `prompts`

可通过 `prompts` 数组访问服务器提供的提示。

<x-field data-name="prompts" data-type="MCPPrompt[]" data-desc="服务器提供的 MCP 提示数组。"></x-field>

**示例：访问提示**

```typescript
// 通过名称访问提示
const examplePrompt = agent.prompts['example-prompt'];

if (examplePrompt) {
    const result = await examplePrompt.invoke({
        variable1: "value1"
    });
    console.log(result.content);
}
```

### `resources`

资源（包括资源模板）可在 `resources` 数组中找到。

<x-field data-name="resources" data-type="MCPResource[]" data-desc="服务器提供的 MCP 资源数组。"></x-field>

**示例：访问资源**

```typescript
// 通过名称访问资源
const userDataResource = agent.resources['user-data'];

if (userDataResource) {
    const result = await userDataResource.invoke({
        userId: "123"
    });
    console.log(result.content);
}
```

## 方法

### `shutdown()`

此方法通过关闭其与 MCP 服务器的连接来干净地关闭 Agent。在完成 Agent 的使用后，调用此方法以释放资源至关重要。

**示例：关闭 Agent**

```typescript
// 建议使用 finally 块以确保 shutdown 被调用
try {
  // 使用 Agent...
  const ticker = await agent.skills['get-ticker'].invoke({
    exchange: "coinbase",
    symbol: "BTC/USD",
  });
  console.log(ticker);
} finally {
  await agent.shutdown();
  console.log("Agent has been shut down.");
}
```

`MCPAgent` 还支持 `Symbol.asyncDispose` 方法，允许你将其与 `using` 语句一起使用，以实现自动资源管理。

**示例：使用 `await using` 自动关闭**

```typescript
import { MCPAgent } from "@aigne/core";

async function main() {
    await using agent = await MCPAgent.from({
        url: "http://example.com/mcp-server",
    });
    
    // 在此代码块结束时，Agent 将被自动关闭
    const skills = agent.skills.map(s => s.name);
    console.log("Available skills:", skills);
}

main();
```