This guide provides a comprehensive overview of the AIGNE framework, designed to get developers up and running in under 30 minutes. We'll cover the core concepts, project structure, and the essential steps to configure and run your first AI agents.

### Core Concepts

AIGNE is a powerful framework for building, composing, and running AI agents. It uses a declarative approach with YAML files for defining the structure of your project and the behavior of individual agents.

*   **Project:** An AIGNE project is defined by an `aigne.yaml` file, which acts as the central manifest, specifying agents, skills, and default configurations.
*   **Agent:** An Agent is the fundamental building block. It's an entity that can perform tasks, use tools, and interact with other agents. AIGNE supports various types of agents, including `ai`, `team`, `function`, and more.
*   **Skill:** A Skill is a reusable tool or function that can be attached to an agent, giving it specific capabilities.

### Project Structure

The framework is centered around the `aigne.yaml` file. This file orchestrates all the different components of your project.

```yaml
# aigne.yaml - Main Project Configuration

name: test_aigne_project
description: A test project for the aigne agent
chat_model:
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
  - chat-with-prompt.yaml
  - team.yaml
skills:
  - sandbox.js
cli:
  agents:
    - chat.yaml
    - url: test-cli-agents/a.yaml
      name: a-renamed
```

#### Key Configuration Sections

*   **`name` & `description`**: Basic metadata for your project.
*   **`chat_model`**: Defines the default language model and its settings (e.g., `temperature`) for all agents in the project. This can be overridden in individual agent configurations.
*   **`agents`**: A list of YAML or JS files, with each file defining an agent.
*   **`skills`**: A list of files that define reusable skills. These are often JavaScript files that export functions.
*   **`cli`**: Configures which agents are exposed as commands in the command-line interface, making them directly executable from the terminal.

### The Loading Process

When you run an AIGNE project, the framework performs the following steps to load and initialize your agents:

1.  **Find `aigne.yaml`**: It searches for an `aigne.yaml` or `aigne.yml` file in the specified directory.
2.  **Parse Configuration**: The main `aigne.yaml` file is parsed to get project settings and lists of agents and skills.
3.  **Load Agents & Skills**: The framework iterates through the paths defined in the `agents` and `skills` sections. It reads each file and parses the agent/skill definition based on its extension (`.yaml` or `.js`).
4.  **Construct Agents**: Using the parsed definitions, it constructs the agent instances, linking them with their specified models, skills, and any other configurations.
5.  **Expose Agents**: Finally, it makes the agents available through interfaces like the `cli` or an `mcp_server`, as defined in `aigne.yaml`.

This loading mechanism is highly flexible, allowing you to compose complex agent behaviors from simple, reusable parts. The core logic for this process can be found in `packages/core/src/loader/index.ts`.

```d2
direction: down

Developer: {
  shape: c4-person
}

Project-Files: {
  label: "Project Configuration"
  style.stroke-dash: 2
  shape: rectangle

  aigne-yaml: {
    label: "aigne.yaml\n(Project Manifest)"
    shape: rectangle
  }

  Agent-Definitions: {
    label: "Agent Definitions"
    shape: rectangle
    agent1: "chat.yaml"
    agent2: "team.yaml"
  }

  Skill-Definitions: {
    label: "Skill Definitions"
    shape: rectangle
    skill1: "sandbox.js"
  }
}

AIGNE-Loader: {
  label: "AIGNE Core Loader"
  shape: rectangle
}

Constructed-Agents: {
  label: "Constructed Agent Instances\n(In-memory)"
  shape: rectangle
}

Execution-Interfaces: {
  label: "Execution Interfaces"
  style.stroke-dash: 2
  shape: rectangle
  CLI
  MCP-Server
}


AIGNE-Loader -> Project-Files.aigne-yaml: "1. Finds & Parses Manifest"
Project-Files.aigne-yaml -> Project-Files.Agent-Definitions: "references" {
  style.stroke-dash: 2
}
Project-Files.aigne-yaml -> Project-Files.Skill-Definitions: "references" {
  style.stroke-dash: 2
}
AIGNE-Loader -> Project-Files.Agent-Definitions: "2. Loads Definitions"
AIGNE-Loader -> Project-Files.Skill-Definitions: "2. Loads Definitions"
AIGNE-Loader -> Constructed-Agents: "3. Constructs Agents & Links Skills"
Constructed-Agents -> Execution-Interfaces: "4. Exposes Agents"
Developer -> Execution-Interfaces.CLI: "Executes Agent via Command"
```

### Defining an Agent

Agents are typically defined in their own YAML files. The `type` property determines the agent's core behavior.

#### Agent Types

AIGNE supports several agent types, each for a different purpose:

*   **`ai`**: The most common type. An AI agent that uses a language model to process instructions and generate responses. It can use skills (tools) to perform actions.
*   **`image`**: An agent specialized in generating images based on a prompt.
*   **`team`**: A powerful agent that orchestrates a group of other agents to accomplish a complex task.
*   **`mcp`**: An agent that can execute shell commands or connect to a remote MCP server.
*   **`transform`**: An agent that transforms input data using a JSONata expression.
*   **`function`**: An agent that executes a JavaScript function.

#### Example AI Agent

Here is a basic example of an `ai` agent defined in `chat.yaml`:

```yaml
# chat.yaml

type: ai
name: "Chat Agent"
description: "A simple conversational agent."

# Defines the prompt and context for the AI model
instructions:
  - role: system
    content: "You are a helpful assistant."
  - role: user
    content: "Hi, I need help with my task."

# Overrides the default model from aigne.yaml
model:
  name: gpt-4
  temperature: 0.7

# Attaches skills to the agent
skills:
  - "sandbox.js"
```

*   **`type: ai`**: Specifies that this is an AI agent. If omitted, it defaults to `ai`.
*   **`instructions`**: Provides the context and prompt for the language model. It can be a simple string or a list of message objects with `role` and `content`. You can also load instructions from an external file using `url`.
*   **`model`**: Allows you to specify a different model or settings for this specific agent, overriding the project-level default.
*   **`skills`**: A list of skill files that the agent can use as tools.

### Quick Start: Your First "Greeter" Agent

Let's create a simple project to see everything in action.

#### Step 1: Create the Project File

First, create a file named `aigne.yaml` in a new directory.

```yaml
# aigne.yaml
name: "Greeter Project"
description: "A simple project to demonstrate AIGNE."

# Define the agents that are part of this project
agents:
  - "greeter.yaml"

# Make the 'greeter' agent runnable from the command line
cli:
  agents:
    - "greeter.yaml"
```

#### Step 2: Create the Agent Definition

Next, create the agent file `greeter.yaml` in the same directory.

```yaml
# greeter.yaml
name: "Greeter"
description: "A friendly agent that greets the user."

# The instructions for the AI
instructions: "You are a friendly agent. Greet the user based on their name."

# Define the expected input for this agent
inputSchema:
  type: object
  properties:
    name:
      type: string
      description: "The name of the person to greet."
  required:
  - name
```

*   **`instructions`**: We give the agent a simple persona and goal.
*   **`inputSchema`**: We define that this agent requires a `name` as input. AIGNE will automatically prompt the user for this input if it's not provided.

#### Step 3: Run the Agent

Now, you can run your agent from the terminal using the AIGNE CLI.

```bash
aigne run greeter --name "World"
```

**Expected Output:**

```
> Hello, World! It's a pleasure to meet you.
```

You can also run it without providing the name, and it will prompt you for it:

```bash
aigne run greeter
```

**Expected Interaction:**

```
? What is the name of the person to greet? › World
> Hello, World! It's a pleasure to meet you.
```

### What's Next?

Congratulations! You've successfully created and run your first AIGNE agent. From here, you can explore more advanced topics:

*   **Creating Skills**: Give your agents new capabilities by writing custom JavaScript functions.
*   **Building Teams**: Orchestrate multiple agents to solve complex, multi-step problems.
*   **Using Memory**: Provide your agents with long-term memory to recall past interactions.