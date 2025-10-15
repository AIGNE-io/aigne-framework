# Agent Types

The AIGNE Framework provides a suite of specialized agent types, each designed to perform a specific function. While all agents inherit from the base `Agent` class, these specialized implementations offer pre-built capabilities for common tasks, from interacting with AI models to orchestrating complex workflows. Understanding these types is key to building robust and efficient applications.

This section provides a high-level overview of the available agent types. For detailed implementation, configuration options, and code examples, please refer to the specific sub-document for each agent.

```d2
direction: down
style: {
  font-size: 14
  stroke-width: 2
  fill: "#f8f9fa"
  stroke: "#adb5bd"
}

Agent: {
  label: "Base Agent"
  shape: class
  style: {
    fill: "#e9ecef"
    stroke: "#495057"
  }
}

sub_agents: {
  AIAgent: {
    label: "AIAgent"
    tooltip: "Interacts with language models"
    style: { fill: "#dbe4ff" }
  }
  TeamAgent: {
    label: "TeamAgent"
    tooltip: "Orchestrates multiple agents"
    style: { fill: "#d1e7dd" }
  }
  ImageAgent: {
    label: "ImageAgent"
    tooltip: "Generates images"
    style: { fill: "#fff3cd" }
  }
  FunctionAgent: {
    label: "FunctionAgent"
    tooltip: "Wraps custom code"
    style: { fill: "#f8d7da" }
  }
  TransformAgent: {
    label: "TransformAgent"
    tooltip: "Performs data mapping"
    style: { fill: "#e2d9f3" }
  }
  MCPAgent: {
    label: "MCPAgent"
    tooltip: "Connects to external MCP systems"
    style: { fill: "#cfe2ff" }
  }
}

Agent -> sub_agents.AIAgent: Inherits
Agent -> sub_agents.TeamAgent: Inherits
Agent -> sub_agents.ImageAgent: Inherits
Agent -> sub_agents.FunctionAgent: Inherits
Agent -> sub_agents.TransformAgent: Inherits
Agent -> sub_agents.MCPAgent: Inherits
```

## Available Agent Types

The framework includes the following specialized agents, each tailored for a distinct purpose.

<x-cards data-columns="2">
  <x-card data-title="AI Agent" data-icon="lucide:bot" data-href="/developer-guide/agents/ai-agent">
    The primary agent for interacting with large language models (LLMs). It handles prompt construction, model invocation, and processing of AI-generated responses, including tool usage.
  </x-card>
  <x-card data-title="Team Agent" data-icon="lucide:users" data-href="/developer-guide/agents/team-agent">
    Orchestrates a group of agents to work together. It can manage workflows in sequential or parallel modes, enabling complex, multi-step problem-solving.
  </x-card>
  <x-card data-title="Image Agent" data-icon="lucide:image" data-href="/developer-guide/agents/image-agent">
    A specialized agent for interfacing with image generation models. It takes instructional prompts and generates visual content.
  </x-card>
  <x-card data-title="Function Agent" data-icon="lucide:function-square" data-href="/developer-guide/agents/function-agent">
    Wraps standard TypeScript or JavaScript functions, allowing you to integrate any custom code or business logic seamlessly into an agentic workflow.
  </x-card>
  <x-card data-title="Transform Agent" data-icon="lucide:shuffle" data-href="/developer-guide/agents/transform-agent">
    Performs declarative data transformations using JSONata expressions. It is ideal for mapping, restructuring, and converting data between different formats without writing procedural code.
  </x-card>
  <x-card data-title="MCP Agent" data-icon="lucide:plug-zap" data-href="/developer-guide/agents/mcp-agent">
    Connects to external systems and tools via the Model Context Protocol (MCP). This agent acts as a bridge, allowing your application to leverage external resources and capabilities.
  </x-card>
</x-cards>

## Summary

Choosing the correct agent type for a given task is a fundamental step in designing an effective AIGNE application. Each agent is a specialized tool designed for a specific job. By composing these agents, you can build sophisticated systems capable of handling a wide range of tasks.

For a deeper understanding of each agent's capabilities and configuration, please proceed to the detailed documentation for each type.

- **Next**: Learn about the [AI Agent](./developer-guide-agents-ai-agent.md), the core component for interacting with language models.