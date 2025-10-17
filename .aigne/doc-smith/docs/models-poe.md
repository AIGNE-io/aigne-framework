
The user wants to fix a D2 diagram syntax error.
The error message `invalid style keyword: "font-family"` indicates that `font-family` is not a valid style property in D2.
I need to remove or correct this line in the D2 code.

Based on the ISTJ personality, I will perform the following steps:
1.  **Analyze the request:** The user has provided feedback about a D2 syntax error. The goal is to correct the diagram and regenerate the document.
2.  **Identify the error:** The error is `invalid style keyword: "font-family"`. This is a factual error in the D2 code.
3.  **Formulate a correction:** I must remove the `font-family` property from the `style` block in the D2 diagram.
4.  **Re-generate the document:** I will regenerate the entire document with the corrected D2 code. I will ensure all other information remains accurate and follows the established structure.
5.  **Review the output:** Before finalizing, I will double-check the generated Markdown and the corrected D2 block to ensure it is syntactically correct and logically sound.

Let's break down the generation process for the document content.

**Plan:**

1.  **Introduction:** Start with an overview of the `@aigne/poe` package, explaining its purpose: to connect the AIGNE Framework with the Poe API, which provides access to various third-party models. Mention that it uses an OpenAI-compatible API. Link to the main Models Overview page.
2.  **Diagram:** Generate a corrected D2 diagram illustrating the architecture. The diagram should show the AIGNE Application, the `@aigne/poe` package, the Poe API, and the underlying Language Models (like GPT, Claude). The incorrect `font-family` style will be removed.
3.  **Installation:** Provide clear, copy-pasteable commands for installing the necessary packages (`@aigne/poe` and `@aigne/core`) using npm, yarn, and pnpm. This is a standard, practical step.
4.  **Configuration:** Detail the configuration options for the `PoeChatModel`.
    *   Explain the two ways to provide the API key (`apiKey` property vs. `POE_API_KEY` environment variable). This is critical for setup.
    *   Use an `<x-field-group>` to present the constructor options (`apiKey`, `model`, `modelOptions`, `baseURL`) in a structured and readable format.
    *   Provide precise descriptions for each field, including defaults (`gpt-5-mini`, `https://api.poe.com/v1`). The information is available in the source code (`models/poe/src/poe.ts`).
5.  **Usage Section:**
    *   **Standard Invocation:** Provide a complete, working TypeScript example of instantiating `PoeChatModel` and calling the `invoke` method. Use a clear, practical example (e.g., asking the model what it is). The example is available in the README.
    *   Show the expected JSON output. This helps the user verify their implementation.
    *   **Streaming Responses:** Provide a second complete TypeScript example demonstrating how to use the `streaming: true` option. Show the loop for processing chunks (`isAgentResponseDelta`). This is a key feature mentioned in the README.
    *   Show the expected streaming output, including how the final text and metadata are assembled.
6.  **Further Reading / Summary:** Conclude with links to relevant external documentation (the official Poe docs) and internal documentation (Core Concepts: Models). This provides a clear next step for the user.

This plan is methodical, fact-based, and directly addresses the user's needs for a technical guide while correcting the specific error noted in the feedback. It follows the ISTJ approach of prioritizing accuracy, structure, and practicality.# Poe

The `@aigne/poe` package provides a standardized interface for integrating with [Poe](https://poe.com/), a service that offers access to a wide range of third-party language models, including those from OpenAI, Anthropic, and Google. By leveraging an OpenAI-compatible API endpoint, this package allows you to seamlessly use various models within the AIGNE Framework.

This guide provides a step-by-step process for installing, configuring, and utilizing the `PoeChatModel`. For more general information on model integration, refer to the [Models Overview](./models-overview.md) documentation.

```d2
direction: down

Developer-App: {
  label: "Developer's\nApplication"
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle

  aigne-poe: {
    label: "@aigne/poe\nPoeChatModel"
    shape: rectangle
  }
}

Poe-Service: {
  label: "Poe Service"
  shape: rectangle

  Poe-API: {
    label: "OpenAI-Compatible API"
  }

  Third-Party-Models: {
    label: "Third-Party Language Models"
    grid-columns: 3
    OpenAI: {}
    Anthropic: {}
    Google: {}
  }
}

Developer-App -> AIGNE-Framework.aigne-poe: "1. Uses PoeChatModel"
AIGNE-Framework.aigne-poe -> Poe-Service.Poe-API: "2. Sends API Request"
Poe-Service.Poe-API -> Poe-Service.Third-Party-Models: "3. Routes to selected model"
Poe-Service.Third-Party-Models -> Poe-Service.Poe-API: "4. Generates response"
Poe-Service.Poe-API -> AIGNE-Framework.aigne-poe: "5. Returns response stream"
AIGNE-Framework.aigne-poe -> Developer-App: "6. Delivers result"
```

## Installation

To begin, install the necessary packages using your preferred package manager. You will need both `@aigne/core` and the Poe-specific package.

```bash
npm install @aigne/poe @aigne/core
```

```bash
yarn add @aigne/poe @aigne/core
```

```bash
pnpm add @aigne/poe @aigne/core
```

## Configuration

The `PoeChatModel` class is the primary interface for interacting with the Poe API. To instantiate it, you must provide your Poe API key and specify the desired model.

Your API key can be set in two ways:
1.  Directly in the constructor via the `apiKey` property.
2.  As an environment variable named `POE_API_KEY`.

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your Poe API key. While this is optional in the constructor, the key must be available either here or in the `POE_API_KEY` environment variable for authentication to succeed.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-5-mini" data-required="false">
    <x-field-desc markdown>The identifier for the model you wish to use. Poe provides access to models like `claude-3-opus`, `gpt-4o`, etc. If not specified, it defaults to `gpt-5-mini`.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options to pass to the model API, such as `temperature`, `topP`, or `maxTokens`. These parameters are sent directly to the underlying model provider.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://api.poe.com/v1" data-required="false">
    <x-field-desc markdown>The base URL for the Poe API. This should not be changed unless you are using a custom proxy.</x-field-desc>
  </x-field>
</x-field-group>

## Usage

The following examples demonstrate how to create a `PoeChatModel` instance and use it for both standard and streaming chat completions.

### Standard Invocation

For simple request-response interactions, use the `invoke` method. This method sends the request and waits for the complete response from the model.

```typescript Basic Usage icon=logos:typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // Provide API key directly or set the POE_API_KEY environment variable
  apiKey: "your-poe-api-key",
  // Specify the desired model available through Poe
  model: "claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

The `invoke` method returns a structured response containing the model's output and usage metadata.

```json Expected Output icon=material-symbols:data-object-outline
{
  "text": "I'm powered by Poe, using the Claude 3 Opus model from Anthropic.",
  "model": "claude-3-opus",
  "usage": {
    "inputTokens": 5,
    "outputTokens": 14
  }
}
```

### Streaming Responses

For real-time applications, you can stream the response as it's generated. Set the `streaming: true` option in the `invoke` call to receive an asynchronous stream of response chunks.

```typescript Streaming Example icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  apiKey: "your-poe-api-key",
  model: "claude-3-opus",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Which model are you using?" }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text);
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n--- Final Assembled Data ---");
console.log("Full Text:", fullText);
console.log("Metadata:", json);
```

When iterating through the stream, each chunk provides a delta of the response. The complete text and metadata must be assembled from these individual chunks.

```text Expected Output icon=material-symbols:terminal
I'm powered by Poe, using the Claude 3 Opus model from Anthropic.
--- Final Assembled Data ---
Full Text: I'm powered by Poe, using the Claude 3 Opus model from Anthropic.
Metadata: { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## Further Reading

- For a complete list of available models and their capabilities, please consult the official [Poe documentation](https://developer.poe.com/docs/server-bots-and-apis).
- To understand how models fit into the broader AIGNE architecture, see the [Core Concepts: Models](./developer-guide-core-concepts-models.md) page.