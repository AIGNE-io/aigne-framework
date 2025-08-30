---
labels: ["Reference"]
---

# Project Configuration (aigne.yaml)

The `aigne.yaml` file is the central manifest for an AIGNE project. It defines the core components, including the chat model, agents, and skills, and provides project-level metadata. This file is essential for the AIGNE CLI to understand how to run, serve, and manage your agents.

## Key Configuration Sections

The configuration is organized using several top-level keys. Below is a detailed look at the primary sections you will use to define your project.

### Project Metadata

You can provide optional metadata for your project to help identify and describe it.

| Key         | Type   | Description                                  |
|-------------|--------|----------------------------------------------|
| `name`      | String | A unique name for your project.              |
| `description` | String | A brief description of what the project does. |

**Example:**
```yaml
name: test_aigne_project
description: A test project for the aigne agent
```

### `chat_model`

This section specifies the AI model that your agents will use for generating responses. You can define the provider, model name, and parameters that control the model's behavior.

| Key                | Type   | Description                                                                                                                                                             |
|--------------------|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `provider`         | String | The name of the model provider, such as `openai`.                                                                                                                       |
| `name`             | String | The specific identifier for the model, like `gpt-4o-mini`.                                                                                                                |
| `model`            | String | An alternative, combined format for provider and name, e.g., `openai:gpt-4o-mini`.                                                                                      |
| `temperature`      | Number | A value between 0.0 and 2.0 that controls the randomness of the output. Higher values result in more creative responses.                                                  |
| `topP`             | Number | Controls nucleus sampling. The model considers only the tokens with the top P probability mass.                                                                          |
| `presencePenalty`  | Number | A value between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. |
| `frequencyPenalty` | Number | A value between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. |

**Example:**
```yaml
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
```

### `agents`

This is a list of agent definition files that are part of your project. Each entry is a path to a YAML file that specifies an agent's configuration, such as its system prompt and the skills it can access. For more details on defining agents, see the [Agents and Skills](./core-concepts-agents-and-skills.md) section.

**Example:**
```yaml
agents:
  - chat.yaml
```

### `skills`

This list defines the skills available to the agents in your project. Skills are reusable tools or functions that allow agents to perform actions, such as accessing the filesystem or calling external APIs. Skills can be defined in YAML or as JavaScript modules.

**Example:**
```yaml
skills:
  - sandbox.js
  - filesystem.yaml
```

### Specialized Configurations

For more advanced use cases, you can add sections to control how agents are exposed through different interfaces.

- **`mcp_server`**: Specifies which agents are exposed when you run `aigne serve-mcp`. This is useful for integrating your agents with external systems that support the Model Context Protocol.
- **`cli`**: Defines which agents are directly runnable from the command line using the `aigne run` command.

When you configure the `mcp_server` section and run the `aigne serve-mcp` command, the specified agents become available through a local server, as shown below:

![Running the MCP Server](../assets/run-mcp-service.png)

**Example:**
```yaml
mcp_server:
  agents:
    - chat.yaml

cli:
  agents:
    - chat.yaml
```

## Complete Examples

Here are two examples of `aigne.yaml` files, from a basic to a more specific configuration.

### Default Project Configuration

This is a standard configuration file generated when you create a new AIGNE project. It defines a chat model, a default agent, and a couple of built-in skills.

```yaml
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
skills:
  - sandbox.js
  - filesystem.yaml
```

Running an agent from this default project in chat mode with `aigne run --chat` will initiate an interactive session:

![Running a default project in chat mode](../assets/run/run-default-template-project-in-chat-mode.png)

### Project with Metadata and Service Configuration

This example includes project metadata (`name`, `description`) and specifies which agents are available to the MCP server and CLI.

```yaml
name: test_aigne_project
description: A test project for the aigne agent
chat_model:
  model: openai:gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
skills:
  - sandbox.js
mcp_server:
  agents:
    - chat.yaml
cli:
  agents:
    - chat.yaml
```

With `aigne.yaml` properly configured, you have a solid foundation for your project. The next step is to define the behavior and capabilities of your agents and skills. Continue to the [Agents and Skills](./core-concepts-agents-and-skills.md) guide to learn more.