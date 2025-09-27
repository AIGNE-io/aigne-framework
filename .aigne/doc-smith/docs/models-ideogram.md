# Ideogram

Generate high-quality images from text prompts using Ideogram's advanced image synthesis models. The `@aigne/ideogram` package provides a seamless integration with Ideogram's powerful image generation APIs, allowing you to incorporate state-of-the-art image synthesis directly into your AIGNE agents.

## Installation

To get started, you'll need to install the Ideogram package into your project.

```bash Installation icon=lucide:download
npm install @aigne/ideogram
```

## Configuration

Before you can generate images, you need to configure the model with your Ideogram API key. You can obtain a key from the Ideogram developer platform.

The easiest way to provide your API key is by setting an environment variable:

```bash Set Environment Variable icon=lucide:terminal
export IDEOGRAM_API_KEY="your-ideogram-api-key"
```

Alternatively, you can pass the API key directly when you create an instance of the model in your code.

```typescript Initialize the Model icon=logos:javascript
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  apiKey: "your-api-key", // This is optional if you've set the environment variable
});
```

## Basic Usage

Generating an image is as simple as calling the `invoke` method with a text prompt. The model handles the communication with the Ideogram API and returns the URL of the generated image.

```typescript Generate an Image icon=logos:javascript
import { IdeogramImageModel } from "@aigne/ideogram";

// Initialize the model (assumes API key is in environment variables)
const model = new IdeogramImageModel();

async function createImage() {
  const result = await model.invoke({
    prompt: "A serene mountain landscape at sunset with golden light",
    // The model defaults to 'ideogram-v3', so you don't need to specify it here
  });

  console.log(result.images[0].url);
}

createImage();
```

After running the code, you will receive a response object containing the image URL and usage data.

```json Expected Output icon=lucide:file-json
{
  "images": [
    {
      "url": "https://api.ideogram.ai/generation/...",
      "type": "url",
      "mimeType": "image/png"
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

The `invoke` method accepts an object with several parameters to control the image generation process. Here are the most common ones:

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="The text description of the image you want to generate."></x-field>
  <x-field data-name="model" data-type="string" data-default="ideogram-v3" data-desc="The model to use for generation. Currently, only 'ideogram-v3' is supported."></x-field>
  <x-field data-name="n" data-type="number" data-default="1" data-desc="The number of images to generate. Must be between 1 and 8."></x-field>
  <x-field data-name="negativePrompt" data-type="string" data-desc="An optional description of what you want to exclude from the image (e.g., 'blurry, text, watermark')."></x-field>
  <x-field data-name="seed" data-type="number" data-desc="A random seed for reproducible results. An integer between 0 and 2147483647."></x-field>
  <x-field data-name="resolution" data-type="string" data-default="1024x1024" data-desc="The resolution of the generated image (e.g., '1024x1024', '1792x1024')."></x-field>
  <x-field data-name="aspectRatio" data-type="string" data-default="1x1" data-desc="The aspect ratio for the image (e.g., '1x1', '16x9', '9x16')."></x-field>
  <x-field data-name="renderingSpeed" data-type="string" data-default="DEFAULT">
    <x-field-desc markdown>Controls the generation speed and quality. Can be `"TURBO"`, `"DEFAULT"`, or `"QUALITY"`.</x-field-desc>
  </x-field>
  <x-field data-name="magicPrompt" data-type="string" data-default="AUTO">
    <x-field-desc markdown>Automatically enhances your prompt for better results. Can be `"AUTO"`, `"ON"`, or `"OFF"`.</x-field-desc>
  </x-field>
  <x-field data-name="styleType" data-type="string" data-default="AUTO">
    <x-field-desc markdown>Specifies the overall style of the image. Can be `"AUTO"`, `"GENERAL"`, `"REALISTIC"`, `"DESIGN"`, or `"FICTION"`.</x-field-desc>
  </x-field>
</x-field-group>

## Advanced Usage

You can combine multiple parameters to fine-tune your image generation request for more specific results.

```typescript Advanced Image Generation icon=logos:javascript
const result = await model.invoke({
  prompt: "A futuristic cityscape with neon lights and flying cars",
  n: 4, // Generate 4 different images
  resolution: "1792x1024",
  renderingSpeed: "TURBO",
  styleType: "FICTION",
  negativePrompt: "blurry, low quality, distorted",
  seed: 12345 // Use a specific seed for consistency
});

console.log(result.images);
```

## Setting Default Options

If you frequently use the same settings, you can define them as default options when initializing the model. These defaults will be applied to all subsequent `invoke` calls unless overridden.

```typescript Model with Default Options icon=logos:javascript
const model = new IdeogramImageModel({
  apiKey: "your-api-key",
  modelOptions: {
    styleType: "REALISTIC",
    renderingSpeed: "QUALITY",
    magicPrompt: "ON"
  }
});

// This call will now use the default options defined above
const result = await model.invoke({
  prompt: "A photorealistic portrait of an astronaut on Mars"
});
```

## Further Reading

For a complete list of all parameters, supported resolutions, and advanced features, please refer to the official [Ideogram API Reference](https://developer.ideogram.ai/api-reference/api-reference/generate-v3).