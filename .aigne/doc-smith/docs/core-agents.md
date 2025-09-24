# Agents

In the AIGNE framework, an Agent is like a specialized worker designed to perform a specific job. Think of them as the fundamental building blocks you use to create your AI-powered applications. Each agent has a unique role, and you can combine them to tackle complex, multi-step tasks.

This section introduces the main types of agents you'll be working with. Click on any card to learn more about what it does and how to use it.

<x-cards data-columns="2">
  <x-card data-title="AI Agent" data-href="/core/agents/ai-agent" data-icon="lucide:brain-circuit">
    The core of the system. The AI Agent is the primary worker that communicates with large language models (like GPT-4) to understand instructions, reason, and generate responses.
  </x-card>
  <x-card data-title="Function Agent" data-href="/core/agents/function-agent" data-icon="lucide:cog">
    A specialist that processes specific JavaScript functions. Use this agent to give your AI the ability to perform real-world actions, like sending an email or fetching data from an API.
  </x-card>
  <x-card data-title="Team Agent" data-href="/core/agents/team-agent" data-icon="lucide:users">
    The manager. A Team Agent orchestrates a group of other agents, assigning tasks and coordinating their efforts to solve complex problems that a single agent couldn't handle alone.
  </x-card>
  <x-card data-title="MCP Agent" data-href="/core/agents/mcp-agent" data-icon="lucide:share-2">
    The communicator. This agent makes your application interoperable by exposing its capabilities over the Model Context Protocol (MCP), allowing it to connect and interact with other external services.
  </x-card>
</x-cards>