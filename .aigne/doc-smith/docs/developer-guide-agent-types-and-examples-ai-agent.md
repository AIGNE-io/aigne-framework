# AI Agent

The `AIAgent` is a specialized agent that connects to a language model to process inputs and generate responses. It serves as the primary bridge between your application's logic and the power of large language models (LLMs). This agent is designed to be highly configurable, supporting features like customizable prompts, tool usage (function calling), and response streaming.

You can create an `AIAgent` either programmatically using TypeScript or declaratively using a YAML configuration file.

## Basic Usage

Here is a fundamental example of creating and invoking an `AIAgent` using TypeScript. This demonstrates the core components: an AI model, the agent itself, and the AIGNE engine to run it.

```typescript A Basic AI Agent icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. Create an instance of an AI model
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// 2. Create the AI agent with instructions
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// 3. Use the AIGNE engine to orchestrate the execution
const aigne = new AIGNE({ model });

// 4. Invoke the agent and send a message
const userAgent = await aigne.invoke(agent);
const response = await userAgent.invoke(
  "Hello, can you help me write a short article?",
);

console.log(response);
```

## Configuration Options

The `AIAgent` can be customized through a set of options passed to its constructor. These options allow you to control everything from the prompt instructions to how the agent uses tools.

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="false">
    <x-field-desc markdown>Instructions to guide the AI model's behavior. This can be a simple string or a `PromptBuilder` instance for creating complex, dynamic prompts. See the [Prompts](./developer-guide-core-concepts-prompts.md) documentation for more details.</x-field-desc>
  </x-field>
  <x-field data-name="inputKey" data-type="string" data-required="false" data-desc="Specifies which key from the input message should be used as the primary user message for the model."></x-field>
  <x-field data-name="outputKey" data-type="string" data-default="message" data-required="false" data-desc="Defines the key under which the agent's text response will be stored in the output message."></x-field>
  <x-field data-name="toolChoice" data-type="AIAgentToolChoice | Agent" data-default="auto" data-required="false">
    <x-field-desc markdown>Controls how the agent uses tools. Can be set to `auto`, `none`, `required`, or `router`.</x-field-desc>
  </x-field>
  <x-field data-name="memoryAgentsAsTools" data-type="boolean" data-default="false" data-required="false" data-desc="If true, memory agents are made available as tools for the model to call directly, allowing it to retrieve or store information explicitly."></x-field>
  <x-field data-name="catchToolsError" data-type="boolean" data-default="true" data-required="false" data-desc="If false, the agent will throw an error if a tool fails. Otherwise, it catches the error and continues processing."></x-field>
  <x-field data-name="structuredStreamMode" data-type="boolean" data-default="false" data-required="false" data-desc="Enables a mode where the agent's streaming response is parsed to extract structured metadata (e.g., JSON or YAML) embedded within special tags."></x-field>
</x-field-group>

## YAML Configuration

For many use cases, defining agents via YAML files is a more convenient and readable approach. The AIGNE framework can load these files to instantiate and configure agents.

Here is an example of a simple chat agent defined in a YAML file.

```yaml Chat Agent Configuration icon=mdi:file-yaml
name: chat
model: google/gemini-2.5-flash
description: Chat agent
instructions: |
  You are a helpful assistant that can answer questions and provide information on a wide range of topics.
  Your goal is to assist users in finding the information they need and to engage in friendly conversation.
input_key: message
memory: true
skills:
  - sandbox.js
```

In this configuration:
- `name`, `model`, and `description` define the agent's basic properties.
- `instructions` provides the system prompt for the language model.
- `input_key` tells the agent to use the `message` field from the input as the user's query.
- `memory: true` enables memory for the agent.
- `skills` lists the tools (in this case, a JavaScript sandbox) available to the agent.

You can also externalize the instructions into a separate file for better organization.

```yaml Using an External Prompt File icon=mdi:file-yaml
name: chat-with-prompt
description: Chat agent
instructions:
  url: chat-prompt.md
input_key: message
memory: true
skills:
  - sandbox.js
```

## Advanced Features

### Tool Choice

The `toolChoice` option dictates how the agent interacts with its assigned tools (skills).

| Mode       | Description                                                                 |
|------------|-----------------------------------------------------------------------------|
| `auto`     | (Default) The language model decides whether to use a tool based on the user's input. |
| `none`     | Disables all tool usage for the agent.                                      |
| `required` | Forces the agent to use one of the available tools.                         |
| `router`   | The agent makes a single call to the model to select the most appropriate tool, then routes the user's input directly to that tool for execution. This is efficient for creating specialized routing agents. |

### Structured Stream Mode

When `structuredStreamMode` is enabled, the `AIAgent` can parse and extract structured data, like JSON or YAML, directly from a streaming response. The model must be instructed to wrap the structured data in specific tags (e.g., `<metadata>...</metadata>`). This is useful for tasks that require extracting specific entities, classifications, or other structured information alongside a natural language response.

## Summary

The `AIAgent` is a versatile and central component of the AIGNE framework. It provides a robust interface to language models, enhanced with powerful features like tool usage, memory integration, and advanced data extraction.

For more complex scenarios, you can combine multiple agents using a [Team Agent](./developer-guide-agent-types-and-examples-team-agent.md) or define sophisticated interaction logic with custom [Prompts](./developer-guide-core-concepts-prompts.md).