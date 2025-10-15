# Prompts

Effective communication with AI models is contingent upon the quality and structure of the prompts provided. The AIGNE framework supplies a robust system for creating dynamic, reusable, and structured prompts through its `PromptBuilder` class and the integrated Nunjucks templating engine. This guide provides a systematic explanation of these components.

Refer to the [AI Agent](./developer-guide-agents-ai-agent.md) documentation for more context on how prompts are utilized within agents.

## Prompt Templating with Nunjucks

The framework utilizes the [Nunjucks templating engine](https://mozilla.github.io/nunjucks/) to facilitate the creation of dynamic prompts. This allows for the injection of variables, inclusion of external files, and other programmatic logic directly within your prompt files.

All prompt text is processed by the `PromptTemplate` class, which uses Nunjucks to render the final string.

### Variable Substitution

You can define placeholders in your prompts using the `{{ variable_name }}` syntax. These placeholders are replaced with actual values at runtime.

```markdown title="analyst-prompt.md" icon=mdi:text-box
Analyze the following data:

{{ data }}
```

When invoking an agent with this prompt, you would provide the `data` variable in the input message.

```typescript title="index.ts" icon=logos:typescript
import { AIGNE, AIAgent } from "@aigne/core";
import { OpenAI }s from "@aigne/openai";

const model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const aigne = new AIGNE({
  model,
  agents: {
    analyst: new AIAgent({
      instructions: { path: "./analyst-prompt.md" },
      inputKey: "data",
    }),
  },
});

const result = await aigne.invoke("analyst", {
  data: "User feedback scores: 8, 9, 7, 10, 6.",
});

console.log(result);
```

### File Inclusion

Nunjucks allows for the composition of prompts from multiple files using the `{% include "path/to/file.md" %}` tag. This is highly effective for reusing common instructions or components across different prompts. Paths are resolved relative to the file containing the `include` tag.

For example, you can define a common set of instructions in one file and include it in another.

```markdown title="common-instructions.md" icon=mdi:text-box
Always respond in a professional and factual manner.
Do not speculate or provide opinions.
```

```markdown title="main-prompt.md" icon=mdi:text-box
You are an expert financial analyst.

{% include "./common-instructions.md" %}

Analyze the quarterly earnings report provided.
```

This modular approach simplifies prompt management and ensures consistency.

## Structuring Prompts with ChatMessageTemplate

For chat-based models, prompts are structured as a sequence of messages, each with a specific role. The framework provides classes to represent these messages programmatically.

-   **`SystemMessageTemplate`**: Sets the context or high-level instructions for the AI model.
-   **`UserMessageTemplate`**: Represents a message from the end-user.
-   **`AgentMessageTemplate`**: Represents a previous response from the AI model, useful for few-shot prompting or continuing a conversation.
-   **`ToolMessageTemplate`**: Represents the result of a tool call made by the agent.

These templates can be combined into a `ChatMessagesTemplate` to define a complete conversational prompt.

```typescript title="structured-prompt.ts" icon=logos:typescript
import {
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
} from "@aigne/core";

const promptTemplate = new ChatMessagesTemplate([
  SystemMessageTemplate.from(
    "You are a helpful assistant that translates {{ input_language }} to {{ output_language }}."
  ),
  UserMessageTemplate.from("{{ text }}"),
]);

// This template can then be used in an AIAgent's `instructions`.
```

## The `PromptBuilder` Class

The `PromptBuilder` is the central component responsible for assembling the final, complete prompt that is sent to the language model. It orchestrates the entire process, integrating various inputs into a coherent structure.

The following diagram illustrates the flow of information into the `PromptBuilder`:
<d2>
direction: right
style {
  stroke-width: 2
  font-size: 14
}
"User Input (Message)": {
  shape: document
  style.fill: "#D1E7DD"
}
"Prompt Template (.md)": {
  shape: document
  style.fill: "#D1E7DD"
}
"Agent Configuration": {
  shape: document
  style.fill: "#D1E7DD"
}
Context: {
  shape: document
  style.fill: "#D1E7DD"
}
PromptBuilder: {
  shape: hexagon
  style.fill: "#A9CCE3"
}
"ChatModelInput (to LLM)": {
  shape: document
  style.fill: "#FADBD8"
}

"User Input (Message)" -> PromptBuilder
"Prompt Template (.md)" -> PromptBuilder
"Agent Configuration" -> PromptBuilder
Context -> PromptBuilder

PromptBuilder -> "ChatModelInput (to LLM)"

"Agent Configuration".children: {
  "Skills/Tools"
  Memory
  "Output Schema"
}

"ChatModelInput (to LLM)".children: {
  "Rendered Messages"
  "Tool Definitions"
  "Response Format"
}
</d2>

The `PromptBuilder` automatically performs the following actions during the `build` process:

1.  **Load Instructions**: It loads the prompt template from a string, a file path, or an MCP `GetPromptResult` object.
2.  **Render Templates**: It uses Nunjucks to format the prompt templates, injecting variables from the user's input message.
3.  **Inject Memory**: If the agent is configured to use memory, the `PromptBuilder` retrieves relevant memories and converts them into system, user, or agent messages to provide conversational context.
4.  **Incorporate Tools (Skills)**: It gathers all available skills (from the agent configuration and the invocation context) and formats them into the `tools` and `tool_choice` parameters for the model.
5.  **Define Response Format**: If the agent has an `outputSchema`, the `PromptBuilder` configures the model's `responseFormat` to enforce structured JSON output.

### Instantiation

The most common method for creating a `PromptBuilder` is via the static `PromptBuilder.from()` method, which can accept different sources:

-   **From a string**:
    ```typescript
    const builder = PromptBuilder.from("You are a helpful assistant.");
    ```
-   **From a file path**:
    ```typescript
    const builder = PromptBuilder.from({ path: "./prompts/my-prompt.md" });
    ```

When an `AIAgent` is defined with `instructions`, it internally uses `PromptBuilder.from()` to create and manage the prompt building process.

## Summary

The AIGNE framework provides a layered and powerful system for prompt engineering. By understanding and utilizing `PromptTemplate` with Nunjucks for dynamic content and `PromptBuilder` for orchestrating the final structure, you can create sophisticated, modular, and effective prompts for your AI agents.

For further reading, explore the [AIAgent documentation](./developer-guide-agents-ai-agent.md) to see how these prompts are integrated into the agent lifecycle.