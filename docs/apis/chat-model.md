# ChatModel API

**English** | [中文](./chat-model.zh.md)

ChatModel is an abstract base class in aigne-framework for interacting with AI large language models. It provides a unified interface to handle different underlying model implementations, such as OpenAI and Anthropic Claude.

## Supported Model Types

Currently, aigne-framework supports the following chat models:

- **OpenAIChatModel**: For communicating with OpenAI's GPT series models (like GPT-4o)
- **ClaudeChatModel**: For communicating with Anthropic's Claude series models

## Model Initialization

Create a ChatModel instance to use directly or provide to an ExecutionEngine:

```typescript
import { OpenAIChatModel, ClaudeChatModel } from "@aigne/core-next";

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
```

## Using with ExecutionEngine

ExecutionEngine is the recommended way to use ChatModel in aigne-framework, as it provides more advanced features such as tool integration, error handling, and state management:

```typescript
import {
  AIAgent,
  ExecutionEngine,
  OpenAIChatModel,
} from "@aigne/core-next";

// Initialize model
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create execution engine
const engine = new ExecutionEngine({
  model,
});

// Create AI Agent
const agent = AIAgent.from({
  instructions: `You are the official assistant for AIGNE...`,
  memory: true,
});

// Run AI Agent
const result = engine.call(agent, "How do I use the AIGNE API?");
console.log(result);
```

## Directly Using ChatModel

### Basic Usage

While ChatModel is typically used through ExecutionEngine in practical applications, you can also use the ChatModel class directly:

```typescript
import {
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
  ClaudeChatModel  // or OpenAIChatModel
} from "@aigne/core-next";

// Initialize model
const model = new ClaudeChatModel({
  apiKey: "YOUR_API_KEY",
});

// Basic usage
const result = await model.call({
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
const result = await model.call({
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
