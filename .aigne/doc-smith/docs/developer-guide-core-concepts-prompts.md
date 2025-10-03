# Prompts

In the AIGNE framework, prompts are the primary mechanism for instructing AI models. A well-structured prompt is essential for guiding the model to produce the desired output. The framework provides a flexible and powerful templating system, managed by the `PromptBuilder` class, to create dynamic, reusable, and complex prompts for various agents.

This system allows you to construct multi-turn conversations, insert dynamic data using variables, and reuse common instructions across different prompts through includes.

## The `PromptBuilder` Class

The `PromptBuilder` is the central component responsible for constructing the final input that gets sent to a chat model. It takes a set of instructions, combines them with runtime data such as user input, agent configuration, and context, and compiles them into a structured `ChatModelInput` object.

You can initialize a `PromptBuilder` in several ways:

*   **From a simple string:** For basic, single-message prompts.
*   **From a file path:** To load complex or multi-part prompt templates from external files.
*   **From a structured object:** To define multi-role conversations programmatically.

The `build` method is the core function of the `PromptBuilder`. It orchestrates the entire process of prompt construction, including message formatting, memory integration, and tool configuration.

```typescript PromptBuilder Class icon=logos:typescript
class PromptBuilder {
  /**
   * Constructs the final prompt input for the chat model.
   * @param options - The build options including agent, input, and context.
   * @returns A promise that resolves to the ChatModelInput object.
   */
  async build(options: PromptBuildOptions): Promise<ChatModelInput & { toolAgents?: Agent[] }> {
    // Implementation details...
  }

  // Other methods...
}
```

## Templating with Variables

AIGNE uses a templating engine based on [Nunjucks](https://mozilla.github.io/nunjucks/), which allows you to embed variables directly into your prompts. This makes it possible to dynamically insert user input, data from other agents, or any other contextual information into the prompt at runtime.

Variables are denoted by double curly braces, such as `{{ variable_name }}`.

### Example: Using a Variable in a Prompt

Consider an agent defined with a YAML configuration that includes a variable `topic` in its instructions.

```yaml test-agent-with-multi-roles-instructions.yaml icon=mdi:language-yaml
type: ai
name: test_agent_with_multi_roles_instructions
instructions:
  - role: system
    url: ./test-agent-with-multi-roles-instructions-system.txt
  - role: user
    content: This is a user instruction.
  - role: agent
    content: This is an agent instruction.
  - role: user
    content: Latest user instruction about {{topic}}
input_schema:
  type: object
  properties:
    topic:
      type: string
  required: [topic]
```

When this agent is invoked, the `PromptBuilder` will replace `{{topic}}` with the value provided in the `input` object. For instance, if the agent is invoked with `{ topic: "AIGNE prompts" }`, the final user message sent to the model will be "Latest user instruction about AIGNE prompts".

## Reusable Prompts with Includes

To promote reusability and maintainability, the templating engine supports the `{% include %}` tag. This allows you to import the content of one file directly into another, which is ideal for sharing common instructions, role definitions, or formatting guidelines across multiple agents.

When using includes, it is important to set the `workingDir` option so the template engine can resolve relative file paths correctly.

### Example: Including an Instruction File

Here, a main prompt file includes a separate file containing language-specific instructions.

```markdown chat-prompt.md icon=mdi:markdown
You are a helper agent to answer everything about chat prompt in AIGNE.

{% include "language_instruction.txt" %}
```

The content of `language_instruction.txt` will be inserted into the prompt where the `{% include %}` tag is placed. This allows you to manage the language instructions in a single location and reuse them in any prompt that requires them.

## Multi-Role Conversation Templates

Prompts are not limited to a single system message. You can construct complex, multi-turn conversations by defining a sequence of messages with different roles (`system`, `user`, `agent`). This is achieved using the `ChatMessagesTemplate`, which takes an array of message templates.

Each message can be created using a corresponding template class:

*   `SystemMessageTemplate`: For system-level instructions.
*   `UserMessageTemplate`: For user inputs or questions.
*   `AgentMessageTemplate`: For example responses from the assistant.
*   `ToolMessageTemplate`: For results from tool calls.

This structured approach is essential for few-shot prompting, where you provide examples to the model to guide its behavior and response format.

### Example: Defining a Multi-Role Prompt

The YAML example below defines a conversation with messages from the `system`, `user`, and `agent`.

```typescript Creating a ChatMessagesTemplate icon=logos:typescript
import {
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
  AgentMessageTemplate
} from "@aigne/core";

const instructions = new ChatMessagesTemplate([
  SystemMessageTemplate.from("You are a helpful assistant."),
  UserMessageTemplate.from("What is the capital of France?"),
  AgentMessageTemplate.from("The capital of France is Paris."),
  UserMessageTemplate.from("What is the primary language spoken there?")
]);

// This template can now be used by a PromptBuilder.
```

This structured format allows you to precisely control the conversational history provided to the model, enabling more sophisticated and context-aware interactions.