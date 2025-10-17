# MCP Agent

`MCPAgent` 是一种专门的 Agent，旨在与遵循**模型上下文协议 (Model Context Protocol, MCP)** 的外部系统进行交互。它充当一座桥梁，允许您的 AIGNE 应用程序连接到远程 MCP 服务器，并利用其功能——例如工具、提示和资源——就好像它们是框架的原生组件一样。

这使得与各种外部服务的无缝集成成为可能，从数据库连接器、Web 自动化工具到专有的企业系统，只要它们暴露了符合 MCP 的接口。

主要功能包括：
- **多种传输协议**：通过标准 I/O (`stdio`)、服务器发送事件 (`sse`) 或 `streamableHttp` 连接到 MCP 服务器。
- **自动发现**：自动发现并注册所连接 MCP 服务器上可用的工具、提示和资源。
- **稳健的连接管理**：为基于网络的传输提供自动重连功能，以处理暂时的连接问题。

## MCPAgent 如何工作

`MCPAgent` 封装了连接到 MCP 服务器并将其提供的功能转换为 AIGNE 构造的逻辑。当 `MCPAgent` 初始化时，它会连接到指定的服务器，并查询其可用的工具、提示和资源。然后，这些功能会分别作为 `skills`、`prompts` 和 `resources` 动态附加到 Agent 实例上，使其在您的 AIGNE 工作流中可以直接访问。

```d2
direction: right
style: {
  font-size: 14
}

"AIGNE 应用程序" -> aigne.invoke

subgraph "AIGNE 框架" {
  aigne.invoke -> mcp_agent: "MCPAgent" {
    shape: hexagon
    style.fill: "#D1E7DD"
  }
}

subgraph "传输层 (网络 / Stdio)" {
  mcp_agent -> transport: "MCP 请求"
  transport -> mcp_agent: "MCP 响应"
}

transport -> "外部 MCP 服务器"

subgraph "外部系统" {
 "外部 MCP 服务器" -> "工具"
 "外部 MCP 服务器" -> "提示"
 "外部 MCP 服务器" -> "资源"
}
```

## 创建 MCPAgent

您可以使用静态 `MCPAgent.from()` 方法创建一个 `MCPAgent` 实例。这个工厂方法支持多种配置模式，具体取决于您需要如何连接到 MCP 服务器。

### 1. 通过标准 I/O (Stdio) 连接

这种方法非常适合将 MCP 服务器作为本地子进程运行。`MCPAgent` 通过其标准输入和输出流与服务器通信。

<x-field-group>
  <x-field data-name="command" data-type="string" data-required="true" data-desc="执行以启动 MCP 服务器进程的命令。"></x-field>
  <x-field data-name="args" data-type="string[]" data-required="false" data-desc="传递给命令的字符串参数数组。"></x-field>
  <x-field data-name="env" data-type="Record<string, string>" data-required="false" data-desc="为子进程设置的环境变量。"></x-field>
</x-field-group>

```javascript 连接到本地文件系统服务器 icon=logos:javascript
import { MCPAgent } from "@aigne/core";

// 通过运行命令行服务器创建一个 MCPAgent
await using mcpAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
});

console.log('Connected to:', mcpAgent.name);

// 访问文件系统服务器提供的技能
const fileReader = mcpAgent.skills.read_file;
if (fileReader) {
  const result = await fileReader.invoke({ path: "./package.json" });
  console.log(result);
}
```

### 2. 通过网络 (SSE 或 StreamableHTTP) 连接

这是通过网络连接到远程 MCP 服务器的标准方法。您可以选择两种传输协议：
*   `sse`：服务器发送事件，一种简单且广泛支持的流式传输协议。
*   `streamableHttp`：一种更先进的双向流式传输协议。

<x-field-group>
  <x-field data-name="url" data-type="string" data-required="true" data-desc="远程 MCP 服务器端点的 URL。"></x-field>
  <x-field data-name="transport" data-type="'sse' | 'streamableHttp'" data-default="sse" data-required="false">
    <x-field-desc markdown>要使用的传输协议。默认为 `sse`。</x-field-desc>
  </x-field>
  <x-field data-name="opts" data-type="object" data-required="false" data-desc="传递给底层传输客户端的附加选项（例如，用于请求头和身份验证）。"></x-field>
  <x-field data-name="timeout" data-type="number" data-default="60000" data-required="false">
    <x-field-desc markdown>请求超时时间（毫秒）。</x-field-desc>
  </x-field>
  <x-field data-name="maxReconnects" data-type="number" data-default="10" data-required="false">
    <x-field-desc markdown>如果连接丢失，尝试重新连接的最大次数。设置为 `0` 可禁用。</x-field-desc>
  </x-field>
  <x-field data-name="shouldReconnect" data-type="(error: Error) => boolean" data-required="false">
    <x-field-desc markdown>一个函数，根据收到的错误返回 `true` 以决定是否应尝试重新连接。</x-field-desc>
  </x-field>
</x-field-group>

```javascript 通过 StreamableHTTP 连接 icon=logos:javascript
import { MCPAgent } from "@aigne/core";

// 使用 StreamableHTTP 服务器连接创建一个 MCPAgent
await using mcpAgent = await MCPAgent.from({
  url: `http://localhost:3000/mcp`,
  transport: "streamableHttp",
});

console.log('Connected to:', mcpAgent.name);

const echoSkill = mcpAgent.skills.echo;
if (echoSkill) {
  const result = await echoSkill.invoke({ message: "Hello, World!" });
  console.log(result);
}
```

### 3. 使用预配置的客户端

如果您已经实例化并配置了一个 MCP `Client` 对象，您可以直接传递它来创建一个 `MCPAgent`。这对于需要对客户端配置进行精细控制的高级场景非常有用。

<x-field-group>
  <x-field data-name="client" data-type="Client" data-required="true" data-desc="一个预配置的 MCP 客户端实例。"></x-field>
  <x-field data-name="prompts" data-type="MCPPrompt[]" data-required="false" data-desc="一个可选的预定义 MCP 提示数组。"></x-field>
  <x-field data-name="resources" data-type="MCPResource[]" data-required="false" data-desc="一个可选的预定义 MCP 资源数组。"></x-field>
</x-field-group>

```javascript 从客户端实例创建 icon=logos:javascript
import { MCPAgent } from "@aigne/core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// 手动创建和配置客户端
const client = new Client({ name: "test-client", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: "bun",
  args: ["./mock-mcp-server.ts"],
});
await client.connect(transport);

// 从现有的客户端实例创建一个 MCPAgent
await using mcpAgent = MCPAgent.from({
  name: client.getServerVersion()?.name,
  client,
});

console.log('Connected to:', mcpAgent.name);
```

## 访问服务器功能

一旦 `MCPAgent` 连接成功，它会通过其属性暴露服务器的工具、提示和资源。

### 访问技能

服务器端的工具作为 `skills` 暴露在 `MCPAgent` 实例上。您可以通过名称访问它们并使用其 `invoke` 方法。这些技能可以传递给其他 Agent，例如 `AIAgent`，以赋予它们新的能力。

```javascript 使用 MCPAgent 的技能 icon=logos:javascript
// 假设 `mcpAgent` 是一个已初始化的 MCPAgent
const echoSkill = mcpAgent.skills.echo;

if (echoSkill) {
  const result = await echoSkill.invoke({ message: "Hello from AIGNE!" });
  console.log(result);
  // 预期输出：
  // {
  //   "content": [
  //     { "text": "Tool echo: Hello from AIGNE!", "type": "text" }
  //   ]
  // }
}
```

### 访问提示

服务器定义的提示可在 `prompts` 属性下找到。这对于从服务器检索预定义的复杂提示结构非常有用。

```javascript 访问服务器端提示 icon=logos:javascript
// 假设 `mcpAgent` 是一个已初始化的 MCPAgent
const echoPrompt = mcpAgent.prompts.echo;

if (echoPrompt) {
  const result = await echoPrompt.invoke({ message: "Hello!" });
  console.log(result);
  // 预期输出：
  // {
  //   "messages": [
  //     {
  //       "content": { "text": "Please process this message: Hello!", "type": "text" },
  //       "role": "user"
  //     },
  //     ...
  //   ]
  // }
}
```

### 访问资源

服务器托管的资源或资源模板可以通过 `resources` 属性访问。这允许您通过扩展 URI 模板从服务器读取数据。

```javascript 读取服务器端资源 icon=logos:javascript
// 假设 `mcpAgent` 是一个已初始化的 MCPAgent
const echoResource = mcpAgent.resources.echo;

if (echoResource) {
  const result = await echoResource.invoke({ message: "Hello!" });
  console.log(result);
  // 预期输出：
  // {
  //   "contents": [
  //     { "text": "Resource echo: Hello!", "uri": "echo://Hello!" }
  //   ]
  // }
}
```

## 连接拆卸

正确关闭与 MCP 服务器的连接以释放资源非常重要。

### 手动关闭

您可以显式调用 `shutdown()` 方法。

```javascript 手动关闭 Agent icon=logos:javascript
const mcpAgent = await MCPAgent.from({
  url: `http://localhost:3000/mcp`,
});

// ... 使用 Agent

await mcpAgent.shutdown();
```

### 使用 `using` 自动关闭

对于支持 `using` 声明 (ES2023) 的环境，当 Agent 超出作用域时，其连接将自动关闭。这是管理 Agent 生命周期的推荐方法。

```javascript 使用 'using' 自动关闭 icon=logos:javascript
async function connectAndUseAgent() {
  await using mcpAgent = await MCPAgent.from({
    url: `http://localhost:3000/mcp`,
  });

  // 在这里使用 Agent...
  const echo = mcpAgent.skills.echo;
  if (echo) await echo.invoke({ message: "Test" });
} // <-- mcpAgent.shutdown() 会在这里自动调用。
```

## 总结

`MCPAgent` 是通过与外部系统集成来扩展 AIGNE 框架能力的关键组件。通过抽象连接和通信逻辑，它允许您将外部工具和数据源视为代理工作流中的一等公民。

有关如何使用 `MCPAgent` 提供的技能的更多信息，请参阅 [AI Agent](./developer-guide-agents-ai-agent.md) 文档。