# AWS Bedrock

The `@aigne/bedrock` package provides a direct and robust integration between the AIGNE Framework and Amazon Web Services (AWS) Bedrock. This allows developers to leverage the diverse range of foundation models available through AWS Bedrock within their AIGNE applications, benefiting from AWS's scalable and secure infrastructure while maintaining a consistent interface.

This guide provides a systematic overview of the installation, configuration, and usage of the `BedrockChatModel`. For details on other models, please refer to the main [Models overview](./models-overview.md).

## Installation

To begin, install the necessary packages using your preferred package manager. The `@aigne/core` package is a required peer dependency.

```bash Terminal
# Using npm
npm install @aigne/bedrock @aigne/core

# Using yarn
yarn add @aigne/bedrock @aigne/core

# Using pnpm
pnpm add @aigne/bedrock @aigne/core
```

## Configuration

Proper configuration involves setting up AWS credentials and instantiating the `BedrockChatModel` with the desired parameters.

### AWS Credentials

The AWS SDK requires credentials to authenticate requests. You can provide them in one of two ways:

1.  **Environment Variables (Recommended)**: Set the following environment variables in your development or deployment environment. The SDK will automatically detect and use them.
    *   `AWS_ACCESS_KEY_ID`: Your AWS access key ID.
    *   `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
    *   `AWS_REGION`: The AWS region where your Bedrock service is enabled (e.g., `us-east-1`).

2.  **Direct Instantiation**: Pass the credentials directly to the `BedrockChatModel` constructor. This method is suitable for specific use cases but is generally less secure than using environment variables.

### BedrockChatModel Options

The `BedrockChatModel` is the primary class for interacting with AWS Bedrock. Its constructor accepts an options object to configure its behavior.

<x-field-group>
  <x-field data-name="accessKeyId" data-type="string" data-required="false">
    <x-field-desc markdown>Your AWS access key ID. If not provided, the SDK will attempt to read it from the `AWS_ACCESS_KEY_ID` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="secretAccessKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your AWS secret access key. If not provided, the SDK will attempt to read it from the `AWS_SECRET_ACCESS_KEY` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="region" data-type="string" data-required="false">
    <x-field-desc markdown>The AWS region for the Bedrock service. If not provided, the SDK will attempt to read it from the `AWS_REGION` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="us.amazon.nova-lite-v1:0">
    <x-field-desc markdown>The ID of the foundation model to use (e.g., `anthropic.claude-3-sonnet-20240229-v1:0`, `meta.llama3-8b-instruct-v1:0`).</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options to control model inference behavior.</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="Controls randomness in the generation. Higher values mean more creative responses."></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="Controls nucleus sampling. The model considers only the tokens with the top P probability mass."></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Advanced configuration options passed directly to the underlying `BedrockRuntimeClient` from the AWS SDK.</x-field-desc>
  </x-field>
</x-field-group>

## Usage Examples

The following examples demonstrate how to use the `BedrockChatModel` for both standard and streaming invocations.

### Basic Usage

This example shows how to instantiate the model and invoke it to get a single, complete response.

```typescript Basic Invocation icon=logos:javascript
import { BedrockChatModel } from "@aigne/bedrock";

// Instantiate the model with credentials and model ID
const model = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID", // Or use environment variables
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY", // Or use environment variables
  region: "us-east-1", // Specify your AWS region
  model: "anthropic.claude-3-haiku-20240307-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

// Define the input messages
const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, what is AWS Bedrock?" }],
});

console.log(result.text);
```

The output will be a string containing the model's response. The `result` object also contains usage metrics.

### Streaming Responses

For applications requiring real-time feedback, you can stream the response as it is generated. This is useful for chatbots and other interactive experiences.

```typescript Streaming Invocation icon=logos:javascript
import { BedrockChatModel } from "@aigne/bedrock";
import { isAgentResponseDelta } from "@aigne/core";

const model = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  region: "us-east-1",
  model: "anthropic.claude-3-haiku-20240307-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, what is AWS Bedrock?" }],
  },
  { streaming: true },
);

let fullText = "";

for await (const chunk of stream) {
  // Use the type guard to check if the chunk is a delta
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text); // Print each part of the response as it arrives
    }
  }
}

console.log("\n--- Full Response ---");
console.log(fullText);
```

This code processes a stream of `AgentResponseChunk` objects. Each chunk contains a delta of the response, which is accumulated to form the complete text.

## Supported Models

AWS Bedrock provides access to a wide variety of foundation models from leading AI companies like Anthropic, Cohere, Meta, Stability AI, and Amazon. You can specify the desired model using its unique `modelId`.

Some commonly used model families include:
-   **Anthropic Claude**: `anthropic.claude-3-sonnet-20240229-v1:0`, `anthropic.claude-3-haiku-20240307-v1:0`
-   **Meta Llama**: `meta.llama3-8b-instruct-v1:0`
-   **Amazon Titan**: `amazon.titan-text-express-v1`

For a complete and up-to-date list of available models and their corresponding IDs, please refer to the [official AWS Bedrock documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html).

## Summary

The `@aigne/bedrock` package offers a streamlined way to integrate powerful foundation models from AWS Bedrock into your AIGNE applications. By following the configuration steps and usage patterns outlined in this guide, you can efficiently build and deploy AI-driven features.

For more advanced topics, such as tool usage and structured outputs, please refer to the [AI Agent](./developer-guide-agents-ai-agent.md) documentation.