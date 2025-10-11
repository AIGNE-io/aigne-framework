# Core Concepts

The AIGNE framework is designed with a modular and extensible architecture. Understanding its core components is key to building robust and scalable AI-driven applications. This section provides an overview of the fundamental building blocks and architectural principles that govern the framework.

The primary components you will interact with are the AIGNE Engine, Agents, Models, and Memory. Each plays a distinct role in the lifecycle of an AI workflow.

<x-cards data-columns="2">
  <x-card data-title="The AIGNE Engine" data-icon="lucide:server" data-href="/developer-guide/core-concepts/aigne-engine">
    The central orchestrator that manages agents, state, and communication.
  </x-card>
  <x-card data-title="Agents Explained" data-icon="lucide:bot" data-href="/developer-guide/core-concepts/agents-explained">
    The fundamental building blocks that encapsulate logic and perform tasks.
  </x-card>
  <x-card data-title="Models" data-icon="lucide:brain-circuit" data-href="/developer-guide/core-concepts/models">
    Abstractions for interacting with various underlying AI models.
  </x-card>
  <x-card data-title="Memory" data-icon="lucide:database" data-href="/developer-guide/core-concepts/memory">
    Enables agents to store and recall information from past interactions.
  </x-card>
    <x-card data-title="Prompts" data-icon="lucide:file-text" data-href="/developer-guide/core-concepts/prompts">
    A powerful template engine for constructing dynamic and reusable prompts.
  </x-card>
</x-cards>

## Architecture Overview

The following diagram illustrates the relationships between the core classes in the AIGNE framework.

```d2
direction: down

PromptBuilderBuildOptions: {
  shape: class
  "+Context context"
  "+Agent agent"
  "+object input"
  "+ChatModel model"
}

Prompt: {
  shape: class
  "+List<object> messages"
  "+List<Agent> skills"
  "+object toolChoice"
  "+object responseFormat"
}

PromptBuilder: {
  shape: class
  "+build(PromptBuilderBuildOptions options): Prompt"
}

ChatModel: {
  shape: class
}

ImageModel: {
  shape: class
}

Agent: {
  shape: class
  "+string name"
  "+string description"
  "+object inputSchema"
  "+object outputSchema"
  "+List<string> subscribeTopic"
  "+List<string> publishTopic"
  "+List<Agent> skills"
  "+MemoryAgent memory"
  "+invoke(object input, Context context): object"
  "+shutdown(): void"
  "+process(object input, Context context): object"
  "-preprocess(): void"
  "-postprocess(): void"
}

AIAgent: {
  shape: class
  "+ChatModel model"
  "+PromptBuilder instructions"
  "+string outputKey"
  "+object toolChoice"
  "+boolean catchToolsError"
}

TeamAgent: {
  shape: class
  "+ProcessMode mode"
}

ImageAgent: {
  shape: class
  "+ImageModel model"
  "+PromptBuilder instructions"
}

FunctionAgent: {
  shape: class
  "+Function process"
}

RPCAgent: {
  shape: class
  "+string url"
}

MCPAgent: {
  shape: class
  "+MCPClient client"
}

MCPClient: {
  shape: class
}

Message: {
  shape: class
  "+object output"
}

MessageQueue: {
  shape: class
  "+publish(string topic, Message message): void"
  "+subscribe(string topic, Function callback): void"
  "+unsubscribe(string topic, Function callback): void"
}

Context: {
  shape: class
  "+ChatModel model"
  "+ImageModel imageModel"
  "+List<Agent> skills"
  "+invoke(Agent agent, object input): object"
  "+publish(string topic, Message message): void"
  "+subscribe(string topic, Function callback): void"
  "+unsubscribe(string topic, Function callback): void"
}

UserAgent: {
  shape: class
}

EventEmitter: {
  shape: class
  "+on(): void"
  "+emit(): void"
}

AIGNE: {
  shape: class
  "+string name"
  "+string description"
  "+ChatModel model"
  "+object limits"
  "+List<Agent> agents"
  "+List<Agent> skills"
  "+load(string path): AIGNE"
  "+addAgent(Agent agent): void"
  "+invoke(Agent agent): UserAgent"
  "+invoke(Agent agent, string input): object"
  "+invoke(Agent agent, object input): object"
  "+publish(string topic, Message message): void"
  "+subscribe(string topic, Function callback): void"
  "+unsubscribe(string topic, Function callback): void"
  "+shutdown(): void"
}

# Relationships
PromptBuilder -> PromptBuilderBuildOptions: { style.stroke-dash: 2 }
PromptBuilder -> Prompt: { style.stroke-dash: 2 }

ChatModel -> Agent: { target-arrowhead: { shape: unfilled triangle } }
ImageModel -> Agent: { target-arrowhead: { shape: unfilled triangle } }
AIAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
TeamAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
ImageAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
FunctionAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
RPCAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
MCPAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
UserAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
Context -> MessageQueue: { target-arrowhead: { shape: unfilled triangle } }
AIGNE -> EventEmitter: { target-arrowhead: { shape: unfilled triangle } }

AIAgent -> PromptBuilder: { source-arrowhead: { shape: diamond }, style.stroke-dash: 2 }
ImageAgent -> PromptBuilder: { source-arrowhead: { shape: diamond }, style.stroke-dash: 2 }
ImageAgent -> ImageModel: { source-arrowhead: { shape: diamond }, style.stroke-dash: 2 }
MCPAgent -> MCPClient: { source-arrowhead: { shape: diamond }, style.stroke-dash: 2 }
Context -> ChatModel: { source-arrowhead: { shape: diamond }, style.stroke-dash: 2 }
Context -> ImageModel: { source-arrowhead: { shape: diamond }, style.stroke-dash: 2 }

MessageQueue -> Message: { style.stroke-dash: 2 }
```

At the center is the `AIGNE` engine, which manages a collection of `Agent` instances. The `Agent` class is the base for all specialized agents, such as `AIAgent`, `TeamAgent`, and `FunctionAgent`. When an agent is invoked, it operates within a `Context`, which provides access to shared resources like `ChatModel` or `ImageModel` and handles communication via a `MessageQueue`.

### AIGNE Engine

The `AIGNE` class is the main execution engine of the framework. It is responsible for:
- Loading and managing a collection of agents.
- Providing a unified interface to invoke agents.
- Orchestrating the overall workflow and communication between agents.
- Handling system-level concerns like state management and resource limits.

For a detailed explanation, see [The AIGNE Engine](./developer-guide-core-concepts-aigne-engine.md).

### Agents

An `Agent` is the most fundamental concept in the AIGNE framework. It is an autonomous entity that can perform tasks, make decisions, and communicate with other agents. The base `Agent` class provides core functionalities, and developers can create specialized agents by extending it. Key responsibilities include:
- Defining input and output schemas for data validation.
- Implementing the core logic within the `process` method.
- Subscribing to and publishing messages on topics for inter-agent communication.
- Utilizing "skills," which are other agents, to delegate tasks.

Learn more in [Agents Explained](./developer-guide-core-concepts-agents-explained.md).

### Models

Models are abstractions that connect agents to underlying large language models (LLMs) or image generation models. The framework provides `ChatModel` and `ImageModel` base classes, making it easy to integrate with various AI providers like OpenAI, Gemini, and Claude. This abstraction allows you to switch between different AI models without changing your agent's core logic.

See the [Models](./developer-guide-core-concepts-models.md) documentation for more details.

### Memory

To enable stateful conversations and complex problem-solving, agents need the ability to remember past interactions. The `MemoryAgent` provides this capability. It works alongside `Recorder` and `Retriever` skills to store and recall information, giving agents a persistent memory across multiple invocations.

For more information, visit the [Memory](./developer-guide-core-concepts-memory.md) section.

### Prompts

Effective communication with AI models relies on well-crafted prompts. The `PromptBuilder` is a utility that facilitates the creation of dynamic and reusable prompts. It uses a powerful template engine, allowing you to insert variables, include partial templates, and construct complex prompt structures with ease.

Dive deeper into the [Prompts](./developer-guide-core-concepts-prompts.md) documentation.