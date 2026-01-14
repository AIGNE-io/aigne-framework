# Ideogram

This document provides a comprehensive guide for developers on integrating and utilizing Ideogram's image generation capabilities within the AIGNE Framework. The `@aigne/ideogram` package provides a seamless interface to Ideogram's API, enabling the generation of high-quality images from textual prompts.

This guide will cover the necessary steps for installation, configuration, and usage, complete with code examples and detailed parameter descriptions. For information on other models, refer to the [Models Overview](./models-overview.md).

## Installation

To begin, install the `@aigne/ideogram` package into your project. You can use your preferred package manager.

```bash title="npm" icon=logos:npm-icon
npm install @aigne/ideogram
```

```bash title="yarn" icon=logos:yarn
yarn add @aigne/ideogram
```

```bash title="pnpm" icon=logos:pnpm
pnpm add @aigne/ideogram
```

## Configuration

Proper configuration is essential for connecting to the Ideogram API. This involves setting up your API key and instantiating the `IdeogramImageModel`.

### API Key Setup

The model requires an Ideogram API key for authentication. The recommended and most secure method is to set an environment variable.

```bash title=".env" icon=mdi:folder-key-outline
export IDEOGRAM_API_KEY="your-ideogram-api-key"
```

Alternatively, you can pass the `apiKey` directly during the model's instantiation, though this is less secure for production environments.

### Model Instantiation

Once the API key is configured, you can import and create an instance of `IdeogramImageModel`.

```typescript Instantiating the Model icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

// The API key will be automatically detected from environment variables.
const model = new IdeogramImageModel();

// Alternatively, provide the API key directly.
const modelWithApiKey = new IdeogramImageModel({
  apiKey: "your-ideogram-api-key", 
});
```

## Basic Usage

To generate an image, use the `invoke` method. This method takes an object containing the prompt and any other desired parameters. The only required parameter is `prompt`.

```typescript Generating an Image icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel();

async function generateImage() {
  try {
    const result = await model.invoke({
      model: "ideogram-v3",
      prompt: "A serene mountain landscape at sunset with golden light",
    });
    
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateImage();
```

### Response Object

The `invoke` method returns a promise that resolves to an object containing the generated images and usage metadata.

```json Example Response icon=material-symbols:data-object-outline
{
  "images": [
    {
      "type": "url",
      "url": "https://api.ideogram.ai/generation/...",
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

The `invoke` method accepts several parameters to customize the image generation process.

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true">
    <x-field-desc markdown>The text description of the image you want to generate.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="ideogram-v3">
    <x-field-desc markdown>Currently, only `ideogram-v3` is supported.</x-field-desc>
  </x-field>
  <x-field data-name="n" data-type="number" data-required="false" data-default="1">
    <x-field-desc markdown>The number of images to generate. The valid range is from 1 to 8.</x-field-desc>
  </x-field>
  <x-field data-name="seed" data-type="number" data-required="false">
    <x-field-desc markdown>A random seed for reproducible image generation. Must be an integer between 0 and 2147483647.</x-field-desc>
  </x-field>
  <x-field data-name="resolution" data-type="string" data-required="false">
    <x-field-desc markdown>The resolution of the generated image (e.g., `"1024x1024"`, `"1792x1024"`). Refer to the official Ideogram API documentation for all supported resolutions.</x-field-desc>
  </x-field>
  <x-field data-name="aspectRatio" data-type="string" data-required="false">
    <x-field-desc markdown>The aspect ratio for the image (e.g., `"1x1"`, `"16x9"`).</x-field-desc>
  </x-field>
  <x-field data-name="renderingSpeed" data-type="string" data-required="false" data-default="DEFAULT">
    <x-field-desc markdown>Controls the generation speed and quality. Accepted values are `"TURBO"`, `"DEFAULT"`, or `"QUALITY"`.</x-field-desc>
  </x-field>
  <x-field data-name="magicPrompt" data-type="string" data-required="false" data-default="AUTO">
    <x-field-desc markdown>Enables or disables MagicPrompt for prompt enhancement. Accepted values are `"AUTO"`, `"ON"`, or `"OFF"`.</x-field-desc>
  </x-field>
  <x-field data-name="negativePrompt" data-type="string" data-required="false">
    <x-field-desc markdown>A description of elements to exclude from the generated image.</x-field-desc>
  </x-field>
  <x-field data-name="styleType" data-type="string" data-required="false" data-default="AUTO">
    <x-field-desc markdown>Specifies the artistic style. Accepted values are `"AUTO"`, `"GENERAL"`, `"REALISTIC"`, `"DESIGN"`, or `"FICTION"`.</x-field-desc>
  </x-field>
  <x-field data-name="colorPalette" data-type="object" data-required="false">
    <x-field-desc markdown>An object defining a specific color palette for the generation.</x-field-desc>
  </x-field>
  <x-field data-name="styleCodes" data-type="string[]" data-required="false">
    <x-field-desc markdown>A list of 8-character hexadecimal codes that represent specific styles.</x-field-desc>
  </x-field>
</x-field-group>

## Advanced Usage

For more control over the output, you can combine multiple optional parameters in a single `invoke` call.

```typescript Advanced Image Generation icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel();

async function generateAdvancedImage() {
  try {
    const result = await model.invoke({
      prompt: "A futuristic cityscape with neon lights and flying cars",
      model: "ideogram-v3",
      n: 4,
      resolution: "1792x1024",
      renderingSpeed: "TURBO",
      styleType: "FICTION",
      negativePrompt: "blurry, low quality, distorted",
      seed: 12345,
    });
    
    console.log(`Generated ${result.images.length} images.`);
    result.images.forEach((image, index) => {
      console.log(`Image ${index + 1}: ${image.url}`);
    });
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateAdvancedImage();
```

## Default Model Options

You can set default parameters during the model's instantiation using the `modelOptions` property. These options will be applied to every `invoke` call unless overridden by parameters in the call itself.

```typescript Setting Default Options icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  modelOptions: {
    styleType: "REALISTIC",
    renderingSpeed: "QUALITY",
    magicPrompt: "ON",
  },
});

async function generateWithDefaults() {
  // This call will use the default options defined above.
  const result = await model.invoke({
    prompt: "A photorealistic portrait of an astronaut on Mars",
  });
  
  console.log(result);
}

generateWithDefaults();
```

## Summary

The `@aigne/ideogram` package offers a direct and efficient way to integrate Ideogram's image generation into your applications. By following the configuration steps and utilizing the provided parameters, you can generate high-quality images tailored to your specific needs.

For a complete and detailed list of all parameters, supported values, and advanced features, please refer to the official [Ideogram API Reference](https://developer.ideogram.ai/api-reference/api-reference/generate-v3).