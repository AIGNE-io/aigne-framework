# MCPAgent: 在 AIGNE 框架中与模型上下文协议服务器交互

AIGNE 框架中的 MCPAgent 模块旨在促进与模型上下文协议 (Model Context Protocol, MCP) 服务器的交互。它为开发人员提供了使用不同传输方法（如 HTTP、服务器发送事件 (Server-Sent Events, SSE) 和标准输入输出 (Stdio)）连接 MCP 服务器的能力。典型的使用场景包括管理与远程服务器的连接，访问服务器提供的工具、提示和资源，以及确保服务器功能在客户端应用程序中的无缝集成。

## 使用 Stdio 传输创建 MCPAgent

通过 Stdio 传输创建 MCPAgent 涉及使用进程间通信与 MCP 服务器建立连接。这种方法适合需要直接进程间通信的场景，提供了更安全和高效的数据交换，而无需通过网络公开服务。开发人员可以利用此方法直接从本地客户端设置中使用服务器提供的工具、提示和资源，确保交互在受控环境内进行。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-basic-create-agent"
spyOn(MCPAgent, "from").mockReturnValueOnce( new MCPAgent({ name: "ccxt", client: mock() as unknown as MCPAgent["client"], skills: [ FunctionAgent.from({ name: "get-ticker", process: () => ({}), }), ], }), ); const ccxt = await MCPAgent.from({ command: "npx", args: ["-y", "@mcpfun/mcp-server-ccxt"], }); console.log(ccxt.skills); const getTicker = ccxt.skills["get-ticker"]; assert(getTicker);
```

## 探索和调用 MCPAgent 技能

一旦实例化了 MCPAgent，其技能（对应于各种服务器功能）即可被探索和利用。通过列出和调用这些技能，开发人员可以与 MCP 服务器提供的多种功能进行交互，如获取市场数据、交易操作等。这一过程不仅优化了服务器功能在客户端环境中的集成，也通过允许直接调用预定义的服务器技能来简化工作流程。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-basic-explore-skills"
console.log(ccxt.skills); const getTicker = ccxt.skills["get-ticker"]; assert(getTicker); const result = await getTicker.invoke({ exchange: "coinbase", symbol: "ABT/USD" }); console.log(result);
```

## 使用可流式传输的 HTTP 来创建 MCPAgent

可流式传输的 HTTP 提供了一种通过 HTTP 连接到 MCP 服务器的方式，允许客户端和服务器之间连续的数据流。这种传输方法特别适用于需要实时数据交换的场景，如金融市场或任何需要最新信息的领域。通过利用这种传输方法，开发人员可以以最小的配置将动态和响应式的通信渠道集成到他们的应用程序中。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-streamable-http-create-agent"
spyOn(MCPAgent, "from").mockReturnValueOnce( new MCPAgent({ name: "ccxt", client: mock() as unknown as MCPAgent["client"], skills: [ FunctionAgent.from({ name: "get-ticker", process: () => ({}), }), ], }), ); const ccxt = await MCPAgent.from({ url: "http://api.example.com/mcp", transport: "streamableHttp", });
```

本文件详细说明了如何利用 AIGNE 框架中的 MCPAgent 与 MCP 服务器交互。通过创建具有多种传输选项的智能体，开发人员可以有效连接和利用 MCP 服务器的功能。通过探索和调用技能，可以扩展集成，最终增强应用程序功能。无论是使用 Stdio 进行直接通信还是使用可流式传输的 HTTP 进行实时数据交换，该基础架构都支持多样化的集成需求，同时保持高效和连接性。