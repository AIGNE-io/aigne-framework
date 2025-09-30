# MCP Agent

`MCPAgent` 是一个专门的 Agent，充当客户端，用于连接遵循模型上下文协议 (MCP) 的其他 AI Agent 和服务。可以把它看作一座桥梁，允许您的 AIGNE 应用程序与外部 Agent 通信并使用其功能，无论这些 Agent 是在远程服务器上运行，还是在本地机器上作为独立程序运行。

与其他直接执行任务的 Agent 不同，`MCPAgent` 的主要作用是暴露远程 Agent 的功能——例如其工具（技能）、提示和资源——使它们在您的项目中可以像原生组件一样被访问。`MCPAgent` 本身不可调用；您需要与它导入的技能和资源进行交互。

主要功能包括：
- **互操作性**：连接到任何符合 MCP 规范的 AI 服务。
- **多种传输方式**：支持通过 Web (HTTP/SSE) 和本地命令行应用程序 (stdio) 进行连接。
- **自动发现**：自动识别并集成远程 Agent 的技能、提示和资源。
- **弹性连接**：包含自动重连逻辑，以处理临时网络问题。

## 创建 MCPAgent

您可以使用静态的 `MCPAgent.from()` 方法创建 `MCPAgent` 实例。该方法根据您希望如何连接到远程 Agent 接受不同的选项。

### 连接到 Web 服务器 (HTTP/SSE)

使用此方法连接可通过 URL 访问的 Agent。这对于托管在 Web 或本地网络上的服务很常见。它支持服务器发送事件 (SSE) 和可流式传输的 HTTP 两种传输方式。

**参数**

<x-field-group>
  <x-field data-name="url" data-type="string" data-required="true" data-desc="MCP 服务器的 URL。"></x-field>
  <x-field data-name="transport" data-type="'sse' | 'streamableHttp'" data-default="sse" data-required="false">
    <x-field-desc markdown>指定传输协议。使用 `'sse'` 表示服务器发送事件，或使用 `'streamableHttp'` 表示可流式传输的 HTTP。</x-field-desc>
  </x-field>
  <x-field data-name="maxReconnects" data-type="number" data-default="10" data-required="false" data-desc="如果连接丢失，尝试重新连接的最大次数。设置为 0 可禁用。"></x-field>
  <x-field data-name="timeout" data-type="number" data-default="60000" data-required="false" data-desc="请求超时时间，单位为毫秒。"></x-field>
</x-field-group>

**示例**

```javascript Connecting to an SSE Server icon=logos:javascript
import { MCPAgent } from "@aigne/core";

// Create an MCPAgent using an SSE server connection
const mcpAgent = await MCPAgent.from({
  url: `http://localhost:8080/sse`,
  transport: "sse",
});

console.log('Connected to:', mcpAgent.name); // Output: "example-server"

// The agent is automatically cleaned up when it goes out of scope
await using agent = mcpAgent;
```

### 连接到本地程序 (Stdio)

此方法允许您连接到在同一台机器上作为命令行应用程序运行的 Agent。AIGNE 将启动该进程，并通过其标准输入/输出 (stdio) 与之通信。

**参数**

<x-field-group>
  <x-field data-name="command" data-type="string" data-required="true" data-desc="用于启动 Agent 进程的命令（例如 'bun'、'node'）。"></x-field>
  <x-field data-name="args" data-type="string[]" data-required="false" data-desc="要传递给脚本的命令行参数数组。"></x-field>
  <x-field data-name="env" data-type="Record<string, string>" data-required="false" data-desc="为子进程提供的额外环境变量。"></x-field>
</x-field-group>

**示例**

```javascript Connecting to a Local Script icon=logos:javascript
import { MCPAgent } from "@aigne/core";
import { join } from "node:path";

// Create an MCPAgent from a command-line server
const mcpAgent = await MCPAgent.from({
  command: "bun",
  args: [join(import.meta.dir, "./mock-mcp-server.ts")],
});

console.log('Connected to:', mcpAgent.name); // Output: "example-server"

// Clean up the agent connection
await mcpAgent.shutdown();
```

### 使用预配置的客户端

对于高级用例，您可以自行实例化一个 MCP `Client`，并将其直接传递给 `MCPAgent`。这使您可以完全控制客户端的配置。

**示例**

```javascript Using a Client Instance icon=logos:javascript
import { MCPAgent } from "@aigne/core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { join } from "node:path";

// Create and configure the client manually
const client = new Client({ name: "test-client", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: "bun",
  args: [join(import.meta.dir, "./mock-mcp-server.ts")],
});
await client.connect(transport);

// Create an MCPAgent from the existing client instance
await using mcpAgent = MCPAgent.from({
  name: client.getServerVersion()?.name,
  client,
});

console.log('Connected to:', mcpAgent.name); // Output: "example-server"
```

## 访问远程功能

连接后，`MCPAgent` 会根据远程 Agent 提供的功能填充其 `skills`、`prompts` 和 `resources` 属性。

### 访问技能

远程工具会作为技能暴露出来。您可以通过名称从 `skills` 属性访问它们并调用。

```javascript Invoking a Remote Skill icon=logos:javascript
// Assuming mcpAgent is an initialized MCPAgent instance
const echoSkill = mcpAgent.skills.echo;

if (echoSkill) {
  const result = await echoSkill.invoke({ message: "Hello, MCP!" });
  console.log(result);
  // Output:
  // {
  //   content: [ { type: 'text', text: 'Tool echo: Hello, MCP!' } ]
  // }
}
```

### 访问提示

远程提示可在 `prompts` 属性上找到，可以调用它们以根据模板获取一组消息。

```javascript Accessing a Remote Prompt icon=logos:javascript
// Assuming mcpAgent is an initialized MCPAgent instance
const echoPrompt = mcpAgent.prompts.echo;

if (echoPrompt) {
  const result = await echoPrompt.invoke({ message: "Hello, Prompt!" });
  console.log(result);
  // Output:
  // {
  //   messages: [
  //     { role: 'user', content: { type: 'text', text: 'Please process this message: Hello, Prompt!' } }
  //   ]
  // }
}
```

### 访问资源

远程资源可以通过 `resources` 属性读取。

```javascript Reading a Remote Resource icon=logos:javascript
// Assuming mcpAgent is an initialized MCPAgent instance
const echoResource = mcpAgent.resources.echo;

if (echoResource) {
  const result = await echoResource.invoke({ message: "Hello, Resource!" });
  console.log(result);
  // Output:
  // {
  //   contents: [
  //     { uri: 'echo://Hello, Resource!', text: 'Resource echo: Hello, Resource!' }
  //   ]
  // }
}
```

## 关闭连接

正确关闭与 MCP 服务器的连接以释放资源非常重要。您可以手动执行此操作，也可以使用 `await using` 语法进行自动清理。

### 手动关闭

您可以显式调用 Agent 实例上的 `shutdown()` 方法。

```javascript Manual Shutdown icon=logos:javascript
import { MCPAgent } from "@aigne/core";

const mcpAgent = await MCPAgent.from({
  url: `http://localhost:8080/mcp`,
  transport: "streamableHttp",
});

// ... use the agent

// Manually close the connection
await mcpAgent.shutdown();
console.log("Connection closed.");
```

### 使用 await using 自动关闭

`MCPAgent` 与现代 JavaScript 中的 [显式资源管理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using) 功能兼容。这会在变量超出作用域时自动调用关闭逻辑。

```javascript Automatic Shutdown icon=logos:javascript
import { MCPAgent } from "@aigne/core";

async function connectAndUseAgent() {
  // The connection will be automatically shut down at the end of this function
  await using mcpAgent = await MCPAgent.from({
    url: `http://localhost:8080/mcp`,
    transport: "streamableHttp",
  });

  console.log(`Using agent: ${mcpAgent.name}`);
  // ... interact with mcpAgent.skills, .prompts, etc.
}

await connectAndUseAgent();
console.log("Agent has been shut down.");
```