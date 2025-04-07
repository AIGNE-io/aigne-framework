# AIGNE Agent Development Guide

**English** | [中文](agent-development.zh.md)

The AIGNE framework enables developers to create powerful AI agents through simple configuration and code files. This guide details how to write the core files of the AIGNE framework: the project configuration file `aigne.yaml`, agent definition files (which can be in YAML format like `chat.yaml` or JavaScript format like `plus.js`), and corresponding test files.

## Table of Contents

- [Project Configuration File (aigne.yaml)](#project-configuration-file-aigneyaml)
- [YAML Format Agent Definition (chat.yaml)](#yaml-format-agent-definition-chatyaml)
- [JavaScript Format Agent Definition (plus.js)](#javascript-format-agent-definition-plusjs)
- [MCP Format Agent Definition (filesystem.yaml)](#mcp-format-agent-definition-filesystemyaml)
- [Agent Test File (plus.test.js)](#agent-test-file-plustestjs)
- [Development Process and Best Practices](#development-process-and-best-practices)

## Project Configuration File (aigne.yaml)

`aigne.yaml` is the main configuration file for AIGNE projects, defining the overall settings of the project and the list of included agents.

### Basic Structure

```yaml
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
```

### Configuration Options Explained

- `chat_model`: Defines the default AI model configuration
  - `provider`: [Optional] Model provider, possible values are `openai`, `claude`, `xai`
  - `name`: Model name (such as `gpt-4o-mini`, `gpt-4o`, etc.)
  - `temperature`: Randomness of the model output (0.0-1.0). Lower values produce more deterministic outputs; higher values produce more diverse and innovative outputs.
  - `top_p`: [Optional] Number of highest probability tokens to consider during sampling
  - `frequency_penalty`: [Optional] Reduces the probability of repeating tokens
  - `presence_penalty`: [Optional] Increases the probability of new tokens appearing
- `agents`: List of paths to all agent configuration files included in the project

## YAML Format Agent Definition (chat.yaml)

Agents can be defined through YAML files (such as `chat.yaml`), specifying the agent's basic information, instructions, and available tools.

### Basic Structure

```yaml
name: chat
description: Chat agent
instructions: |
  You are a helpful assistant that can answer questions and provide information on a wide range of topics.
  Your goal is to assist users in finding the information they need and to engage in friendly conversation.
input_schema:
  type: object
  properties:
    message:
      type: string
      description: User message
  required:
    - "message"
output_schema:
  type: object
  properties:
    response:
      type: string
      description: AI response
  required:
    - "response"
output_key: text
tools:
  - plus.js
```

### Configuration Options Explained

- `name`: Unique identifier for the agent, used to reference the agent in the system
- `description`: Brief description of the agent's functionality and purpose
- `instructions`: Detailed instructions guiding the agent's behavior (using YAML's multi-line text format)
- `input_schema`: [Optional] JSON Schema definition of input parameters
  - `type`: Type of input data (top level must be `object`)
  - `properties`: Detailed definition of input parameters
  - `required`: List of parameters that must be provided
- `output_schema`: [Optional] JSON Schema definition of output results (only used when structured data output is needed)
  - `type`: Type of output data (top level must be `object`)
  - `properties`: Detailed definition of output results
  - `required`: List of parameters that must be returned
- `output_key`: [Optional] Key name for output text (default is `$message`, only valid when there is no `output_schema`)
- `tools`: [Optional] List of tools the agent can use (JavaScript files implementing specific functionality)

## JavaScript Format Agent Definition (plus.js)

Agents can also be defined directly through JavaScript code, such as `plus.js`. These files export an asynchronous function that receives input parameters and returns results.

### Basic Structure

```javascript
export default async function plus({ a, b }) {
  return { sum: a + b };
}

plus.description = "This agent adds two numbers together.";

plus.input_schema = {
  type: "object",
  properties: {
    a: { type: "number", description: "First number" },
    b: { type: "number", description: "Second number" },
  },
  required: ["a", "b"],
};

plus.output_schema = {
  type: "object",
  properties: {
    sum: { type: "number", description: "Sum of a and b" },
  },
  required: ["sum"],
};
```

### Structure Explained

- `export default async function xxx()`: Main function of the tool, receives input parameters and returns results
- `xxx.description`: Function description, providing a brief explanation of the tool
- `xxx.input_schema`: JSON Schema definition of input parameters, standard JSON Schema format
- `xxx.output_schema`: JSON Schema definition of output results, standard JSON Schema format

## MCP Format Agent Definition (filesystem.yaml)

AIGNE also supports [MCP (Model Context Protocol)](https://modelcontextprotocol.io/introduction) agents, which allow you to connect to external tools and resources through MCP servers. These are defined through YAML files with a specific format.

### Basic Structure

MCP agents can be defined in two ways:

1. Using a local command:

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
```

2. Using a URL to connect to a remote MCP server:

```yaml
type: mcp
url: "http://localhost:3000"
```

### Configuration Options Explained

When using a local command:
- `type`: Must be set to `mcp` to indicate this is an MCP agent
- `command`: The base command to run the MCP server
- `args`: Array of arguments to pass to the command
  - The first element is often a package name that implements an MCP server
  - Additional arguments can be passed as needed by the specific MCP server

When connecting to a remote server:
- `type`: Must be set to `mcp` to indicate this is an MCP agent
- `url`: URL of the remote MCP server to connect to

### How MCP Agents Work

MCP agents work by connecting to MCP servers that implement the Model Context Protocol. These servers can provide:

1. **Tools**: Executable functions that can be called by the AI
2. **Resources**: Data sources that can be accessed by the AI
3. **Resource Templates**: Patterns for dynamically generating resources

When an MCP agent is initialized, the AIGNE framework will:

1. Start the MCP server using the provided command and arguments
2. Connect to the server and discover available tools and resources
3. Make these tools and resources available to the AI through a standardized interface

## Agent Test File (plus.test.js)

AIGNE supports writing tests using the built-in Node.js test framework. Test files are typically located in the same directory as the agent implementation file, named `xxx.test.js`.

```javascript
import assert from "node:assert";
import test from "node:test";
import plus from "./plus.js";

test("plus should add two numbers correctly", async () => {
  assert.deepEqual(await plus({ a: 1, b: 2 }), { sum: 3 });
});
```

## Development Process and Best Practices

### Development Process

1. Install AIGNE CLI: `npm install -g @aigne/cli`
2. Create a project using AIGNE CLI: `aigne create my-project`
3. Modify the `aigne.yaml` configuration according to your needs
4. Create or modify agent definition files:
   - YAML format agents (such as `chat.yaml`)
   - JavaScript format agents (such as `plus.js`)
5. Write test files to verify functionality
6. Use `aigne run` to run the agent, or `aigne test` to execute tests

### Debugging Tips

Use the `DEBUG` environment variable to view detailed logs:

```bash
# Display all AIGNE-related logs
export DEBUG=aigne:*

aigne run
# or
aigne test
```

---

With this guide, you should be able to start developing and testing AIGNE agents. As you deepen your understanding of the framework, you can create more complex and powerful agent systems.

Refer to the [AIGNE official documentation](https://docs.aigne.io) for more advanced features and examples.
