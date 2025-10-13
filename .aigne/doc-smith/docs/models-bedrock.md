This document provides a comprehensive guide to using the `@aigne/bedrock` package, an SDK designed to integrate AWS Bedrock foundation models into the AIGNE Framework. You will learn how to install the package, authenticate with AWS, perform basic operations, and leverage advanced features like streaming and tool usage.

### Target Audience

This documentation is intended for developers who want to use AWS Bedrock's generative AI models within their AIGNE-based applications. A basic understanding of TypeScript, Node.js, and the AIGNE Framework is assumed.

# @aigne/bedrock

`@aigne/bedrock` offers a seamless connection between the AIGNE Framework and AWS Bedrock. It provides a consistent, type-safe interface for leveraging a wide range of foundation models, allowing you to build powerful AI features on top of AWS's secure and scalable infrastructure.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-bedrock-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-bedrock.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-bedrock.png" alt="AIGNE Bedrock Architecture">
</picture>

## Features

-   **Seamless AWS Bedrock Integration**: Connect to AWS Bedrock with minimal configuration using the official AWS SDK.
-   **Multi-Model Support**: Access a variety of foundation models, including Claude, Llama, Titan, and more.
-   **Chat Completions API**: A unified interface for chat-based interactions across all supported models.
-   **Streaming Responses**: Built-in support for streaming to create responsive, real-time applications.
-   **Type-Safe**: Fully typed with TypeScript to ensure safety and improve developer experience.
-   **AIGNE Framework Compatibility**: Adheres to the AIGNE Framework's model interface for consistent usage.
-   **Robust Error Handling**: Includes mechanisms for handling errors and retrying requests.
-   **Extensive Configuration**: Offers a wide range of options for fine-tuning model behavior.

## Installation

To get started, install `@aigne/bedrock` along with the core AIGNE package.

**npm**
```bash
npm install @aigne/bedrock @aigne/core
```

**yarn**
```bash
yarn add @aigne/bedrock @aigne/core
```

**pnpm**
```bash
pnpm add @aigne/bedrock @aigne/core
```

## Authentication

The `BedrockChatModel` requires AWS credentials to make authenticated requests. You can provide them in two ways:

1.  **Directly in the constructor**: Pass your credentials as `accessKeyId` and `secretAccessKey` options.
2.  **Environment variables**: The SDK will automatically detect and use the `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` environment variables if they are set in your environment.

```typescript
import { BedrockChatModel } from "@aigne/bedrock";

// Option 1: Direct instantiation
const modelWithKeys = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  region: "us-east-1", // Specify your AWS region
});

// Option 2: Using environment variables (recommended for production)
// process.env.AWS_ACCESS_KEY_ID = "YOUR_ACCESS_KEY_ID";
// process.env.AWS_SECRET_ACCESS_KEY = "YOUR_SECRET_ACCESS_KEY";
// process.env.AWS_REGION = "us-east-1";
const modelFromEnv = new BedrockChatModel();
```

## Basic Usage

The primary class for interacting with AWS Bedrock is `BedrockChatModel`. Here is a basic example of how to instantiate the model and get a response.

```typescript
import { BedrockChatModel } from "@aigne/bedrock";

async function getChatResponse() {
  const model = new BedrockChatModel({
    // Assumes environment variables are set for authentication
    region: "us-east-1",
    model: "anthropic.claude-3-sonnet-20240229-v1:0", // Specify the model ID
    modelOptions: {
      temperature: 0.7,
    },
  });

  const result = await model.invoke({
    messages: [{ role: "user", content: "Hello, what is the AIGNE Framework?" }],
  });

  console.log(result.text);
  console.log("Usage:", result.usage);
}

getChatResponse();
/* Expected Output:
Hello! The AIGNE Framework is a toolkit for...
Usage: { inputTokens: 15, outputTokens: 50 }
*/
```

## API Reference

### `BedrockChatModel`

The `BedrockChatModel` class is the main entry point for using the SDK.

**Constructor Options (`BedrockChatModelOptions`)**

<x-field-group>
  <x-field data-name="accessKeyId" data-type="string" data-required="false" data-desc="Your AWS access key ID. If not provided, `AWS_ACCESS_KEY_ID` environment variable is used."></x-field>
  <x-field data-name="secretAccessKey" data-type="string" data-required="false" data-desc="Your AWS secret access key. If not provided, `AWS_SECRET_ACCESS_KEY` environment variable is used."></x-field>
  <x-field data-name="region" data-type="string" data-required="false" data-desc="The AWS region for the Bedrock service (e.g., 'us-east-1'). If not provided, `AWS_REGION` environment variable is used."></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="The default model ID to use for requests (e.g., 'anthropic.claude-3-haiku-20240307-v1:0'). Defaults to `us.amazon.nova-lite-v1:0`."></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Default options for model inference.">
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="Controls randomness. A lower value makes the model more deterministic."></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="Nucleus sampling parameter."></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="BedrockRuntimeClientConfig" data-required="false" data-desc="Advanced configuration options passed directly to the AWS `BedrockRuntimeClient`."></x-field>
</x-field-group>

## Advanced Usage

### Streaming Responses

For real-time applications, you can stream responses as they are generated by the model. Set the `streaming: true` option in the `invoke` method.

```typescript
import { BedrockChatModel } from "@aigne/bedrock";
import { isAgentResponseDelta } from "@aigne/core";

async function streamChatResponse() {
  const model = new BedrockChatModel({
    region: "us-east-1",
    model: "anthropic.claude-3-sonnet-20240229-v1:0",
  });

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Tell me a short story about a robot." }],
    },
    { streaming: true },
  );

  let fullText = "";
  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.text;
      if (text) {
        fullText += text;
        process.stdout.write(text);
      }
    }
  }

  console.log("\n\n--- End of Stream ---");
  console.log("Final Text:", fullText);
}

streamChatResponse();
```

The following diagram illustrates the data flow during a streaming operation:

```d2
shape: sequence_diagram

Application: {
  label: "Your Application"
}
Aigne-Bedrock-SDK: {
  label: "@aigne/bedrock SDK"
}
AWS-Bedrock: {
  label: "AWS Bedrock"
}
Foundation-Model: {
  label: "Foundation Model"
}

Application -> Aigne-Bedrock-SDK: "1. invoke(..., { streaming: true })"
Aigne-Bedrock-SDK -> AWS-Bedrock: "2. Sends streaming API request"
AWS-Bedrock -> Foundation-Model: "3. Forwards request to model"

loop: "Real-time response generation" {
  Foundation-Model -> AWS-Bedrock: "4a. Generates text chunk"
  AWS-Bedrock -> Aigne-Bedrock-SDK: "4b. Streams chunk back"
  Aigne-Bedrock-SDK -> Application: "4c. Yields chunk via async iterator"
}

AWS-Bedrock -> Aigne-Bedrock-SDK: "5. End-of-stream signal"
Aigne-Bedrock-SDK -> Application: "6. Stream closes"
```

### Structured JSON Output

You can instruct the model to return a structured JSON object that conforms to a specific Zod schema. This is useful for generating predictable, machine-readable output.

To do this, define a Zod schema and pass it in the `responseFormat` option of the `invoke` method. The SDK will automatically prompt the model to use a `generate_json` tool to produce the desired output.

```typescript
import { BedrockChatModel } from "@aigne/bedrock";
import { z } from "zod";

async function getStructuredResponse() {
  const model = new BedrockChatModel({
    region: "us-east-1",
    model: "anthropic.claude-3-sonnet-20240229-v1:0",
  });

  const userSchema = z.object({
    name: z.string().describe("The full name of the user."),
    email: z.string().email().describe("The user's email address."),
    age: z.number().positive().describe("The age of the user."),
  });

  const result = await model.invoke({
    messages: [
      {
        role: "user",
        content: "Extract user information from the following text: John Doe is 30 years old and his email is john.doe@example.com.",
      },
    ],
    responseFormat: {
      type: "json_schema",
      jsonSchema: {
        schema: userSchema,
      },
    },
  });

  console.log(result.json);
}

getStructuredResponse();
/* Expected Output:
{
  name: "John Doe",
  email: "john.doe@example.com",
  age: 30
}
*/
```