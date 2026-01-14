# Google Gemini

This guide provides instructions for configuring and using Google's Gemini models within the AIGNE Framework via the `@aigne/gemini` package. It covers API key setup, model selection, and the specific features available for chat, image, and video generation.

The `@aigne/gemini` package offers a seamless integration with Google's advanced AI capabilities, including the Gemini multimodal models and the Imagen text-to-image models, providing a consistent interface within the AIGNE ecosystem.

## Features

- **Google API Integration**: Provides a direct interface to Google's Gemini, Imagen, and Veo API services.
- **Chat Completions**: Supports all available Gemini chat models for conversational AI.
- **Image Generation**: Integrates with both Imagen and Gemini models for image generation and editing.
- **Video Generation**: Leverages Google's Veo models for text-to-video, image-to-video, and frame interpolation tasks.
- **Multimodal Support**: Natively handles inputs combining text, images, audio, and video.
- **Function Calling**: Supports Gemini's function calling capabilities to interact with external tools.
- **Streaming Responses**: Enables real-time data processing for more responsive applications.
- **Type-Safe**: Includes comprehensive TypeScript typings for all APIs and model configurations.

## Installation

Install the required packages using your preferred package manager.

```bash
npm install @aigne/gemini @aigne/core
```

## Configuration

To authenticate requests, you must provide a Google API key. This can be done by setting an environment variable, which the framework will automatically detect.

```bash Environment Variable
export GEMINI_API_KEY="your-google-api-key"
```

Alternatively, you can pass the `apiKey` directly in the model's constructor.

## Chat Completions

The `GeminiChatModel` class is used for conversational interactions.

### Basic Usage

The following example demonstrates how to instantiate and invoke the `GeminiChatModel`.

```typescript Chat Model Usage icon=logos:javascript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // API key is optional if the GEMINI_API_KEY environment variable is set.
  apiKey: "your-api-key",
  // Specify the model. Defaults to 'gemini-2.0-flash'.
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
  "model": "gemini-1.5-flash",
  "usage": {
    "inputTokens": 12,
    "outputTokens": 18
  }
}
```

### Streaming Responses

For real-time applications, you can process response chunks as they arrive by enabling streaming.

```typescript Streaming Example icon=logos:javascript
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
  { streaming: true }
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
// Output: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"

console.log(json);
// Output: { model: "gemini-1.5-flash" }
```

### Chat Model Parameters

<x-field-group>
  <x-field data-name="messages" data-type="array" data-required="true" data-desc="The conversation history. Each message object contains a 'role' and 'content'."></x-field>
  <x-field data-name="tools" data-type="array" data-required="false" data-desc="A list of available function tools for the model to call."></x-field>
  <x-field data-name="toolChoice" data-type="string | object" data-required="false" data-desc="Controls how the model uses tools. Can be 'auto', 'required', 'none', or a specific tool."></x-field>
  <x-field data-name="responseFormat" data-type="object" data-required="false" data-desc="Specifies the desired output format, such as structured JSON."></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="The model to use (e.g., 'gemini-1.5-pro', 'gemini-1.5-flash')."></x-field>
  <x-field data-name="temperature" data-type="number" data-required="false" data-desc="Controls randomness (0-1). Higher values produce more creative responses."></x-field>
  <x-field data-name="topP" data-type="number" data-required="false" data-desc="Nucleus sampling parameter (0-1)."></x-field>
  <x-field data-name="topK" data-type="number" data-required="false" data-desc="Top-k sampling parameter."></x-field>
  <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="Reduces the likelihood of repeating tokens."></x-field>
  <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="Encourages the model to introduce new topics."></x-field>
  <x-field data-name="reasoningEffort" data-type="string | number" data-required="false" data-desc="For thinking models (e.g., Gemini 2.5), sets the token budget for reasoning. Can be 'minimal', 'low', 'medium', 'high' or a specific token count."></x-field>
  <x-field data-name="modalities" data-type="array" data-required="false" data-desc="Specifies the desired response modalities, such as ['TEXT'], ['IMAGE'], or ['TEXT', 'IMAGE']."></x-field>
</x-field-group>

## Image Generation

The `GeminiImageModel` class supports generating and editing images using both specialized Imagen models and multimodal Gemini models.

### Basic Image Generation

This example generates an image using an Imagen model.

```typescript Image Generation icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key",
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
      "type": "file",
      "data": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png"
    }
  ],
  "usage": { "inputTokens": 0, "outputTokens": 0 },
  "model": "imagen-4.0-generate-001"
}
```

### Image Editing with Gemini Models

Multimodal Gemini models can edit existing images based on a text prompt.

```typescript Image Editing icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key",
  model: "gemini-2.0-flash-exp", // Gemini model for editing
});

const result = await model.invoke({
  prompt: "Add vibrant flowers in the foreground",
  image: [
    {
      type: "url",
      url: "https://example.com/original-image.png",
    },
  ],
  n: 1,
});

console.log(result.images); // Array of edited images
```

### Image Model Parameters

Parameters vary depending on the model family used.

#### Common Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `prompt` | `string` | **Required.** A text description of the desired image. |
| `model` | `string` | The model to use. Defaults to `imagen-4.0-generate-001`. |
| `n` | `number` | The number of images to generate. Defaults to `1`. |
| `image` | `array` | For Gemini models, an array of reference images for editing. |

#### Imagen Model Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `seed` | `number` | A random seed for reproducible results. |
| `safetyFilterLevel` | `string` | The content moderation safety filter level. |
| `personGeneration` | `string` | Controls settings for generating images of people. |
| `outputMimeType` | `string` | The output image format (e.g., `image/png`). |
| `negativePrompt` | `string` | A description of what to exclude from the image. |
| `imageSize` | `string` | The dimensions of the generated image (e.g., "1024x1024"). |
| `aspectRatio` | `string` | The aspect ratio of the image (e.g., "16:9"). |

#### Gemini Model Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `temperature` | `number` | Controls randomness (0.0 to 1.0). |
| `maxOutputTokens` | `number` | The maximum number of tokens in the response. |
| `topP` | `number` | Nucleus sampling parameter. |
| `topK` | `number` | Top-k sampling parameter. |
| `safetySettings` | `array` | Custom safety settings for content generation. |
| `seed` | `number` | A random seed for reproducible results. |
| `systemInstruction` | `string` | System-level instructions to guide the model. |

## Video Generation

The `GeminiVideoModel` class uses Google's Veo models to generate videos from text or images.

### Basic Video Generation

```typescript Text-to-Video icon=logos:javascript
import { GeminiVideoModel } from "@aigne/gemini";

const videoModel = new GeminiVideoModel({
  apiKey: "your-api-key",
  model: "veo-3.1-generate-preview",
});

const result = await videoModel.invoke({
  prompt: "A serene lake with mountains in the background, gentle waves rippling",
  aspectRatio: "16:9",
  size: "720p",
  seconds: "8",
});

console.log(result);
```

**Example Response**

```json
{
  "videos": [
    {
      "type": "file",
      "data": "base64-encoded-video-data...",
      "mimeType": "video/mp4",
      "filename": "timestamp.mp4"
    }
  ],
  "usage": { "inputTokens": 0, "outputTokens": 0 },
  "model": "veo-3.1-generate-preview",
  "seconds": 8
}
```

### Advanced Video Generation

Veo models also support image-to-video and frame interpolation.

-   **Image-to-Video**: Provide a `prompt` and a source `image` to animate a static picture.
-   **Frame Interpolation**: Provide a `prompt`, a starting `image`, and an ending `lastFrame` to generate a smooth transition between them.

```typescript Image-to-Video icon=logos:javascript
const result = await videoModel.invoke({
  prompt: "Animate this image with gentle movement, clouds drifting slowly",
  image: {
    type: "url",
    url: "https://example.com/input-image.png",
  },
  seconds: "8",
});
```

### Video Model Parameters

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="A text description of the desired video content."></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="The Veo model to use. Defaults to 'veo-3.1-generate-preview'."></x-field>
  <x-field data-name="aspectRatio" data-type="string" data-required="false" data-desc="Video aspect ratio, either '16:9' (default) or '9:16'."></x-field>
  <x-field data-name="size" data-type="string" data-required="false" data-desc="Video resolution, either '720p' (default) or '1080p'."></x-field>
  <x-field data-name="seconds" data-type="string" data-required="false" data-desc="Video duration in seconds: '4', '6', or '8' (default)."></x-field>
  <x-field data-name="image" data-type="object" data-required="false" data-desc="A reference image for image-to-video or the first frame for interpolation."></x-field>
  <x-field data-name="lastFrame" data-type="object" data-required="false" data-desc="The last frame for frame interpolation."></x-field>
  <x-field data-name="referenceImages" data-type="array" data-required="false" data-desc="Additional reference images for video generation (Veo 3.1 only)."></x-field>
  <x-field data-name="negativePrompt" data-type="string" data-required="false" data-desc="A description of what to avoid in the video."></x-field>
</x-field-group>

## Further Reading

For complete API details, refer to the official documentation.

- [AIGNE Framework Documentation](https://aigne.io/docs)
- [Google GenAI API Reference](https://googleapis.github.io/js-genai/release_docs/)
