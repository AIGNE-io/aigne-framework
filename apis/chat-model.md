# ChatModel API

**English** | [中文](./chat-model.zh.md)

ChatModel is an abstract base class in aigne-framework for interacting with AI large language models. It provides a unified interface to handle different underlying model implementations, such as OpenAI and Anthropic Claude.

## Supported Model Types

Currently, aigne-framework supports the following chat models:

- **OpenAIChatModel**: For communicating with OpenAI's GPT series models (like GPT-4o)
- **ClaudeChatModel**: For communicating with Anthropic's Claude series models
- **XAIChatModel**: For communicating with X.AI's Grok series models

## Model Initialization

Create a ChatModel instance to use directly or provide to an AIGNE:

```typescript
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { ClaudeChatModel } from "@aigne/core/models/claude-chat-model.js";
import { XAIChatModel } from "@aigne/core/models/xai-chat-model.js";

// Initialize OpenAI model
const openaiModel = new OpenAIChatModel({
  apiKey: "YOUR_OPENAI_API_KEY",
  model: "gpt-4o-mini", // Optional, defaults to "gpt-4o-mini"
});

// Initialize Claude model
const claudeModel = new ClaudeChatModel({
  apiKey: "YOUR_ANTHROPIC_API_KEY",
  model: "claude-3-7-sonnet-latest", // Optional, defaults to "claude-3-7-sonnet-latest"
});

// Initialize X.AI Grok model
const xaiModel = new XAIChatModel({
  apiKey: "YOUR_XAI_API_KEY",
  model: "grok-2-latest", // Optional, defaults to "grok-2-latest"
});
```

## Using with AIGNE

AIGNE is the recommended way to use ChatModel in aigne-framework, as it provides more advanced features such as tool integration, error handling, and state management:

```typescript
import {
  AIAgent,
  AIGNE,
} from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// Initialize model
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create AIGNE
const aigne = new AIGNE({
  model,
});

// Create AI Agent
const agent = AIAgent.from({
  instructions: `You are the official assistant for AIGNE...`,
  memory: true,
});

// Run AI Agent
const result = aigne.invoke(agent, "How do I use the AIGNE API?");
console.log(result);
```

## Directly Using ChatModel

### Basic Usage

While ChatModel is typically used through AIGNE in practical applications, you can also use the ChatModel class directly:

```typescript
import {
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
} from "@aigne/core";
import { ClaudeChatModel } from "@aigne/core/models/claude-chat-model.js"; // or OpenAIChatModel

// Initialize model
const model = new ClaudeChatModel({
  apiKey: "YOUR_API_KEY",
});

// Basic usage
const result = await model.invoke({
  messages: ChatMessagesTemplate.from([
    SystemMessageTemplate.from("You are a helpful assistant"),
    UserMessageTemplate.from("Hello, what's the weather like today?")
  ]).format()
});

console.log(result.text); // Output model response
```

### Structured Output

ChatModel supports requesting structured JSON output:

```typescript
const result = await model.invoke({
  messages: messages,
  responseFormat: {
    type: "json_schema",
    jsonSchema: {
      name: "output",
      schema: {
        type: "object",
        properties: {
          text: {
            type: "string",
          },
          sentiment: {
            type: "string",
            enum: ["positive", "neutral", "negative"]
          }
        },
        required: ["text", "sentiment"],
        additionalProperties: false,
      },
      strict: true,
    },
  }
});

// Use structured JSON output
console.log(result.json);
```

### Tool Integration

Please use ChatModel's tool integration capabilities in [AIAgent](./ai-agent-api.md).
