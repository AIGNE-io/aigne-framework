<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/core)](https://www.npmjs.com/package/@aigne/core)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/core)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

## What is AIGNE Framework

AIGNE Framework \[ ˈei dʒən ] is a functional AI application development framework designed to simplify and accelerate the process of building modern applications. It combines functional programming features, powerful artificial intelligence capabilities, and modular design principles to help developers easily create scalable solutions. AIGNE Framework is also deeply integrated with the Blocklet ecosystem, providing developers with a wealth of tools and resources.

## Key Features

* **Modular Design**: With a clear modular structure, developers can easily organize code, improve development efficiency, and simplify maintenance.
* **TypeScript Support**: Comprehensive TypeScript type definitions are provided, ensuring type safety and enhancing the developer experience.
* **Multiple AI Model Support**: Built-in support for OpenAI, Gemini, Claude, Nova and other mainstream AI models, easily extensible to support additional models.
* **Flexible Workflow Patterns**: Support for sequential, concurrent, routing, handoff and other workflow patterns to meet various complex application requirements.
* **Agentic File System (AFS)**: A virtual file system abstraction that provides AI agents with unified access to various storage backends, including local files, conversation history, and user profiles. See [AFS Documentation](./afs/README.md) for details.
* **MCP Protocol Integration**: Seamless integration with external systems and services through the Model Context Protocol.
* **Code Execution Capabilities**: Support for executing dynamically generated code in a secure sandbox, enabling more powerful automation capabilities.
* **Blocklet Ecosystem Integration**: Closely integrated with ArcBlock's Blocklet ecosystem, providing developers with a one-stop solution for development and deployment.

## Quick Start

### Environment Requirements

* Node.js version 20.0 or higher

### Installation

#### Using npm

```bash
npm install @aigne/core
```

#### Using yarn

```bash
yarn add @aigne/core
```

#### Using pnpm

```bash
pnpm add @aigne/core
```

### Usage Example

```ts file="/examples/workflow-handoff/usages.ts"
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

function transferToB() {
  return agentB;
}

const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent.",
  outputKey: "A",
  skills: [transferToB],
  inputKey: "message",
});

const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
  inputKey: "message",
});

const aigne = new AIGNE({ model });

const userAgent = aigne.invoke(agentA);

const result1 = await userAgent.invoke({ message: "transfer to agent b" });
console.log(result1);
// Output:
// {
//   B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?",
// }

const result2 = await userAgent.invoke({ message: "It's a beautiful day" });
console.log(result2);
// Output:
// {
//   B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy.  ",
// }
```

## Architecture diagram

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne.png" alt="AIGNE Arch" />
</picture>

## Simplifying Agentic Workflows

The AIGNE Framework offers multiple workflow patterns, each tailored to address distinct application scenarios efficiently.

### Workflow Patterns

* [Workflow Router](./examples/workflow-router/README.md) - Implement intelligent routing logic to direct requests to appropriate handlers based on content.
* [Workflow Sequential](./examples/workflow-sequential/README.md) - Build step-by-step processing pipelines with guaranteed execution order.
* [Workflow Concurrency](./examples/workflow-concurrency/README.md) - Optimize performance by processing multiple tasks simultaneously with parallel execution.
* [Workflow Handoff](./examples/workflow-handoff/README.md) - Create seamless transitions between specialized agents to solve complex problems.
* [Workflow Reflection](./examples/workflow-reflection/README.md) - Enable self-improvement through output evaluation and refinement capabilities.
* [Workflow Orchestration](./examples/workflow-orchestration/README.md) - Coordinate multiple agents working together in sophisticated processing pipelines.
* [Workflow Code Execution](./examples/workflow-code-execution/README.md) - Safely execute dynamically generated code within AI-driven workflows.
* [Workflow Group Chat](./examples/workflow-group-chat/README.md) - Share messages and interact with multiple agents in a group chat environment.

### Sequential

**Use Cases**: Processing multi-step tasks that require a specific execution order, such as content generation pipelines, multi-stage data processing, etc.

```mermaid
flowchart LR
in(In)
out(Out)
conceptExtractor(Concept Extractor)
writer(Writer)
formatProof(Format Proof)

in --> conceptExtractor --> writer --> formatProof --> out

classDef inputOutput fill:#f9f0ed,stroke:#debbae,stroke-width:2px,color:#b35b39,font-weight:bolder;
classDef processing fill:#F0F4EB,stroke:#C2D7A7,stroke-width:2px,color:#6B8F3C,font-weight:bolder;

class in inputOutput
class out inputOutput
class conceptExtractor processing
class writer processing
class formatProof processing
```

**Example**: [@aigne/example-workflow-sequential: Pipeline](./examples/workflow-sequential/README.md)

### Concurrency

**Use Cases**: Scenarios requiring simultaneous processing of multiple independent tasks to improve efficiency, such as parallel data analysis, multi-dimensional content evaluation, etc.

```mermaid
flowchart LR
in(In)
out(Out)
featureExtractor(Feature Extractor)
audienceAnalyzer(Audience Analyzer)
aggregator(Aggregator)

in --> featureExtractor --> aggregator
in --> audienceAnalyzer --> aggregator
aggregator --> out

classDef inputOutput fill:#f9f0ed,stroke:#debbae,stroke-width:2px,color:#b35b39,font-weight:bolder;
classDef processing fill:#F0F4EB,stroke:#C2D7A7,stroke-width:2px,color:#6B8F3C,font-weight:bolder;

class in inputOutput
class out inputOutput
class featureExtractor processing
class audienceAnalyzer processing
class aggregator processing
```

**Example**: [@aigne/example-workflow-concurrency: Concurrency](./examples/workflow-concurrency/README.md)

### Router

**Use Cases**: Scenarios where requests need to be routed to different specialized processors based on input content type, such as intelligent customer service systems, multi-functional assistants, etc.

```mermaid
flowchart LR
in(In)
out(Out)
triage(Triage)
productSupport(Product Support)
feedback(Feedback)
other(Other)

in ==> triage
triage ==> productSupport ==> out
triage -.-> feedback -.-> out
triage -.-> other -.-> out

classDef inputOutput fill:#f9f0ed,stroke:#debbae,stroke-width:2px,color:#b35b39,font-weight:bolder;
classDef processing fill:#F0F4EB,stroke:#C2D7A7,stroke-width:2px,color:#6B8F3C,font-weight:bolder;

class in inputOutput
class out inputOutput
class triage processing
class productSupport processing
class feedback processing
class other processing
```

**Example**: [@aigne/example-workflow-router: Router](./examples/workflow-router/README.md)

### Handoff

**Use Cases**: Scenarios requiring control transfer between different specialized agents to solve complex problems, such as expert collaboration systems, etc.

```mermaid
flowchart LR

in(In)
out(Out)
agentA(Agent A)
agentB(Agent B)

in --> agentA --transfer to b--> agentB --> out

classDef inputOutput fill:#f9f0ed,stroke:#debbae,stroke-width:2px,color:#b35b39,font-weight:bolder;
classDef processing fill:#F0F4EB,stroke:#C2D7A7,stroke-width:2px,color:#6B8F3C,font-weight:bolder;

class in inputOutput
class out inputOutput
class agentA processing
class agentB processing
```

**Example**: [@aigne/example-workflow-handoff: Task handoff](./examples/workflow-handoff/README.md)

### Reflection

**Use Cases**: Scenarios requiring self-assessment and iterative improvement of output quality, such as code reviews, content quality control, etc.

```mermaid
flowchart LR
in(In)
out(Out)
coder(Coder)
reviewer(Reviewer)

in --Ideas--> coder ==Solution==> reviewer --Approved--> out
reviewer ==Rejected==> coder

classDef inputOutput fill:#f9f0ed,stroke:#debbae,stroke-width:2px,color:#b35b39,font-weight:bolder;
classDef processing fill:#F0F4EB,stroke:#C2D7A7,stroke-width:2px,color:#6B8F3C,font-weight:bolder;

class in inputOutput
class out inputOutput
class coder processing
class reviewer processing
```

**Example**: [@aigne/example-workflow-reflection: Reflection](./examples/workflow-reflection/README.md)

### Code Execution

**Use Cases**: Scenarios requiring dynamically generated code execution to solve problems, such as automated data analysis, algorithmic problem solving, etc.

```mermaid
flowchart LR

in(In)
out(Out)
coder(Coder)
sandbox(Sandbox)

coder -.-> sandbox
sandbox -.-> coder
in ==> coder ==> out


classDef inputOutput fill:#f9f0ed,stroke:#debbae,stroke-width:2px,color:#b35b39,font-weight:bolder;
classDef processing fill:#F0F4EB,stroke:#C2D7A7,stroke-width:2px,color:#6B8F3C,font-weight:bolder;

class in inputOutput
class out inputOutput
class coder processing
class sandbox processing
```

**Example**: [@aigne/example-workflow-code-execution: Code execution](./examples/workflow-code-execution/README.md)

## Agentic File System (AFS)

AFS provides AI agents with a unified interface to access various storage backends through a virtual file system abstraction. This enables agents to work with local files, conversation history, and user profiles using consistent APIs.

### Features

* **Virtual File System**: Path-based access to diverse data sources
* **Pluggable Modules**: Easily extend with custom storage backends
* **Automatic Tool Registration**: AI agents automatically get file system capabilities
* **Persistent Storage**: SQLite-based storage with automatic migrations
* **Conversation Memory**: Built-in history tracking and user profile management

### AFS Examples

* [AFS Memory Example](./examples/afs-memory/README.md) - Explore conversation memory and user profile management capabilities.
* [AFS LocalFS Example](./examples/afs-local-fs/README.md) - Learn how to mount local file systems and let AI agents interact with your files through natural language.
* [AFS MCP Server Example](./examples/afs-mcp-server/README.md) - Mount MCP servers as AFS modules to integrate external services like GitHub.

For comprehensive AFS documentation, see [AFS Documentation](./afs/README.md).

## Built-in MCP Support

Built-in MCP support allows the AIGNE framework to effortlessly run its own MCP server or seamlessly integrate with external MCP servers.

### Implement MCP Server

* [MCP Server](./examples/mcp-server/README.md) - Build a MCP server using AIGNE CLI to provide MCP services.

### Use MCP Servers

* [Puppeteer MCP Server](./examples/mcp-puppeteer/README.md) - Learn how to leverage Puppeteer for automated web scraping through the AIGNE Framework.
* [SQLite MCP Server](./examples/mcp-sqlite/README.md) - Explore database operations by connecting to SQLite through the Model Context Protocol.
* [Github](./examples/mcp-github/README.md) - Interact with GitHub repositories using the GitHub MCP Server.

## Packages

* [examples](./examples/README.md) - Example project demonstrating how to use different agents to handle various tasks.
* [packages/core](./packages/core/README.md) - Core package providing the foundation for building AIGNE applications.
* [packages/agent-library](./packages/agent-library/README.md) - AIGNE agent library, providing a variety of specialized agents for different tasks.
* [packages/cli](./packages/cli/README.md) - Command-line interface for AIGNE Framework, providing tools for project management and deployment.
* [afs](./afs/README.md) - Agentic File System (AFS), providing virtual file system abstraction for AI agents.
  * [afs/core](./afs/core/README.md) - Core AFS implementation with history module.
  * [afs/local-fs](./afs/local-fs/README.md) - Local file system module for AFS.
  * [afs/user-profile-memory](./afs/user-profile-memory/README.md) - User profile memory module for AFS.
* models - AIGNE Framework's built-in models, including OpenAI, Gemini, Claude, and Nova.
  * [models/openai](./models/openai/README.md) - OpenAI model implementation, supporting OpenAI's API and function calling.
  * [models/anthropic](./models/anthropic/README.md) - Anthropic model implementation, supporting Anthropic's API and function calling.
  * [models/bedrock](./models/bedrock/README.md) - Bedrock model implementation, supporting Bedrock's API and function calling.
  * [models/deepseek](./models/deepseek/README.md) - DeepSeek model implementation, supporting DeepSeek's API and function calling.
  * [models/gemini](./models/gemini/README.md) - Gemini model implementation, supporting Gemini's API and function calling.
  * [models/ollama](./models/ollama/README.md) - Ollama model implementation, supporting Ollama's API and function calling.
  * [models/open-router](./models/open-router/README.md) - OpenRouter model implementation, supporting OpenRouter's API and function calling.
  * [models/xai](./models/xai/README.md) - XAI model implementation, supporting XAI's API and function calling.

## Documentation

[AIGNE Framework Documentation](https://www.arcblock.io/docs/aigne-framework) provides comprehensive guides and API references to help developers quickly get started and master the framework.

## Contributing and Releasing

AIGNE Framework is an open source project and welcomes community contributions. We use [release-please](https://github.com/googleapis/release-please) for version management and release automation.

* Contributing Guidelines: See [CONTRIBUTING.md](./CONTRIBUTING.md)
* Release Process: See [RELEASING.md](./RELEASING.md)

## License

This project is licensed under the [Elastic-2.0](./LICENSE.md) - see the [LICENSE](./LICENSE.md) file for details.

## About the Name

📛 **AIGNE Name & Meaning**
\[ ˈei dʒən ] — like "agent" without the t

🔤 **Pronunciation**
It's pronounced **\[ ˈei dʒən ]** — like *"agent" without the "t."*

🏞️ **Origin**
*Aigne* is a small medieval village in southern France.
In **Old Irish**, *aigne* means **"spirit"** — a perfect metaphor for agents that think and act.

🔡 **Acronym**
**AIGNE** = *Artificial Intelligence & Generative Natural-Language Ecosystem*
An open framework for building real AI agents that live across cloud, browser, and edge.

## Community and Support

AIGNE Framework has a vibrant developer community offering various support channels:

* [Documentation Center](https://www.arcblock.io/docs/aigne-framework): Comprehensive official documentation to help developers get started quickly.
* [Technical Forum](https://community.arcblock.io/discussions/boards/aigne): Exchange experiences with global developers and solve technical problems.
