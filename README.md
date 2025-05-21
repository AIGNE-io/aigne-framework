![](https://www.arcblock.io/.well-known/service/blocklet/og.png?template=banner\&title=AIGNE%20Framework\&logo=https://store.blocklet.dev/assets/z2qaBP9SahqU2L2YA3ip7NecwKACMByTFuiJ2/screenshots/0453ca48c18784b78a0354c9369ad377.png?imageFilter=resize\&w=160\&h=160\&v=0.4.227)

[English](./README.md) | [中文](./README.zh.md)

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/core)](https://www.npmjs.com/package/@aigne/core)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/core)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

## What is AIGNE Framework

AIGNE Framework is a functional AI application development framework designed to simplify and accelerate the process of building modern applications. It combines functional programming features, powerful artificial intelligence capabilities, and modular design principles to help developers easily create scalable solutions. AIGNE Framework is also deeply integrated with the Blocklet ecosystem, providing developers with a wealth of tools and resources.

## Key Features

* **Modular Design**: With a clear modular structure, developers can easily organize code, improve development efficiency, and simplify maintenance.
* **TypeScript Support**: Comprehensive TypeScript type definitions are provided, ensuring type safety and enhancing the developer experience.
* **Multiple AI Model Support**: Built-in support for OpenAI, Gemini, Claude, Nova and other mainstream AI models, easily extensible to support additional models.
* **Flexible Workflow Patterns**: Support for sequential, concurrent, routing, handoff and other workflow patterns to meet various complex application requirements.
* **MCP Protocol Integration**: Seamless integration with external systems and services through the Model Context Protocol.
* **Code Execution Capabilities**: Support for executing dynamically generated code in a secure sandbox, enabling more powerful automation capabilities.
* **Blocklet Ecosystem Integration**: Closely integrated with the Blocklet ecosystem, providing developers with a one-stop solution for development and deployment.

## Quick Start

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

function transfer_to_b() {
  return agentB;
}

const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent.",
  outputKey: "A",
  skills: [transfer_to_b],
});

const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
});

const aigne = new AIGNE({ model });

const userAgent = aigne.invoke(agentA);

const result1 = await userAgent.invoke("transfer to agent b");
console.log(result1);
// Output:
// {
//   B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?",
// }

const result2 = await userAgent.invoke("It's a beautiful day");
console.log(result2);
// Output:
// {
//   B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy.  ",
// }
```

## Packages

* [examples](./examples) - Example project demonstrating how to use different agents to handle various tasks.
* [packages/core](./packages/core) - Core package providing the foundation for building AIGNE applications.
* [packages/agent-library](./packages/agent-library) - AIGNE agent library, providing a variety of specialized agents for different tasks.
* [packages/cli](./packages/cli) - Command-line interface for AIGNE Framework, providing tools for project management and deployment.
* models - AIGNE Framework's built-in models, including OpenAI, Gemini, Claude, and Nova.
  * [packages/openai](./packages/openai) - OpenAI model implementation, supporting OpenAI's API and function calling.
  * [packages/anthropic](./packages/anthropic) - Anthropic model implementation, supporting Anthropic's API and function calling.
  * [packages/bedrock](./packages/bedrock) - Bedrock model implementation, supporting Bedrock's API and function calling.
  * [packages/deepseek](./packages/deepseek) - DeepSeek model implementation, supporting DeepSeek's API and function calling.
  * [packages/gemini](./packages/gemini) - Gemini model implementation, supporting Gemini's API and function calling.
  * [packages/ollama](./packages/ollama) - Ollama model implementation, supporting Ollama's API and function calling.
  * [packages/open-router](./packages/open-router) - OpenRouter model implementation, supporting OpenRouter's API and function calling.
  * [packages/xai](./packages/xai) - XAI model implementation, supporting XAI's API and function calling.

## Documentation

* [Cookbook](./docs/cookbook.md) ([中文](./docs/cookbook.zh.md)): Practical recipes and patterns for AIGNE Framework API usage
* [CLI Guide](./docs/cli.md) ([中文](./docs/cli.zh.md)): Comprehensive guide to the AIGNE CLI tool
* [Agent Development Guide](./docs/agent-development.md) ([中文](./docs/agent-development.zh.md)): Guide to developing AIGNE agents using YAML/JS configuration files
* [API References](https://aigne-io.github.io/#/api/@aigne/core/README)

## Architecture

AIGNE Framework supports various workflow patterns to address different AI application needs. Each workflow pattern is optimized for specific use cases:

### Sequential Workflow

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

### Concurrency Workflow

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

### Router Workflow

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

### Handoff Workflow

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

### Reflection Workflow

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

### Code Execution Workflow

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

## Examples

### MCP Server Integration

* [Puppeteer MCP Server](./examples/mcp-puppeteer) - Learn how to leverage Puppeteer for automated web scraping through the AIGNE Framework.
* [SQLite MCP Server](./examples/mcp-sqlite) - Explore database operations by connecting to SQLite through the Model Context Protocol.
* [Github](./examples/mcp-github) - Interact with GitHub repositories using the GitHub MCP Server.

### Workflow Patterns

* [Workflow Router](./examples/workflow-router) - Implement intelligent routing logic to direct requests to appropriate handlers based on content.
* [Workflow Sequential](./examples/workflow-sequential) - Build step-by-step processing pipelines with guaranteed execution order.
* [Workflow Concurrency](./examples/workflow-concurrency) - Optimize performance by processing multiple tasks simultaneously with parallel execution.
* [Workflow Handoff](./examples/workflow-handoff) - Create seamless transitions between specialized agents to solve complex problems.
* [Workflow Reflection](./examples/workflow-reflection) - Enable self-improvement through output evaluation and refinement capabilities.
* [Workflow Orchestration](./examples/workflow-orchestration) - Coordinate multiple agents working together in sophisticated processing pipelines.
* [Workflow Code Execution](./examples/workflow-code-execution) - Safely execute dynamically generated code within AI-driven workflows.
* [Workflow Group Chat](./examples/workflow-group-chat) - Share messages and interact with multiple agents in a group chat environment.

## Contributing and Releasing

AIGNE Framework is an open source project and welcomes community contributions. We use [release-please](https://github.com/googleapis/release-please) for version management and release automation.

* Contributing Guidelines: See [CONTRIBUTING.md](./CONTRIBUTING.md)
* Release Process: See [RELEASING.md](./RELEASING.md)

## License

This project is licensed under the [Elastic-2.0](./LICENSE.md) - see the [LICENSE](./LICENSE.md) file for details.

## Community and Support

AIGNE Framework has a vibrant developer community offering various support channels:

* [Documentation Center](https://aigne-io.github.io/#/api/@aigne/core/README): Comprehensive official documentation to help developers get started quickly.
* [Technical Forum](https://community.arcblock.io/discussions/boards/aigne): Exchange experiences with global developers and solve technical problems.
