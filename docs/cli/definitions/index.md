# Agent Definitions

AIGNE provides flexible AI agent creation methods. You can create various types of AI agents through simple configuration files, including chatbots, tool assistants, and complex intelligent systems.

## Project Configuration File (aigne.yaml)

`aigne.yaml` is the main configuration file for AIGNE projects, defining the overall project settings and the list of included agents.

### Basic Structure

```yaml
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
```

### Configuration Options

* `chat_model`: Defines the default AI model configuration to use
  * `provider`: \[Optional] Model provider, options include `openai`, `claude`, `xai`
  * `name`: Model name (e.g., `gpt-4o-mini`, `gpt-4o`, etc.)
  * `temperature`: Model output randomness (0.0-1.0). Lower values produce more deterministic output; higher values produce more diverse and creative output.
  * `top_p`: \[Optional] Number of highest probability tokens to consider during sampling
  * `frequency_penalty`: \[Optional] Reduces the probability of repeating tokens
  * `presence_penalty`: \[Optional] Increases the probability of new tokens appearing
* `agents`: List of all agent configuration file paths included in the project

## Agent Creation Methods

AIGNE provides three different agent creation methods. You can choose the appropriate method based on your project requirements:

### [Creating AI Agents](agent.md)

* Use YAML format agent definition files
* Suitable for quickly creating chatbots and simple AI assistants
* Simple configuration, easy to get started

### [Creating MCP Agents](mcp.md)

* Connect external resources through Model Context Protocol
* Support file system, database and other external tool integration
* Suitable for complex applications that need to access external data

### [Creating Agents through JS Functions](function.md)

* Use JavaScript functions to implement custom logic
* Support complete testing framework
* Suitable for advanced applications requiring complex business logic
