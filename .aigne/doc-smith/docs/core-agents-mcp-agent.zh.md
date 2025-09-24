# MCP Agent

欢迎阅读 `MCPAgent` 文档！本节将帮助您了解 `MCPAgent` 是什么、它如何工作以及为什么它是使您的 AI Agent 真正可互操作的关键部分。`MCPAgent` 旨在通过一种称为模型上下文协议（Model Context Protocol，MCP）的标准化通信方法，将您的 Agent 的能力暴露给其他应用程序和服务。

要了解如何在实践中运行 `MCPAgent`，请查看 [serve-mcp command](./cli-command-reference-serve-mcp.md)。要深入了解核心 AI Agent，请参阅 [AIAgent documentation](./core-agents-ai-agent.md)。

## 什么是模型上下文协议（MCP）？

模型上下文协议（MCP）就像 AI Agent 的通用语言。想象一下，您有由不同团队构建的不同 AI Agent 或应用程序。如果没有共同的交流方式，集成它们将非常困难。MCP 提供了这种共同语言，允许不同的系统无缝地理解和与您的 Agent 的功能进行交互。它确保任何“说”MCP 的应用程序都可以连接并使用您的 Agent。

## MCPAgent 如何工作

`MCPAgent` 充当桥梁。它获取您现有的 AI Agent（例如 `AIAgent`）并对其进行封装，通过 MCP 标准呈现其能力。当另一个应用程序想要与您的 Agent 交互时，它会向 `MCPAgent` 发送一个 MCP 请求。然后 `MCPAgent` 翻译此请求，将其传递给您的底层 AI 逻辑，获取响应，并将其发送回请求的应用程序，所有这些都遵循 MCP 标准。

您通常使用 AIGNE CLI 中的 `aigne serve-mcp` 命令启动 `MCPAgent`。此命令使您的 Agent 作为服务可用，其他应用程序可以连接到该服务。

以下是一个简单的图表，说明了 `MCPAgent` 如何适应交互流程：

```d2
direction: down

Client-Application: {
  label: "客户端应用"
  shape: rectangle
}

MCPAgent-Service: {
  label: "MCPAgent 服务\n(aigne serve-mcp)"
  shape: rectangle
}

Your-AI-Agent: {
  label: "您的 AI Agent\n(例如，AIAgent, FunctionAgent)"
  shape: rectangle
}

Client-Application -> MCPAgent-Service: "1. MCP 请求 (JSON)"
MCPAgent-Service -> Your-AI-Agent: "2. 翻译并调用 Agent 逻辑"
Your-AI-Agent -> MCPAgent-Service: "3. Agent 响应"
MCPAgent-Service -> Client-Application: "4. MCP 响应 (JSON)"
```

## 总结

`MCPAgent` 对于创建可互操作的 AI Agent 至关重要，它允许它们使用模型上下文协议与各种应用程序进行通信和集成。通过通过标准接口公开您的 Agent 的能力，`MCPAgent` 增强了其在更广泛的 AI 服务生态系统中的覆盖范围和实用性。要开始运行您自己的 `MCPAgent`，请参阅 [serve-mcp command documentation](./cli-command-reference-serve-mcp.md)。