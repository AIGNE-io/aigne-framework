# AWS Bedrock

Access a variety of foundation models from leading AI companies through Amazon's fully managed AWS Bedrock service. The `@aigne/bedrock` package provides a seamless integration between the AIGNE Framework and AWS Bedrock, allowing you to easily use models like Claude, Llama, and Titan within your AIGNE applications. This gives you a consistent interface while benefiting from AWS's secure and scalable infrastructure.

![AIGNE Bedrock Integration](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-bedrock.png)

## Features

- **Direct AWS Bedrock Integration**: Connects to AWS Bedrock services using the official AWS SDK.
- **Multiple Model Support**: Access Claude, Llama, Titan, and other foundation models available through Bedrock.
- **Chat Completions**: Full support for the chat completions API across all compatible models.
- **Streaming Responses**: Enable streaming for more responsive and interactive applications.
- **Consistent Interface**: Adheres to the standard AIGNE Framework model interface for easy swapping of providers.
- **Full Configuration**: Provides extensive options for fine-tuning model behavior and client settings.
- **Type-Safe**: Comes with comprehensive TypeScript typings for all APIs and models.

## Installation

To get started, install the necessary AIGNE packages in your project.

```bash npm icon=logos:npm
npm install @aigne/bedrock @aigne/core
```

```bash yarn icon=logos:yarn
yarn add @aigne/bedrock @aigne/core
```

```bash pnpm icon=pnpm:pnpm
pnpm add @aigne/bedrock @aigne/core
```

## Configuration

To use the AWS Bedrock models, you need to configure the `BedrockChatModel` with your AWS credentials. You can provide your `accessKeyId` and `secretAccessKey` directly in the constructor or set them as environment variables (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`).

<x-field-group>
  <x-field data-name="accessKeyId" data-type="string" data-required="false">
    <x-field-desc markdown>Your AWS access key ID. Can also be set via the `AWS_ACCESS_KEY_ID` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="secretAccessKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your AWS secret access key. Can also be set via the `AWS_SECRET_ACCESS_KEY` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="region" data-type="string" data-required="false">
    <x-field-desc markdown>The AWS region for the Bedrock service. Can also be set via the `AWS_REGION` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="us.amazon.nova-lite-v1:0">
    <x-field-desc markdown>The specific Bedrock model ID you want to use.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options to configure the model's behavior.</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="Controls randomness in the model's output."></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="Nucleus sampling parameter."></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Advanced configuration options passed directly to the AWS `BedrockRuntimeClient`.</x-field-desc>
  </x-field>
</x-field-group>

## Basic Usage

Here's a simple example of how to invoke a Bedrock model for a chat completion task.

```typescript Bedrock Chat Example icon=logos:typescript
import { BedrockChatModel } from "@aigne/bedrock";

const model = new BedrockChatModel({
  // Provide credentials directly or use environment variables
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  model: "us.amazon.nova-premier-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

**Example Response**

```json Response
{
  "text": "Hello! How can I assist you today?",
  "model": "us.amazon.nova-premier-v1:0",
  "usage": {
    "inputTokens": 10,
    "outputTokens": 9
  }
}
```

## Streaming Responses

For real-time interactions, you can stream the model's response. This is done by setting the `streaming: true` option in the `invoke` method. You can then iterate over the stream to receive chunks of data as they are generated.

```typescript Streaming Example icon=logos:typescript
import { BedrockChatModel } from "@aigne/bedrock";
import { isAgentResponseDelta } from "@aigne/core";

const model = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  model: "us.amazon.nova-premier-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }
}

console.log(fullText); 
console.log(json);
```

**Example Output**

```text Console Output
Hello! How can I assist you today?
{ model: 'us.amazon.nova-premier-v1:0', usage: { inputTokens: 10, outputTokens: 9 } }
```

This package makes it straightforward to integrate a wide array of powerful foundation models into your AIGNE agents via AWS Bedrock. For other model integrations, you might be interested in [Anthropic (Claude)](./models-anthropic.md) or [OpenAI](./models-openai.md).