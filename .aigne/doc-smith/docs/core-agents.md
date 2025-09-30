# Agents

In the AIGNE framework, agents are the fundamental building blocks responsible for performing tasks. Think of them as specialized workers, each designed for a specific type of job. You can use them individually or combine them into teams to handle more complex workflows. Understanding the different types of agents is key to building powerful and efficient AI applications.

This section provides an overview of the primary agent types available. Each type offers unique capabilities, from interacting with large language models to executing simple functions.

<x-cards data-columns="2">
  <x-card data-title="AI Agent" data-icon="lucide:brain-circuit" data-href="/core/agents/ai-agent">
    The core of the framework, the AI Agent connects to large language models (LLMs) like OpenAI's GPT or Anthropic's Claude to process information, make decisions, and generate human-like responses. Use this agent for any task that requires reasoning, creativity, or natural language understanding.
  </x-card>
  <x-card data-title="Function Agent" data-icon="lucide:binary" data-href="/core/agents/function-agent">
    A Function Agent is a simple wrapper that turns a regular piece of code (a function) into an agent. This is perfect for creating specific, reusable tools that can perform predictable tasks, such as making a calculation, fetching data from a database, or calling an external API.
  </x-card>
  <x-card data-title="Team Agent" data-icon="lucide:users" data-href="/core/agents/team-agent">
    A Team Agent acts as a manager, orchestrating a group of other agents to work together on a complex task. It can coordinate their work in a sequence (one after another) or in parallel (all at once), allowing you to build sophisticated, multi-step workflows.
  </x-card>
  <x-card data-title="MCP Agent" data-icon="lucide:webhook" data-href="/core/agents/mcp-agent">
    The MCP Agent acts as a bridge to external services that follow the Model Context Protocol (MCP). It allows your application to connect to and interact with these services, accessing their unique tools and capabilities as if they were local agents.
  </x-card>
</x-cards>