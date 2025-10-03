# API Reference

This section provides a detailed and exhaustive reference for all public classes, functions, and types exported by the `@aigne/core` package. It is intended for developers who are building applications with AIGNE and require in-depth information about its programmatic interface.

The API is organized into several key modules, each responsible for a distinct aspect of the framework's functionality. The following diagram illustrates the high-level architecture and the primary components available for you to use.

```d2
# @aigne/core Package Architecture

direction: right

Core: {
  shape: package
  AIGNE: "The AIGNE Engine orchestrates workflows and manages the context."
}

Agents: {
  shape: package
  Agent: "Base class for all agents."
  AIAgent: "Interacts with language models."
  TeamAgent: "Manages a group of agents."
  FunctionAgent: "Wraps a JavaScript function."
  ImageAgent: "Generates images from prompts."
}

Models: {
  shape: package
  ChatModel: "Interface for language models."
  ImageModel: "Interface for image generation models."
}

Memory: {
  shape: package
  MemoryAgent: "Stores and retrieves information."
  Recorder: "Skill for writing to memory."
  Retriever: "Skill for reading from memory."
}

Utilities: {
  shape: package
  PromptBuilder: "Constructs dynamic prompts."
  JSON: "JSON parsing and manipulation."
  Streams: "Handling data streams."
}

Core -> Agents: "Executes"
Agents -> Models: "Uses"
Agents -> Memory: "Accesses"
Agents -> Utilities: "Utilizes"
```

The API reference is divided into the following sections for clarity and ease of navigation. Please select a category to explore the relevant exports in detail.

<x-cards data-columns="3">
  <x-card data-title="Main Exports" data-icon="lucide:package-open" data-href="/api-reference/main-exports">
    A complete list of all top-level exports available directly from the @aigne/core package.
  </x-card>
  <x-card data-title="Agent Classes" data-icon="lucide:bot" data-href="/api-reference/agent-classes">
    Detailed documentation for the base Agent class and all its specialized subclasses.
  </x-card>
  <x-card data-title="Model Classes" data-icon="lucide:box" data-href="/api-reference/model-classes">
    API reference for the ChatModel and ImageModel base classes used for creating model integrations.
  </x-card>
</x-cards>

For a record of all changes, including new features, bug fixes, and breaking changes, please consult the [Changelog](./changelog.md).