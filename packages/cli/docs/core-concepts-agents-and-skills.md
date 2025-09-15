---
labels: ["Reference"]
---

# Agents and Skills

In the AIGNE ecosystem, Agents and Skills are the fundamental building blocks that bring your AI applications to life. They work together to create sophisticated, tool-augmented AI systems. Think of an Agent as the brain responsible for reasoning and conversation, and Skills as the tools it uses to perform actions and interact with the outside world.

This section covers the definition and structure of these core components. For details on how to wire them together in your project, see the [Project Configuration (aigne.yaml)](./core-concepts-project-configuration.md) documentation.

## Agents

An Agent is the central component that processes user input, maintains context, and decides which actions to take. Its behavior is defined by a set of instructions (its core prompt) and the collection of Skills it has access to.

Agents are typically defined in `.yaml` files.

### Agent Definition Example

Here is a basic example of a chat agent that is equipped with a code execution skill.

```yaml chat.yaml icon=mdi:robot-outline
name: chat
description: Chat agent
instructions: |
  You are a helpful assistant that can answer questions and provide information on a wide range of topics.
  Your goal is to assist users in finding the information they need and to engage in friendly conversation.
input_key: message
memory: true
skills:
  - sandbox.js
```

### Agent Properties

The agent's behavior is configured through several key properties in its YAML definition file:

| Property       | Type      | Description                                                                                             |
|----------------|-----------|---------------------------------------------------------------------------------------------------------|
| `name`         | `string`  | A short, descriptive name for the agent.                                                                |
| `description`  | `string`  | A more detailed explanation of the agent's purpose.                                                     |
| `instructions` | `string`  | The system prompt that defines the agent's personality, goals, and constraints. This is its core logic. |
| `input_key`    | `string`  | The name of the property in the input object that contains the primary user message (e.g., `message`).   |
| `memory`       | `boolean` | If `true`, the agent will retain conversation history, allowing for follow-up questions and context.      |
| `skills`       | `array`   | A list of skill files (e.g., `sandbox.js`) that the agent is authorized to use.                         |

## Skills

A Skill is an executable function, typically written in JavaScript, that provides an Agent with a specific capability. This could be anything from running code, fetching data from an API, or interacting with a file system. Skills are the bridge between the Large Language Model's reasoning and the execution of concrete tasks.

### Skill Definition Example

Skills are standard Node.js modules that export a default asynchronous function. Crucially, they also export metadata that describes their purpose and defines their input/output structure, allowing the agent to understand how and when to use them.

```javascript sandbox.js icon=logos:javascript
import vm from "node:vm";

export default async function evaluateJs({ code }) {
  const sandbox = {};
  const context = vm.createContext(sandbox);
  const result = vm.runInContext(code, context, { displayErrors: true });
  return { result };
}

evaluateJs.description = "This agent evaluates JavaScript code.";

evaluateJs.input_schema = {
  type: "object",
  properties: {
    code: { type: "string", description: "JavaScript code to evaluate" },
  },
  required: ["code"],
};

evaluateJs.output_schema = {
  type: "object",
  properties: {
    result: { type: "any", description: "Result of the evaluated code" },
  },
  required: ["result"],
};
```

### Skill Structure

A skill file consists of three main parts:

1.  **Default Exported Function**: The core logic of the skill. It's an `async` function that receives an object of arguments and returns a result.
2.  **`description`**: A string property attached to the function that provides a natural language description of what the skill does. The agent's underlying LLM uses this description to determine when it's appropriate to call this skill.
3.  **`input_schema` / `output_schema`**: JSON Schema objects that define the expected structure and types for the function's input and output. This ensures that the agent provides valid arguments and can correctly interpret the results.

## How They Work Together

The interaction between a user, an agent, and a skill follows a clear pattern. The agent acts as an intelligent orchestrator, interpreting the user's request and invoking the appropriate skill to fulfill it.

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Runtime: {
  label: "AIGNE Runtime"
  shape: rectangle

  Chat-Agent: {
    label: "Chat Agent"
  }

  Sandbox-Skill: {
    label: "Sandbox Skill (sandbox.js)"
  }
}

User -> AIGNE-Runtime.Chat-Agent: "1. Input: 'What is 5 + 7?'"
AIGNE-Runtime.Chat-Agent -> AIGNE-Runtime.Chat-Agent: "2. LLM reasons it needs to calculate"
AIGNE-Runtime.Chat-Agent -> AIGNE-Runtime.Sandbox-Skill: "3. Invokes skill with { code: '5 + 7' }"
AIGNE-Runtime.Sandbox-Skill -> AIGNE-Runtime.Sandbox-Skill: "4. Executes code in a sandbox"
AIGNE-Runtime.Sandbox-Skill -> AIGNE-Runtime.Chat-Agent: "5. Returns { result: 12 }"
AIGNE-Runtime.Chat-Agent -> User: "6. Formulates response: 'The result is 12.'"
```

By separating the reasoning (Agent) from the execution (Skill), you can build powerful and extensible AI systems that are easy to maintain and upgrade.

### Next Steps

Now that you understand the core concepts of Agents and Skills, you can proceed to the following sections:

<x-cards>
  <x-card data-title="Project Configuration (aigne.yaml)" data-icon="lucide:file-cog" data-href="/core-concepts/project-configuration">
    Learn how to configure agents, skills, and models in the main project configuration file.
  </x-card>
  <x-card data-title="Creating a Custom Agent" data-icon="lucide:wand-sparkles" data-href="/guides/creating-a-custom-agent">
    Follow a step-by-step guide to build your own custom agent and integrate it as a skill.
  </x-card>
</x-cards>