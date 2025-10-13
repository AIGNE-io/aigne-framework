# @aigne/anthropic

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/anthropic)](https://www.npmjs.com/package/@aigne/anthropic)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/anthropic)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE Anthropic SDK for integrating with Claude AI models within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/anthropic` provides a seamless integration between the AIGNE Framework and Anthropic's Claude language models. This package enables developers to easily leverage Anthropic's powerful models in their AIGNE applications, offering a consistent interface while harnessing Claude's advanced AI capabilities.

This diagram illustrates how the `@aigne/anthropic` package connects your AIGNE application to the Anthropic API and its underlying Claude models.

```d2
direction: down

AIGNE-Application: {
  label: "AIGNE Application"
  shape: rectangle

  AIGNE-Framework: {
    label: "AIGNE Framework"
    icon: "https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg"
    shape: rectangle

    aigne-anthropic: {
      label: "@aigne/anthropic"
      shape: rectangle
    }
  }
}

Anthropic-Service: {
  label: "Anthropic Service"
  shape: rectangle

  Anthropic-API: {
    label: "Anthropic API"
  }

  Claude-Models: {
    label: "Claude Models"
    claude-3-haiku: "claude-3-haiku"
    claude-3-sonnet: "claude-3-sonnet"
  }
}

AIGNE-Application.AIGNE-Framework.aigne-anthropic -> Anthropic-Service.Anthropic-API: "Integrates via SDK"
Anthropic-Service.Anthropic-API -> Anthropic-Service.Claude-Models: "Accesses"
```

## Features

*   **Anthropic API Integration**: Direct connection to Anthropic's API services using the official SDK.
*   **Chat Completions**: Full support for Claude's chat completions API with all available models.
*   **Tool Calling**: Built-in support for Claude's powerful tool-calling capabilities.
*   **Streaming Responses**: Enable streaming for more responsive and real-time applications.
*   **Type-Safe**: Comprehensive TypeScript typings for all APIs, models, and options.
*   **Consistent Interface**: Adheres to the AIGNE Framework's unified model interface for cross-provider compatibility.
*   **Robust Error Handling**: Includes built-in error handling and retry mechanisms.
*   **Full Configuration**: Extensive options for fine-tuning model behavior and client settings.

## Installation

To get started, install the `@aigne/anthropic` and `@aigne/core` packages using your preferred package manager.

### npm

```bash
npm install @aigne/anthropic @aigne/core
```

### yarn

```bash
yarn add @aigne/anthropic @aigne/core
```

### pnpm

```bash
pnpm add @aigne/anthropic @aigne/core
```

## Configuration

The `AnthropicChatModel` can be configured during instantiation.

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // API key is optional if ANTHROPIC_API_KEY or CLAUDE_API_KEY is set in your environment
  apiKey: "your-anthropic-api-key",

  // Specify the model ID. Defaults to 'claude-3-7-sonnet-latest'
  model: "claude-3-haiku-20240307",

  // Configure default model parameters
  modelOptions: {
    temperature: 0.7,
    topP: 1.0,
  },
  
  // Pass custom options to the underlying Anthropic SDK client
  clientOptions: {
    timeout: 600000, // 10 minutes
  }
});
```

### Configuration Options

<x-field-group>
    <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="Your Anthropic API key. If not provided, the SDK will check for `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY` environment variables."></x-field>
    <x-field data-name="model" data-type="string" data-required="false" data-desc="The default model ID to use for requests. Defaults to `claude-3-7-sonnet-latest`."></x-field>
    <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Default parameters for the model.">
        <x-field data-name="temperature" data-type="number" data-required="false" data-desc="Controls randomness. Lower values make the model more deterministic."></x-field>
        <x-field data-name="topP" data-type="number" data-required="false" data-desc="Nucleus sampling threshold."></x-field>
        <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="Whether to allow the model to call multiple tools in parallel."></x-field>
    </x-field>
    <x-field data-name="clientOptions" data-type="object" data-required="false" data-desc="Advanced options to pass directly to the Anthropic SDK client, such as `timeout` or `baseURL`."></x-field>
</x-field-group>

## Basic Usage

Here is a basic example of how to invoke the model to get a chat completion.

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: "your-api-key", // Or set ANTHROPIC_API_KEY in env
  model: "claude-3-haiku-20240307",
});

async function getGreeting() {
  const result = await model.invoke({
    messages: [{ role: "user", content: "Write a short, friendly greeting." }],
  });

  console.log(result.text);
}

getGreeting();
/* Output:
Hello there! It's a pleasure to meet you. How can I help you today?
*/
```

## Streaming Responses

For applications requiring real-time output, you can stream the model's response. The `invoke` method returns an `AsyncGenerator` when `streaming: true` is set.

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AnthropicChatModel({
  apiKey: "your-api-key",
  model: "claude-3-haiku-20240307",
});

async function streamStory() {
  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Tell me a short story about a robot." }],
    },
    { streaming: true },
  );

  let fullText = "";
  process.stdout.write("Story: ");
  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.text;
      if (text) {
        fullText += text;
        process.stdout.write(text);
      }
    }
  }
  console.log("\n\nFull story received.");
}

streamStory();
```

## Tool Calling

`AnthropicChatModel` supports tool calling, allowing the model to request the execution of functions you define.

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { z } from "zod";

const model = new AnthropicChatModel({
  apiKey: "your-api-key",
  model: "claude-3-opus-20240229", // Opus is recommended for complex tool use
});

async function callWeatherTool() {
  const result = await model.invoke({
    messages: [{ role: "user", content: "What's the weather like in San Francisco?" }],
    tools: [
      {
        type: "function",
        function: {
          name: "getCurrentWeather",
          description: "Get the current weather for a specific location",
          parameters: z.object({
            location: z.string().describe("The city and state, e.g., San Francisco, CA"),
          }),
        },
      },
    ],
    toolChoice: "auto", // Can be "auto", "required", "none", or a specific tool
  });

  if (result.toolCalls && result.toolCalls.length > 0) {
    const toolCall = result.toolCalls[0];
    console.log("Tool call requested:", toolCall.function.name);
    console.log("Arguments:", toolCall.function.arguments);
    // In a real application, you would execute the tool here
  } else {
    console.log("No tool call was made.");
    console.log("Response:", result.text);
  }
}

callWeatherTool();
/* Output:
Tool call requested: getCurrentWeather
Arguments: { location: 'San Francisco, CA' }
*/
```

## License

This project is licensed under the [Elastic-2.0 License](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md).