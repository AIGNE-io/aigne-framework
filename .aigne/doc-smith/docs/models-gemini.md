# Google Gemini

Use Google's Gemini family of multimodal models for tasks involving text, images, and more. The `@aigne/gemini` package provides a seamless integration between the AIGNE Framework and Google's powerful Gemini language models, allowing you to easily leverage their advanced AI capabilities in your applications.

This package offers a consistent interface that works across the entire AIGNE Framework while giving you access to Google's state-of-the-art multimodal models.

## Features

*   **Direct Google Gemini API Integration**: Connects directly to Google's Gemini API services.
*   **Chat Completions**: Full support for Gemini's chat completion models.
*   **Image Generation**: Works with both Imagen and Gemini image generation models.
*   **Multimodal Support**: Natively handles both text and image inputs.
*   **Function Calling**: Supports the use of function calling capabilities.
*   **Streaming Responses**: Enables streaming for more responsive and interactive applications.
*   **Consistent Interface**: Fully compatible with the AIGNE Framework's standard model interface.
*   **Robust Error Handling**: Includes built-in error handling and retry mechanisms.
*   **Full Configuration**: Provides extensive options for fine-tuning model behavior.

## Installation

To get started, you'll need to install the Gemini package along with the AIGNE core library.

```bash npm
npm install @aigne/gemini @aigne/core
```

```bash yarn
yarn add @aigne/gemini @aigne/core
```

```bash pnpm
pnpm add @aigne/gemini @aigne/core
```

## Basic Usage

Before you begin, make sure to set your Google API key as an environment variable. This allows the framework to authenticate your requests automatically.

```bash Environment Variable
export GEMINI_API_KEY="your-gemini-api-key"
```

Alternatively, you can pass the `apiKey` directly when creating a model instance.

### Chat Model

Here's how to interact with a Gemini chat model for text-based conversations.

```typescript Chat Model Example icon=logos:typescript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // Provide API key directly or use environment variable GEMINI_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify Gemini model version (defaults to 'gemini-2.0-flash' if not specified)
  model: "gemini-1.5-flash",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
```

**Example Response**
```json
{
  "text": "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
  "model": "gemini-1.5-flash"
}
```

### Image Generation Model

You can also generate images from text prompts using models like Imagen.

```typescript Image Generation Example icon=logos:typescript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key", // Optional if set in env variables
  model: "imagen-4.0-generate-001", // Default Imagen model
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
```

**Example Response**
```json
{
  "images": [
    {
      "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "imagen-4.0-generate-001"
}
```

## Streaming Responses

For real-time applications, you can stream responses from the chat model as they are generated.

```typescript Streaming Example icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  apiKey: "your-api-key",
  model: "gemini-1.5-flash",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hi there, introduce yourself" }],
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

console.log(fullText); // Output: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"
console.log(json); // { model: "gemini-1.5-flash" }
```

## Image Generation Parameters

The `GeminiImageModel` supports different parameters depending on whether you are using an Imagen or a Gemini model.

### Imagen Models (e.g., `imagen-4.0-generate-001`)

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="The text description of the image you want to generate."></x-field>
  <x-field data-name="n" data-type="number" data-default="1" data-desc="Number of images to generate."></x-field>
  <x-field data-name="seed" data-type="number" data-desc="Random seed for reproducible generation."></x-field>
  <x-field data-name="safetyFilterLevel" data-type="string" data-desc="Safety filter level for content moderation."></x-field>
  <x-field data-name="personGeneration" data-type="string" data-desc="Person generation settings."></x-field>
  <x-field data-name="outputMimeType" data-type="string" data-desc="Output image format (e.g., 'image/png', 'image/jpeg')."></x-field>
  <x-field data-name="outputGcsUri" data-type="string" data-desc="Google Cloud Storage URI for output."></x-field>
  <x-field data-name="outputCompressionQuality" data-type="number" data-desc="JPEG compression quality (1-100)."></x-field>
  <x-field data-name="negativePrompt" data-type="string" data-desc="Description of what to exclude from the image."></x-field>
  <x-field data-name="language" data-type="string" data-desc="Language for the prompt."></x-field>
  <x-field data-name="includeSafetyAttributes" data-type="boolean" data-desc="Include safety attributes in the response."></x-field>
  <x-field data-name="includeRaiReason" data-type="boolean" data-desc="Include RAI reasoning in the response."></x-field>
  <x-field data-name="imageSize" data-type="string" data-desc="Size of the generated image."></x-field>
  <x-field data-name="guidanceScale" data-type="number" data-desc="Guidance scale for generation."></x-field>
  <x-field data-name="aspectRatio" data-type="string" data-desc="Aspect ratio of the image."></x-field>
  <x-field data-name="addWatermark" data-type="boolean" data-desc="Add a watermark to generated images."></x-field>
</x-field-group>

### Gemini Models (e.g., `gemini-1.5-pro`)

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="The text description of the image you want to generate."></x-field>
  <x-field data-name="n" data-type="number" data-default="1" data-desc="Number of images to generate."></x-field>
  <x-field data-name="temperature" data-type="number" data-desc="Controls randomness in generation (0.0 to 1.0)."></x-field>
  <x-field data-name="maxOutputTokens" data-type="number" data-desc="Maximum number of tokens in the response."></x-field>
  <x-field data-name="topP" data-type="number" data-desc="Nucleus sampling parameter."></x-field>
  <x-field data-name="topK" data-type="number" data-desc="Top-k sampling parameter."></x-field>
  <x-field data-name="safetySettings" data-type="array" data-desc="Safety settings for content generation."></x-field>
  <x-field data-name="seed" data-type="number" data-desc="Random seed for reproducible generation."></x-field>
  <x-field data-name="stopSequences" data-type="array" data-desc="Sequences that stop generation."></x-field>
  <x-field data-name="systemInstruction" data-type="string" data-desc="System-level instructions."></x-field>
</x-field-group>

### Advanced Image Generation Example

Here's how to use some of the advanced parameters to fine-tune your image output.

```typescript Advanced Image Generation icon=logos:typescript
const result = await model.invoke({
  prompt: "A futuristic cityscape with neon lights and flying cars",
  model: "imagen-4.0-generate-001",
  n: 2,
  imageSize: "1024x1024",
  aspectRatio: "1:1",
  guidanceScale: 7.5,
  negativePrompt: "blurry, low quality, distorted",
  seed: 12345,
  includeSafetyAttributes: true,
  outputMimeType: "image/png"
});
```

## Further Reading

For a complete list of parameters and more advanced features, refer to the official Google GenAI documentation:

*   **Imagen Models**: [Google GenAI Models.generateImages()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generateimages)
*   **Gemini Models**: [Google GenAI Models.generateContent()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generatecontent)
