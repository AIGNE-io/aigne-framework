# Agent Types & Examples

The AIGNE Core framework provides a set of specialized agent types, each designed as a fundamental building block for constructing sophisticated AI workflows. These pre-built agents handle common tasks, from interacting with language models to orchestrating teamwork and transforming data.

Understanding these agent types is key to effectively building applications with the framework. Each agent serves a distinct purpose but is designed to work seamlessly with others. This section provides practical guides and examples for each type.

<x-cards data-columns="2">
  <x-card data-title="AI Agent" data-icon="lucide:bot" data-href="/developer-guide/agent-types-and-examples/ai-agent">
    The standard agent for interacting with large language models (LLMs). It uses instructions, prompts, and tools to perform AI-driven tasks.
  </x-card>
  <x-card data-title="Team Agent" data-icon="lucide:users" data-href="/developer-guide/agent-types-and-examples/team-agent">
    Orchestrates a group of agents to work together. A Team Agent can manage workflows sequentially, where agents execute in order, or in parallel for simultaneous execution.
  </x-card>
  <x-card data-title="Function Agent" data-icon="lucide:code-2" data-href="/developer-guide/agent-types-and-examples/function-agent">
    Wraps any JavaScript or TypeScript function, allowing you to integrate custom logic, external tools, or legacy code into your agent workflows.
  </x-card>
  <x-card data-title="Image Agent" data-icon="lucide:image" data-href="/developer-guide/agent-types-and-examples/image-agent">
    A specialized agent configured to generate images from textual descriptions by interfacing with an underlying image generation model.
  </x-card>
  <x-card data-title="Transform Agent" data-icon="lucide:git-merge" data-href="/developer-guide/agent-types-and-examples/transform-agent">
    Manipulates and reshapes JSON data between other agents. It uses JSONata expressions to provide a powerful, declarative way to handle data formatting.
  </x-card>
</x-cards>

Select an agent type above to view its detailed documentation, including configuration options and practical code examples.