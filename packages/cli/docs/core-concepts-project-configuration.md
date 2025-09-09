---
labels: ["Reference"]
---

# Project Configuration (aigne.yaml)

The `aigne.yaml` file is the heart of your AIGNE project. It serves as the central manifest, defining the project's metadata, language model settings, and the relationships between its core components like agents and skills. A well-structured `aigne.yaml` is the first step toward building a powerful and organized agent.

This file uses the YAML format, which is designed to be human-readable and easy to write.

## Core Configuration Keys

Let's break down the primary sections you'll find in a typical `aigne.yaml` file.

### Project Metadata

These fields provide basic information about your project.

- `name`: A unique identifier for your project.
- `description`: A brief summary of what your project does.

```yaml aigne.yaml icon=mdi:file-document
name: test_aigne_project
description: A test project for the aigne agent
```

### Chat Model (`chat_model`)

This is a critical section where you configure the Large Language Model (LLM) that will power your agents. AIGNE provides a flexible way to define the model provider, name, and other parameters.

| Key | Type | Description |
|---|---|---|
| `provider` | string | The LLM provider (e.g., `openai`). Can also be specified as a prefix in the `model` key. |
| `name` / `model` | string | The specific model to use (e.g., `gpt-4o-mini`). |
| `temperature` | number | A value between 0 and 2 that controls the randomness of the model's output. Higher values result in more creative responses. |

Here are a couple of common ways to configure the model:

**Example 1: Using `provider` and `name`**

This is a clear, explicit way to define the model.

```yaml aigne.yaml icon=mdi:file-document
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
```

**Example 2: Using a prefixed `model` key**

This is a more concise shorthand format.

```yaml aigne.yaml icon=mdi:file-document
chat_model:
  model: openai:gpt-4o-mini
  temperature: 0.8
```

### Agents (`agents`)

The `agents` key lists all the agent definition files (`.yaml`) included in your project. Each file listed here defines the behavior, prompts, and tool usage for a specific agent.

```yaml aigne.yaml icon=mdi:file-document
# ... other configurations
agents:
  - chat.yaml
```

### Skills (`skills`)

The `skills` key lists the executable code or definitions that provide your agents with tools and capabilities. These can be JavaScript files (`.js`) containing functions or other YAML files that define complex skills.

```yaml aigne.yaml icon=mdi:file-document
# ... other configurations
skills:
  - sandbox.js
  - filesystem.yaml
```

### Service and CLI Exposure

You can also configure how your agents are exposed to the outside world, whether through a server or as command-line tools.

- `mcp_server`: Configures which agents are served via the Model Context Protocol (MCP) when you run the `aigne serve-mcp` command.
- `cli`: Configures which agents can be run directly from the command line.

```yaml aigne.yaml icon=mdi:file-document
# ... other configurations
mcp_server:
  agents:
    - chat.yaml

cli:
  agents:
    - chat.yaml
```

## Complete Example

Here is a complete `aigne.yaml` file that brings all these elements together:

```yaml aigne.yaml icon=mdi:file-document
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

With this configuration file in place, you have a solid foundation for your project. The next step is to define what your agents and skills actually do.

---

Now that you understand how to configure the project, let's explore the core components in more detail. Continue to the next section to learn about [Agents and Skills](./core-concepts-agents-and-skills.md).