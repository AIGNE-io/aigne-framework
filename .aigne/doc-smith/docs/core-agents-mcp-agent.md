# MCP Agent

Welcome to the `MCPAgent` documentation! This section will help you understand what the `MCPAgent` is, how it works, and why it's a key part of making your AI agents truly interoperable. The `MCPAgent` is designed to expose your agent's capabilities to other applications and services using a standardized communication method called the Model Context Protocol (MCP).

To see how to run an `MCPAgent` in practice, check out the [serve-mcp command](./cli-command-reference-serve-mcp.md). For a deeper dive into the core AI agent, refer to the [AIAgent documentation](./core-agents-ai-agent.md).

## What is the Model Context Protocol (MCP)?

The Model Context Protocol (MCP) is like a universal language for AI agents. Imagine you have different AI agents or applications built by various teams. Without a common way to talk to each other, integrating them would be very difficult. MCP provides this common language, allowing different systems to understand and interact with your agent's functionalities seamlessly. It ensures that any application that "speaks" MCP can connect to and use your agent.

## How MCPAgent Works

The `MCPAgent` acts as a bridge. It takes your existing AI agent (such as an `AIAgent`) and wraps it, presenting its abilities through the MCP standard. When another application wants to interact with your agent, it sends an MCP request to the `MCPAgent`. The `MCPAgent` then translates this request, passes it to your underlying AI logic, gets the response, and sends it back to the requesting application, all while adhering to the MCP standard.

You typically start an `MCPAgent` using the `aigne serve-mcp` command from the AIGNE CLI. This command makes your agent available as a service that other applications can connect to.

Here's a simple diagram illustrating how the `MCPAgent` fits into the interaction flow:

```d2
direction: down

Client-Application: {
  label: "Client Application"
  shape: rectangle
}

MCPAgent-Service: {
  label: "MCPAgent Service\n(aigne serve-mcp)"
  shape: rectangle
}

Your-AI-Agent: {
  label: "Your AI Agent\n(e.g., AIAgent, FunctionAgent)"
  shape: rectangle
}

Client-Application -> MCPAgent-Service: "1. MCP Request (JSON)"
MCPAgent-Service -> Your-AI-Agent: "2. Translate & Invoke Agent Logic"
Your-AI-Agent -> MCPAgent-Service: "3. Agent Response"
MCPAgent-Service -> Client-Application: "4. MCP Response (JSON)"
```

## Summary

The `MCPAgent` is essential for creating interoperable AI agents, allowing them to communicate and integrate with diverse applications using the Model Context Protocol. By exposing your agent's capabilities through a standard interface, the `MCPAgent` enhances its reach and utility within a broader ecosystem of AI services. To get started with running your own `MCPAgent`, refer to the [serve-mcp command documentation](./cli-command-reference-serve-mcp.md).