# Ideogram

本文档为开发者提供了在 AIGNE 框架内集成和利用 Ideogram 图像生成功能的综合指南。`@aigne/ideogram` 包提供了与 Ideogram API 的无缝接口，能够通过文本提示生成高质量的图像。

本指南将涵盖安装、配置和使用的必要步骤，并附有代码示例和详细的参数说明。有关其他模型的信息，请参阅[模型概述](./models-overview.md)。

## 安装

首先，将 `@aigne/ideogram` 包安装到您的项目中。您可以使用您偏好的包管理器。

```bash title="npm" icon=logos:npm-icon
npm install @aigne/ideogram
```

```bash title="yarn" icon=logos:yarn
yarn add @aigne/ideogram
```

```bash title="pnpm" icon=logos:pnpm
pnpm add @aigne/ideogram
```

## 配置

正确的配置对于连接到 Ideogram API 至关重要。这包括设置您的 API 密钥和实例化 `IdeogramImageModel`。

### API 密钥设置

该模型需要一个 Ideogram API 密钥进行身份验证。推荐且最安全的方法是设置一个环境变量。

```bash title=".env" icon=mdi:folder-key-outline
export IDEOGRAM_API_KEY="your-ideogram-api-key"
```

或者，您可以在模型实例化时直接传递 `apiKey`，但这种方式在生产环境中的安全性较低。

### 模型实例化

配置好 API 密钥后，您可以导入并创建一个 `IdeogramImageModel` 的实例。

```typescript 实例化模型 icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

// API 密钥将自动从环境变量中检测。
const model = new IdeogramImageModel();

// 或者，直接提供 API 密钥。
const modelWithApiKey = new IdeogramImageModel({
  apiKey: "your-ideogram-api-key", 
});
```

## 基本用法

要生成图像，请使用 `invoke` 方法。该方法接受一个包含提示和任何其他所需参数的对象。唯一必需的参数是 `prompt`。

```typescript 生成图像 icon=logos:typescript-icon
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

### 响应对象

`invoke` 方法返回一个 promise，该 promise 会解析为一个包含生成的图像和使用元数据的对象。

```json 响应示例 icon=material-symbols:data-object-outline
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

## 输入参数

`invoke` 方法接受多个参数来自定义图像生成过程。

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true">
    <x-field-desc markdown>您想要生成的图像的文本描述。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="ideogram-v3">
    <x-field-desc markdown>目前仅支持 `ideogram-v3`。</x-field-desc>
  </x-field>
  <x-field data-name="n" data-type="number" data-required="false" data-default="1">
    <x-field-desc markdown>要生成的图像数量。有效范围为 1 到 8。</x-field-desc>
  </x-field>
  <x-field data-name="seed" data-type="number" data-required="false">
    <x-field-desc markdown>用于可复现图像生成的随机种子。必须是 0 到 2147483647 之间的整数。</x-field-desc>
  </x-field>
  <x-field data-name="resolution" data-type="string" data-required="false">
    <x-field-desc markdown>生成图像的分辨率（例如 `"1024x1024"`、`"1792x1024"`）。有关所有支持的分辨率，请参阅 Ideogram 官方 API 文档。</x-field-desc>
  </x-field>
  <x-field data-name="aspectRatio" data-type="string" data-required="false">
    <x-field-desc markdown>图像的宽高比（例如 `"1x1"`、`"16x9"`）。</x-field-desc>
  </x-field>
  <x-field data-name="renderingSpeed" data-type="string" data-required="false" data-default="DEFAULT">
    <x-field-desc markdown>控制生成速度和质量。可接受的值为 `"TURBO"`、`"DEFAULT"` 或 `"QUALITY"`。</x-field-desc>
  </x-field>
  <x-field data-name="magicPrompt" data-type="string" data-required="false" data-default="AUTO">
    <x-field-desc markdown>启用或禁用 MagicPrompt 以增强提示。可接受的值为 `"AUTO"`、`"ON"` 或 `"OFF"`。</x-field-desc>
  </x-field>
  <x-field data-name="negativePrompt" data-type="string" data-required="false">
    <x-field-desc markdown>要从生成图像中排除的元素的描述。</x-field-desc>
  </x-field>
  <x-field data-name="styleType" data-type="string" data-required="false" data-default="AUTO">
    <x-field-desc markdown>指定艺术风格。可接受的值为 `"AUTO"`、`"GENERAL"`、`"REALISTIC"`、`"DESIGN"` 或 `"FICTION"`。</x-field-desc>
  </x-field>
  <x-field data-name="colorPalette" data-type="object" data-required="false">
    <x-field-desc markdown>定义用于生成的特定调色板的对象。</x-field-desc>
  </x-field>
  <x-field data-name="styleCodes" data-type="string[]" data-required="false">
    <x-field-desc markdown>代表特定风格的 8 位十六进制代码列表。</x-field-desc>
  </x-field>
</x-field-group>

## 高级用法

为了更好地控制输出，您可以在单个 `invoke` 调用中组合多个可选参数。

```typescript 高级图像生成 icon=logos:typescript-icon
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

## 默认模型选项

您可以在模型实例化期间使用 `modelOptions` 属性设置默认参数。这些选项将应用于每个 `invoke` 调用，除非被调用本身中的参数覆盖。

```typescript 设置默认选项 icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  modelOptions: {
    styleType: "REALISTIC",
    renderingSpeed: "QUALITY",
    magicPrompt: "ON",
  },
});

async function generateWithDefaults() {
  // 此调用将使用上面定义的默认选项。
  const result = await model.invoke({
    prompt: "A photorealistic portrait of an astronaut on Mars",
  });
  
  console.log(result);
}

generateWithDefaults();
```

## 总结

`@aigne/ideogram` 包提供了一种直接有效的方式，将 Ideogram 的图像生成功能集成到您的应用程序中。通过遵循配置步骤并利用所提供的参数，您可以生成满足特定需求的高质量图像。

有关所有参数、支持的值和高级功能的完整详细列表，请参阅官方 [Ideogram API 参考](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)。