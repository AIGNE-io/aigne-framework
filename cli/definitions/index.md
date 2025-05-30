# Build Your AI Agent Army

**English** | [中文](index.zh.md)

Welcome to the magical world of AIGNE! Here, you can easily create powerful AI agents like building blocks. Whether it's chatbots, tool assistants, or complex intelligent systems, AIGNE can turn your creativity into reality.

**Create your own AI assistant with just a few lines of configuration!**

## Project Configuration File (aigne.yaml) - Your AI World Command Center

`aigne.yaml` is the main configuration file for AIGNE projects, defining the overall project settings and the list of included agents.

### Basic Structure - Surprisingly Simple

```yaml
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
```

### Configuration Options Explained - Every Parameter Has Its Magic

* `chat_model`: Defines the default AI model configuration to use
  * `provider`: \[Optional] Model provider, options include `openai`, `claude`, `xai`
  * `name`: Model name (e.g., `gpt-4o-mini`, `gpt-4o`, etc.)
  * `temperature`: Model output randomness (0.0-1.0). Lower values produce more deterministic output; higher values produce more diverse and creative output.
  * `top_p`: \[Optional] Number of highest probability tokens to consider during sampling
  * `frequency_penalty`: \[Optional] Reduces the probability of repeating tokens
  * `presence_penalty`: \[Optional] Increases the probability of new tokens appearing
* `agents`: List of all agent configuration file paths included in the project

## Agent Definition - Three Creation Methods, Your Choice

Like choosing paintbrushes, AIGNE provides three different ways to create agents. Each method has its unique advantages - choose the one that best fits your project needs:

### [Creating AI Agents](agent.md) - The Most Intuitive Way

* Project configuration file (aigne.yaml) - The starting point
* YAML format agent definition (chat.yaml) - Clean and elegant
* Basic configuration and development workflow - Beginner-friendly

### [Creating MCP Agents](mcp.md) - Bridge to the External World

* MCP agent configuration (filesystem.yaml) - File system integration
* Connect external tools and resources - Unlimited possibilities
* Model Context Protocol integration - Standardized connections

### [Creating Agents through JS Functions](function.md) - Programmer's Favorite

* JavaScript agent implementation (plus.js) - Code as intelligence
* Agent test files (plus.test.js) - Quality assurance
* Advanced features and best practices - Unleash full potential
