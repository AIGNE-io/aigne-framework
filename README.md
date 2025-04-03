![](https://www.arcblock.io/.well-known/service/blocklet/og.png?template=banner&title=AIGNE%20Framework&logo=https://store.blocklet.dev/assets/z2qaBP9SahqU2L2YA3ip7NecwKACMByTFuiJ2/screenshots/0453ca48c18784b78a0354c9369ad377.png?imageFilter=resize&w=160&h=160&v=0.4.227)

[English](./README.md) | [中文](./README.zh.md)

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/core)](https://www.npmjs.com/package/@aigne/core)
[![MIT licensed](https://img.shields.io/npm/l/@aigne/core)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

## What is AIGNE Framework

AIGNE Framework is a functional AI application development framework designed to simplify and accelerate the process of building modern applications. It combines functional programming features, powerful artificial intelligence capabilities, and modular design principles to help developers easily create scalable solutions. AIGNE Framework is also deeply integrated with the Blocklet ecosystem, providing developers with a wealth of tools and resources.

## Key Features

- **Modular Design**: With a clear modular structure, developers can easily organize code, improve development efficiency, and simplify maintenance.
- **TypeScript Support**: Comprehensive TypeScript type definitions are provided, ensuring type safety and enhancing the developer experience.
- **Blocklet Ecosystem Integration**: Closely integrated with the Blocklet ecosystem, providing developers with a one-stop solution for development and deployment.

## Usage

```ts
import { AIAgent, ExecutionEngine } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { DEFAULT_CHAT_MODEL, OPENAI_API_KEY } from "../env";

const model = new OpenAIChatModel({
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

const userAgent = await engine.call(agentA);

const response = await userAgent.call("transfer to agent b");
// output
// {
//   B: "Agent B awaits here,  \nIn haikus I shall speak now,  \nWhat do you seek, friend?",
// }
```

## Packages

- [examples](./examples) - Example project demonstrating how to use different agents to handle various tasks.
- [packages/core](./packages/core) - Core package providing the foundation for building AIGNE applications.

## Documentation

- [CLI Guide](./docs/cli.md) ([中文](./docs/cli.zh.md)): Comprehensive guide to the AIGNE CLI tool
- [Agent Development Guide](./docs/agent-development.md) ([中文](./docs/agent-development.zh.md)): Guide to developing AIGNE agents using YAML/JS configuration files
- [Cookbook](./docs/cookbook.md) ([中文](./docs/cookbook.zh.md)): Practical recipes and patterns for AIGNE Framework API usage
- API References:
  - [Agent API](./docs/apis/agent-api.md) ([English](./docs/apis/agent-api.en.md) | [中文](./docs/apis/agent-api.zh.md))
  - [AI Agent API](./docs/apis/ai-agent-api.md) ([English](./docs/apis/ai-agent-api.en.md) | [中文](./docs/apis/ai-agent-api.zh.md))
  - [Function Agent API](./docs/apis/function-agent-api.md) ([English](./docs/apis/function-agent-api.en.md) | [中文](./docs/apis/function-agent-api.zh.md))
  - [MCP Agent API](./docs/apis/mcp-agent-api.md) ([English](./docs/apis/mcp-agent-api.en.md) | [中文](./docs/apis/mcp-agent-api.zh.md))
  - [Execution Engine API](./docs/apis/execution-engine-api.md) ([English](./docs/apis/execution-engine-api.en.md) | [中文](./docs/apis/execution-engine-api.zh.md))

## Architecture

AIGNE Framework supports various workflow patterns to address different AI application needs:

### Sequential Workflow

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

- [Puppeteer MCP Server](./examples/mcp-puppeteer) - Learn how to leverage Puppeteer for automated web scraping through the AIGNE Framework.
- [SQLite MCP Server](./examples/mcp-sqlite) - Explore database operations by connecting to SQLite through the Model Context Protocol.
- [Github](./examples/mcp-github) - Interact with GitHub repositories using the GitHub MCP Server.

### Workflow Patterns

- [Workflow Router](./examples/workflow-router) - Implement intelligent routing logic to direct requests to appropriate handlers based on content.
- [Workflow Sequential](./examples/workflow-sequential) - Build step-by-step processing pipelines with guaranteed execution order.
- [Workflow Concurrency](./examples/workflow-concurrency) - Optimize performance by processing multiple tasks simultaneously with parallel execution.
- [Workflow Handoff](./examples/workflow-handoff) - Create seamless transitions between specialized agents to solve complex problems.
- [Workflow Reflection](./examples/workflow-reflection) - Enable self-improvement through output evaluation and refinement capabilities.
- [Workflow Orchestration](./examples/workflow-orchestration) - Coordinate multiple agents working together in sophisticated processing pipelines.
- [Workflow Code Execution](./examples/workflow-code-execution) - Safely execute dynamically generated code within AI-driven workflows.
- [Workflow Group Chat](./examples/workflow-group-chat) - Share messages and interact with multiple agents in a group chat environment.

## Contributing and Releasing

AIGNE Framework uses [release-please](https://github.com/googleapis/release-please) for version management and release automation. For details on the release process and contributing guidelines, please see [RELEASING.md](./RELEASING.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).

## Community and Support

AIGNE Framework has a vibrant developer community offering various support channels:

- [Documentation Center](https://www.arcblock.io/docs/aigne-framework/introduce): Comprehensive official documentation to help developers get started quickly.
- [Technical Forum](https://community.arcblock.io/discussions/boards/aigne): Exchange experiences with global developers and solve technical problems.
