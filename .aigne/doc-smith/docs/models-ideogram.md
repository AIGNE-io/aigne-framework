# @aigne/ideogram SDK

The `@aigne/ideogram` package provides a seamless integration between the AIGNE Framework and Ideogram's powerful image generation models. This SDK enables developers to easily leverage Ideogram's advanced image generation capabilities within their AIGNE applications, offering a consistent and streamlined interface.

This guide will walk you through the installation process, basic usage, and advanced features of the `@aigne/ideogram` SDK.

## Installation

You can install the package using your preferred package manager.

### Using npm

```bash
npm install @aigne/ideogram
```

### Using yarn

```bash
yarn add @aigne/ideogram
```

### Using pnpm

```bash
pnpm add @aigne/ideogram
```

## Authentication

To use the Ideogram API, you need an API key. You can provide the key in two ways:

1.  **Directly in the constructor:** Pass the `apiKey` in the options object.
2.  **Using environment variables:** The SDK will automatically detect the `IDEOGRAM_API_KEY` environment variable.

```bash
export IDEOGRAM_API_KEY="your-ideogram-api-key"
```

## Basic Usage

Here's a simple example of how to generate an image from a text prompt:

```typescript
import { IdeogramImageModel } from "@aigne/ideogram";

// Initialize the model
const model = new IdeogramImageModel({
  apiKey: "your-api-key", // Optional if IDEOGRAM_API_KEY is set
});

// Define the generation parameters
const result = await model.invoke({
  model: "ideogram-v3",
  prompt: "A serene mountain landscape at sunset with golden light",
});

// Log the output
console.log(result);
```

### Example Response

```json
{
  "images": [
    {
      "url": "https://api.ideogram.ai/generation/..."
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "ideogram-v3"
}
```

## Input Parameters

The `invoke` method accepts an object with several parameters to customize your image generation.

### Required Parameters

| Parameter | Type   | Description                                           |
| :-------- | :----- | :---------------------------------------------------- |
| `prompt`  | string | The text description of the image you want to generate. |

### Optional Parameters

| Parameter        | Type       | Description                                                                                               |
| :--------------- | :--------- | :-------------------------------------------------------------------------------------------------------- |
| `model`          | string     | The model to use for generation. Currently only supports `ideogram-v3`.                                   |
| `n`              | number     | The number of images to generate. Must be between 1 and 8. Defaults to 1.                               |
| `seed`           | number     | A random seed for reproducible results. Must be between 0 and 2147483647.                                 |
| `resolution`     | string     | The resolution of the generated image (e.g., "1024x1024", "1792x1024").                                  |
| `aspectRatio`    | string     | The aspect ratio for the image (e.g., "1x1", "16x9").                                                     |
| `renderingSpeed` | string     | The generation speed. Can be "TURBO", "DEFAULT", or "QUALITY".                                            |
| `magicPrompt`    | string     | Enables or disables MagicPrompt. Can be "AUTO", "ON", or "OFF".                                           |
| `negativePrompt` | string     | A description of what to exclude from the image.                                                          |
| `colorPalette`   | object     | A color palette to influence the generation.                                                              |
| `styleCodes`     | string[]   | A list of 8-character hexadecimal style codes.                                                            |
| `styleType`      | string     | The style type to apply. Can be "AUTO", "GENERAL", "REALISTIC", "DESIGN", or "FICTION".                   |

For a complete and detailed list of all parameters, please refer to the [Official Ideogram API Reference](https://developer.ideogram.ai/api-reference/api-reference/generate-v3).

## Advanced Usage

You can combine multiple parameters to gain more control over the generated images.

```typescript
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  apiKey: "your-api-key",
});

const result = await model.invoke({
  prompt: "A futuristic cityscape with neon lights and flying cars",
  model: "ideogram-v3",
  n: 4,
  resolution: "1792x1024",
  renderingSpeed: "TURBO",
  styleType: "FICTION",
  negativePrompt: "blurry, low quality, distorted",
  seed: 12345
});

console.log(result.images);
```

## Default Model Options

Set default options when creating the `IdeogramImageModel` instance to apply them to all subsequent `invoke` calls. These defaults can be overridden in individual calls.

```typescript
const model = new IdeogramImageModel({
  apiKey: "your-api-key",
  modelOptions: {
    styleType: "REALISTIC",
    renderingSpeed: "QUALITY",
    magicPrompt: "ON"
  }
});

// This call will use the default model options
const result = await model.invoke({
  prompt: "A photorealistic portrait of an astronaut on Mars",
});
```