# Prompts

The prompt building and templating system is a core component for creating dynamic and powerful interactions with AI models. It consists of two main parts:

1.  **Prompt Templates**: A flexible system using Nunjucks for creating dynamic, reusable prompt components.
2.  **Prompt Builder**: A high-level orchestrator that assembles templates, context, memories, tools, and output schemas into a complete `ChatModelInput` ready to be sent to a model.

### `PromptBuilder` Workflow

The `PromptBuilder` is the central class that orchestrates all the different pieces—templates, user input, context, memories, and tools—to construct a final, model-ready `ChatModelInput` object. The following diagram illustrates this process:

```d2
direction: down

Inputs: {
  label: "Builder Inputs"
  shape: rectangle
  style.stroke-dash: 2
  grid-columns: 2

  User-Input
  Context
  Memories
  Tools
  Output-Schemas: "Output Schemas"

  Templates: {
    label: "Prompt Templates"
    shape: rectangle

    Nunjucks-Engine: {
      label: "Nunjucks Engine"
      style.fill: "#f5f5f5"
    }

    PromptTemplate: {
      label: "PromptTemplate\n(for string formatting)"
    }

    ChatMessagesTemplate: {
      label: "ChatMessagesTemplate\n(for conversations)"
      grid-columns: 2
      SystemMessageTemplate
      UserMessageTemplate
      AgentMessageTemplate
      ToolMessageTemplate
    }
  }
}

PromptBuilder: {
  label: "PromptBuilder"
  shape: rectangle
  style.fill: "#e6f7ff"
}

ChatModelInput: {
  label: "ChatModelInput"
  shape: rectangle
  style.fill: "#d9f7be"
}

AI-Model: {
  label: "AI Model"
  shape: cylinder
}

Inputs.Templates.PromptTemplate -> Inputs.Templates.Nunjucks: "uses"
Inputs.Templates.ChatMessagesTemplate -> Inputs.Templates.Nunjucks: "uses"

Inputs -> PromptBuilder: "Assembled by .build()"
PromptBuilder -> ChatModelInput: "Generates"
ChatModelInput -> AI-Model: "Sent to"

```

## Prompt Templates

Prompt templates allow you to define the structure of your prompts and conversations, using variables and including other files to create modular and maintainable prompt instructions.

### `PromptTemplate`

The `PromptTemplate` class is a simple wrapper around a Nunjucks template string. It allows you to format a string with variables.

**Key Features:**

*   **Variable Substitution**: Inject dynamic data into your prompts.
*   **File Inclusion**: Build complex prompts by including other template files using the `{% raw %}{% include "path/to/file.md" %}{% endraw %}` syntax.

**Example:**

Let's say you have two template files:

**`./main-prompt.md`**
```markdown
You are a professional chatbot.

{% raw %}{% include "./personality.md" %}{% endraw %}
```

**`./personality.md`**
```markdown
Your name is {% raw %}{{ name }}{% endraw %}.
```

You can use `PromptTemplate` to render this structure by providing a `workingDir` to resolve the relative include path.

```typescript
import { PromptTemplate } from "packages/core/src/prompt/template.ts";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";

// Path to the main template file
const templatePath = '/path/to/your/prompts/main-prompt.md';
const workingDir = nodejs.path.dirname(templatePath);

// Assume you read the content of main-prompt.md
const templateContent = 'You are a professional chatbot.\n\n{% include "./personality.md" %}';

const template = PromptTemplate.from(templateContent);

const formattedPrompt = await template.format(
  { name: "Alice" },
  { workingDir: workingDir } // Provide workingDir for includes
);

console.log(formattedPrompt);
// Output:
// You are a professional chatbot.
//
// Your name is Alice.
```

### Chat Message Templates

For chat-based models, the library provides a set of classes to represent different roles in a conversation, making it easy to structure multi-turn dialogues.

*   `SystemMessageTemplate`: Represents a system-level instruction.
*   `UserMessageTemplate`: Represents a message from the user.
*   `AgentMessageTemplate`: Represents a message from the AI agent.
*   `ToolMessageTemplate`: Represents the output of a tool call.
*   `ChatMessagesTemplate`: A container for an array of message templates.

**Example:**

```typescript
import {
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate
} from "packages/core/src/prompt/template.ts";

const conversationTemplate = ChatMessagesTemplate.from([
  SystemMessageTemplate.from("You are a helpful assistant who speaks like a pirate."),
  UserMessageTemplate.from("My name is {% raw %}{{ name }}{% endraw %}. What is my name?"),
]);

const messages = await conversationTemplate.format({ name: "Captain Hook" });

console.log(messages);
// Output:
// [
//   { role: 'system', content: 'You are a helpful assistant who speaks like a pirate.' },
//   { role: 'user', content: 'My name is Captain Hook. What is my name?' }
// ]
```

## `PromptBuilder`

The `PromptBuilder` is the high-level class that assembles all components—templates, user input, context, memories, tools, and schemas—into a final, model-ready `ChatModelInput` object.

### How it Works

The builder follows a clear process encapsulated within the `build` method:
1.  **Resolve Instructions**: It starts with the base instructions, which can be a string or a `ChatMessagesTemplate`.
2.  **Integrate Memories**: If the agent is configured to use memories, the builder retrieves them and formats them into chat messages.
3.  **Add User Input**: It appends the current user message and any attached files.
4.  **Configure Tools**: It gathers all available tools (skills) from the agent and the current context, formats them for the model, and determines the `toolChoice` strategy.
5.  **Set Response Format**: If an `outputSchema` is provided, it configures the model's `responseFormat` to ensure structured output (e.g., JSON).

### Example

Here is a comprehensive example of how `PromptBuilder` assembles a complete request.

```typescript
import { PromptBuilder } from "packages/core/src/prompt/prompt-builder.ts";
import { AIAgent } from "packages/core/src/agents/ai-agent.ts";
import { z } from "zod";

// 1. Define an agent with instructions and an output schema
const myAgent = new AIAgent({
  name: "UserExtractor",
  description: "Extracts user details from text.",
  instructions: "Extract the user's name and age from the following text.",
  outputSchema: z.object({
    name: z.string().describe("The user's full name"),
    age: z.number().describe("The user's age in years"),
  }),
});

// 2. Create a PromptBuilder instance
const builder = new PromptBuilder();

// 3. Define the user's input message
const userInput = {
  message: "My name is John Doe and I am 30 years old.",
};

// 4. Build the final ChatModelInput
const chatModelInput = await builder.build({
  agent: myAgent,
  input: userInput,
});

console.log(JSON.stringify(chatModelInput, null, 2));
// Output:
// {
//   "messages": [
//     {
//       "role": "system",
//       "content": "Extract the user's name and age from the following text."
//     },
//     {
//       "role": "user",
//       "content": [
//         {
//           "type": "text",
//           "text": "My name is John Doe and I am 30 years old."
//         }
//       ]
//     }
//   ],
//   "responseFormat": {
//     "type": "json_schema",
//     "jsonSchema": {
//       "name": "output",
//       "schema": {
//         "type": "object",
//         "properties": {
//           "name": {
//             "type": "string",
//             "description": "The user's full name"
//           },
//           "age": {
//             "type": "number",
//             "description": "The user's age in years"
//           }
//         },
//         "required": ["name", "age"]
//       },
//       "strict": true
//     }
//   }
// }
```