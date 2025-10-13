This document provides a detailed guide to the AIGNE loader system, which is responsible for loading and parsing configuration files to construct and initialize agents. The loader is the primary entry point for defining and configuring the behavior of your AI agents and their interactions.

## Overview

The AIGNE loader system is designed to interpret a set of configuration files, starting with a root `aigne.yaml` file, to build a complete runtime environment. This process involves parsing the project-level settings, discovering all specified agents and skills, and instantiating them into executable objects. The loader supports defining agents in both YAML for simplicity and JavaScript/TypeScript for more complex, programmatic logic.

The loading process can be visualized as follows:

```d2
direction: down

Config-Sources: {
  label: "Configuration Sources"
  shape: rectangle

  aigne-yaml: "aigne.yaml\n(Root Entry Point)"
  
  definitions: {
    label: "Agent & Skill Definitions"
    shape: rectangle
    grid-columns: 2

    yaml-files: "YAML Files\n(.yml)"
    ts-js-files: "TypeScript/JavaScript\n(.ts, .js)"
  }
}

Loader: {
  label: "AIGNE Loader System"
  shape: rectangle
}

Runtime: {
  label: "Initialized Runtime Environment"
  shape: rectangle
  
  Objects: {
    label: "Live Objects in Memory"
    shape: rectangle
    grid-columns: 2

    Agent-Instances: "Agent Instances"
    Skill-Instances: "Skill Instances"
  }
}

Config-Sources.aigne-yaml -> Loader: "1. Read"
Config-Sources.definitions -> Loader: "2. Discover"
Loader -> Loader: "3. Parse & Build"
Loader -> Runtime.Objects: "4. Instantiate"
```

## Core Functionality

The loader system is orchestrated by a few key functions that handle the discovery, parsing, and instantiation of your project's configuration.

### The `load` function

This is the main entry point for the loader system. It takes a path to your project directory (or a specific `aigne.yaml` file) and an options object, then returns a fully resolved `AIGNEOptions` object ready for use.

```typescript
// From: packages/core/src/loader/index.ts

export async function load(path: string, options: LoadOptions = {}): Promise<AIGNEOptions> {
  // ... implementation
}
```

### The `loadAgent` function

This function is responsible for loading a single agent from a file. It automatically detects the file type (YAML or JavaScript/TypeScript) and uses the appropriate parser.

```typescript
// From: packages/core/src/loader/index.ts

export async function loadAgent(
  path: string,
  options?: LoadOptions,
  agentOptions?: AgentOptions,
): Promise<Agent> {
  // ... implementation
}
```

## Project Configuration: `aigne.yaml`

The `aigne.yaml` (or `aigne.yml`) file is the root of your project's configuration. The loader searches for this file in the provided path to begin the loading process.

### `aigne.yaml` Schema

Here are the top-level properties you can define in your `aigne.yaml` file:

| Key | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | The name of your project. |
| `description` | `string` | A brief description of your project. |
| `model` | `string` or `object` | Default chat model configuration for all agents. Can be overridden by individual agents. |
| `imageModel` | `string` or `object` | Default image model configuration for all agents. |
| `agents` | `string[]` | A list of paths to agent definition files to be loaded. |
| `skills` | `string[]` | A list of paths to skill definition files to be globally available. |
| `mcpServer` | `object` | Configuration for the MCP (Multi-agent Communication Protocol) server, including a list of agents to expose. |
| `cli` | `object` | Configuration for the command-line interface, defining chat agents and agent command structures. |

### Example `aigne.yaml`

This example demonstrates a typical project setup, defining a default model, and listing various agents and skills to be loaded.

```yaml
# Source: packages/core/test-agents/aigne.yaml
name: test_aigne_project
description: A test project for the aigne agent
chat_model:
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
  - chat-with-prompt.yaml
  - team.yaml
  - image.yaml
  - agents/test-relative-prompt-paths.yaml
skills:
  - sandbox.js
mcp_server:
  agents:
    - chat.yaml
cli:
  agents:
    - chat.yaml
    - test-cli-agents/b.yaml
    - url: test-cli-agents/a.yaml
      name: a-renamed
      description: A agent from a.yaml
      alias: ["a", "a-agent"]
      agents:
        - url: test-cli-agents/a-1.yaml
          agents:
            - url: test-cli-agents/a-1-1.yaml
            - url: test-cli-agents/a-1-2.yaml
              name: a12-renamed
              description: A agent from a-1-2.yaml
        - test-cli-agents/a-2.yaml
```

## Agent Configuration (YAML)

Agents are the fundamental building blocks of the AIGNE platform. You can define them in YAML files for a declarative and easy-to-read format.

### Common Agent Properties

All agent types share a set of common properties:

| Key | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | A unique name for the agent. |
| `description` | `string` | A description of the agent's purpose and capabilities. |
| `model` | `string` or `object` | Overrides the default chat model for this specific agent. |
| `inputSchema` | `string` or `object` | A path to a JSON schema file or an inline schema defining the expected input. |
| `outputSchema` | `string` or `object` | A path to a JSON schema file or an inline schema defining the expected output. |
| `skills` | `(string or object)[]` | A list of skills (tools) available to this agent. Can be a path to a skill file or a nested agent definition. |
| `memory` | `boolean` or `object` | Enables memory for the agent. Can be a simple `true` or an object for advanced configuration. |
| `hooks` | `object` or `object[]` | Defines hooks that trigger other agents at different points in the lifecycle (e.g., `onStart`, `onSuccess`). |

### Agent Types

The `type` property determines the agent's core behavior.

#### 1. AI Agent (`type: "ai"`)

The most common type, used for general-purpose AI tasks. It uses a large language model to process instructions and interact with skills.

-   **`instructions`**: Defines the agent's prompt. Can be a string, an object with `role` and `content`, or a reference to a file using `url`.
-   **`inputKey`**: The key in the input object that should be treated as the main user message.
-   **`toolChoice`**: Controls how the agent uses tools (e.g., `auto`, `required`).

**Example:**

```yaml
# Source: packages/core/test-agents/chat-with-prompt.yaml
name: chat-with-prompt
description: Chat agent
instructions:
  url: chat-prompt.md
input_key: message
memory: true
skills:
  - sandbox.js
```

#### 2. Image Agent (`type: "image"`)

Specialized for generating images based on a prompt.

-   **`instructions`**: (Required) The prompt used for image generation.
-   **`modelOptions`**: A dictionary of options specific to the image generation model.

#### 3. Team Agent (`type: "team"`)

Orchestrates a group of agents (skills) to work together on a task.

-   **`mode`**: The processing mode, such as `parallel` or `sequential`.
-   **`iterateOn`**: The key from the input to iterate over when processing with skills.
-   **`reflection`**: Configures a review process where a `reviewer` agent approves or requests changes to the output.

#### 4. Transform Agent (`type: "transform"`)

Transforms input data using a JSONata expression.

-   **`jsonata`**: (Required) A string containing the JSONata expression to apply to the input.

#### 5. MCP Agent (`type: "mcp"`)

Acts as a client to an external agent or service.

-   **`url`**: The URL of the external agent.
-   **`command`**: A shell command to execute.

#### 6. Function Agent (`type: "function"`)

Defined programmatically in a JavaScript/TypeScript file. This type is specified in the JS/TS file itself, not in YAML.