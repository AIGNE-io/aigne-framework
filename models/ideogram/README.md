# @aigne/ideogram

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
[![NPM Version](https://img.shields.io/npm/v/@aigne/ideogram)](https://www.npmjs.com/package/@aigne/ideogram)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/ideogram)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE Ideogram SDK for integrating with Ideogram's image generation models and API services within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/ideogram` provides a seamless integration between the AIGNE Framework and Ideogram's powerful image generation models and APIs. This package enables developers to easily leverage Ideogram's advanced image generation capabilities in their AIGNE applications, providing a consistent interface across the framework while taking advantage of Ideogram's state-of-the-art image synthesis technology.

## Installation

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

## Basic Usage

```typescript
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  apiKey: "your-api-key", // Optional if set in env variables
});

const result = await model.invoke({
  model: "ideogram-v3",
  prompt: "A serene mountain landscape at sunset with golden light",
});

console.log(result);
/* Output:
  {
    images: [
      {
        url: "https://api.ideogram.ai/generation/...",
      }
    ],
    usage: {
      inputTokens: 0,
      outputTokens: 0
    },
    model: "ideogram-v3"
  }
  */
```

## Input Parameters

The `IdeogramImageModel` supports the following input parameters:

### Required Parameters

- **`prompt`** (string): The text description of the image you want to generate.

### Optional Parameters

- **`model`** (string): only support ideogram-v3
- **`n`** (number): Number of images to generate (1-8, defaults to 1)
- **`seed`** (number): Random seed for reproducible generation (0 to 2147483647)
- **`resolution`** (string): Image resolution (e.g., "1024x1024", "1792x1024")
- **`aspectRatio`** (string): Aspect ratio for image generation (e.g., "1x1", "16x9")
- **`renderingSpeed`** (string): Generation speed - "TURBO", "DEFAULT", or "QUALITY"
- **`magicPrompt`** (string): Enable/disable MagicPrompt - "AUTO", "ON", or "OFF"
- **`negativePrompt`** (string): Description of what to exclude from the image
- **`colorPalette`** (object): Color palette for generation
- **`styleCodes`** (string[]): List of 8-character hexadecimal style codes
- **`styleType`** (string): Style type - "AUTO", "GENERAL", "REALISTIC", "DESIGN", or "FICTION"

### Reference Parameters

For complete parameter details, supported resolutions, aspect ratios, and advanced features, refer to the [Ideogram API Reference](https://developer.ideogram.ai/api-reference/api-reference/generate-v3).

### Advanced Usage Example

```typescript
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
```

## Model Options

You can also set default options when creating the model:

```typescript
const model = new IdeogramImageModel({
  apiKey: "your-api-key",
  modelOptions: {
    styleType: "REALISTIC",
    renderingSpeed: "QUALITY",
    magicPrompt: "ON"
  }
});
```

## Environment Variables

Set the following environment variable for automatic API key detection:

```bash
export IDEOGRAM_API_KEY="your-ideogram-api-key"
```

## API Reference

For complete parameter details, supported resolutions, aspect ratios, and advanced features, refer to the [Ideogram API Reference](https://developer.ideogram.ai/api-reference/api-reference/generate-v3).

## License

Elastic-2.0
