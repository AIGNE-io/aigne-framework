## AIGNE Framework

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)

## What is AIGNE Framework

AIGNE Framework is a functional AI application development framework designed to simplify and accelerate the process of building modern applications. It combines functional programming features, powerful artificial intelligence capabilities, and modular design principles to help developers easily create scalable solutions. AIGNE Framework is also deeply integrated with the Blocklet ecosystem, providing developers with a wealth of tools and resources.

## Class Definitions

```mermaid
classDiagram
    class PromptBuilderBuildOptions {
        +Context context
        +Agent agent
        +object input
        +ChatModel model
    }

    class Prompt {
        +List~object~ messages
        +List~Agent~ tools
        +object toolChoice
        +object responseFormat
    }

    PromptBuilder ..> PromptBuilderBuildOptions: dependency
    PromptBuilder ..> Prompt: dependency
    class PromptBuilder {
        +build(PromptBuilderBuildOptions options) Prompt
    }

    class Model {
        +call(Prompt input) object*
    }

    ChatModel --|> Model: inheritance
    class ChatModel {
    }

    ImageModel --|> Model: inheritance
    class ImageModel {
    }

    Agent --|> EventEmitter: inheritance
    class Agent {
        +string name
        +string description
        +object inputSchema
        +object outputSchema
        +List~string~ inputTopic
        +List~string~ nextTopic
        +List~Agent~ tools
        +Map~string, Agent~ skills

        +call(string input, Context context) object
        +call(object input, Context context) object

        +process(object input, Context context) object*
        -verifyInput() void
        -verifyOutput() void
    }

    AIAgent --|> Agent: inheritance
    AIAgent *.. PromptBuilder: composition
    class AIAgent {
        +ChatModel model
        +string instructions
        +string outputKey
        +object toolChoice
        +PromptBuilder promptBuilder
    }

    ImageAgent --|> Agent: inheritance
    ImageAgent *.. PromptBuilder: composition
    class ImageAgent {
        +ImageModel model
        +string instructions
        +PromptBuilder promptBuilder
    }

    FunctionAgent --|> Agent: inheritance
    class FunctionAgent {
        +Function fn
    }

    RPCAgent --|> Agent: inheritance
    class RPCAgent {
        +string url
    }

    MCPAgent --|> Agent: inheritance
    MCPAgent *.. MCPClient: composition
    class MCPAgent {
        +MCPClient client
    }

    class MCPClient {
    }

    class Message {
        +object output
    }

    MessageQueue ..> Message: dependency
    class MessageQueue {
        +publish(string topic, Message message) void
        +subscribe(string topic, Function callback) void
        +unsubscribe(string topic, Function callback) void
    }

    class History {
        +string id
        +string agentId
        +object input
        +object output
    }

    Context *.. ChatModel: composition
    Context *.. ImageModel: composition
    Context --|> MessageQueue: inheritance
    Context ..> History: dependency
    class Context {
        +ChatModel model
        +ImageModel imageModel
        +List~Agent~ tools

        +getHistories(string agentId, int limit) List~History~
        +addHistory(History history) void
        +publish(string topic, Message message) void
        +subscribe(string topic, Function callback) void
        +unsubscribe(string topic, Function callback) void
    }

    class EventEmitter {
        +on(): void
        +emit(): void
    }

    UserAgent --|> Agent: inheritance
    class UserAgent {
    }

    class ExecutionEngineRunOptions {
        +boolean concurrency
    }

    ExecutionEngine --|> Context: inheritance
    ExecutionEngine --|> EventEmitter: inheritance
    ExecutionEngine ..> UserAgent: dependency
    ExecutionEngine ..> ExecutionEngineRunOptions: dependency
    class ExecutionEngine {
        +run(Agent agent) UserAgent
        +run(string input) object
        +run(object input) object
        +run(object input, Agent ...agents) object
        +run(object input, ExecutionEngineRunOptions options, Agent ...agents) object
    }
```

## Usage

```ts
import { AIAgent, ChatModelOpenAI, ExecutionEngine } from "@aigne/core";
import { DEFAULT_CHAT_MODEL, OPENAI_API_KEY } from "../env";

const model = new ChatModelOpenAI({
  apiKey: OPENAI_API_KEY,
  model: DEFAULT_CHAT_MODEL,
});

function transferToAgentB() {
  return agentB;
}

function transferToAgentA() {
  return agentA;
}

const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent.",
  outputKey: "A",
  tools: [transferToAgentB],
});

const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
  tools: [transferToAgentA],
});

const engine = new ExecutionEngine({ model });

const userAgent = await engine.run(agentA);

const response = await userAgent.run("transfer to agent b");
// output
// {
//   B: "Agent B awaits here,  \nIn haikus I shall speak now,  \nWhat do you seek, friend?",
// }
```

## Packages

- [examples/agents](./examples/agents) - Example project demonstrating how to use different agents to handle various tasks.
- [packages/core](./packages/core) - Core package providing the foundation for building AIGNE applications.
- [packages/memory](./packages/memory) - Memory package providing memory storage capabilities for AIGNE applications.
- [packages/runtime](./packages/runtime) - Runtime package providing runtime capabilities for AIGNE applications.

## Key Features

### Core Capabilities

- **Modular Design**: With a clear modular structure, developers can easily organize code, improve development efficiency, and simplify maintenance.
- **TypeScript Support**: Comprehensive TypeScript type definitions are provided, ensuring type safety and enhancing the developer experience.
- **Blocklet Ecosystem Integration**: Closely integrated with the Blocklet ecosystem, providing developers with a one-stop solution for development and deployment.

### AI Capabilities

- **Intelligent Generation**: Built-in various AI models support advanced features such as natural language processing and image recognition, helping developers build intelligent applications.
- **Developer-Friendly**: Provides simple APIs and tools, lowering the barrier to using AI technology.

### Blocklet Ecosystem

- **Rich Ecosystem Resources**: Deep integration with Blocklet Store allows developers to easily access various components and templates.
- **Rapid Deployment**: Through the Blocklet platform, applications can be quickly launched and globally distributed.
- **Strong Community Support**: An active developer community provides continuous resources and technical support.

## Use Cases

- **Intelligent Chat Applications**: Quickly develop chatbot that support natural language interaction based on built-in AI models.
- **Dynamic Content Generation**: Use AI capabilities to generate personalized content and enhance user experience.
- **Blockchain Applications**: Seamlessly integrated with the Blocklet ecosystem, AIGNE Framework supports the development of decentralized applications (DApps).

## Getting Started

- Build your first AIGNE application
  - Develop native JavaScript applications with AIGNE
  - Develop Blocklet ecosystem applications with AIGNE
- Define and run Agents

## Community and Support

AIGNE Framework has a vibrant developer community offering various support channels:

[Documentation Center](https://www.arcblock.io/docs/aigne-framework/introduce): Comprehensive official documentation to help developers get started quickly.
[Technical Forum](https://community.arcblock.io/discussions/boards/aigne): Exchange experiences with global developers and solve technical problems.
