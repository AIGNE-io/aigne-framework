# Ideogram

使用 Ideogram 的高级图像合成模型，通过文本提示生成高质量的图像。`@aigne/ideogram` 包提供了与 Ideogram 强大的图像生成 API 的无缝集成，让您可以将最先进的图像合成技术直接整合到您的 AIGNE agents 中。

## 安装

要开始使用，您需要将 Ideogram 包安装到您的项目中。

```bash Installation icon=lucide:download
npm install @aigne/ideogram
```

## 配置

在生成图像之前，您需要使用您的 Ideogram API 密钥来配置模型。您可以从 Ideogram 开发者平台获取密钥。

提供 API 密钥最简单的方法是设置一个环境变量：

```bash Set Environment Variable icon=lucide:terminal
export IDEOGRAM_API_KEY="your-ideogram-api-key"
```

或者，您也可以在代码中创建模型实例时直接传入 API 密钥。

```typescript Initialize the Model icon=logos:javascript
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  apiKey: "your-api-key", // 如果您已经设置了环境变量，此项是可选的
});
```

## 基本用法

生成图像非常简单，只需使用文本提示调用 `invoke` 方法即可。该模型会处理与 Ideogram API 的通信，并返回生成图像的 URL。

```typescript Generate an Image icon=logos:javascript
import { IdeogramImageModel } from "@aigne/ideogram";

// 初始化模型（假设 API 密钥已在环境变量中设置）
const model = new IdeogramImageModel();

async function createImage() {
  const result = await model.invoke({
    prompt: "A serene mountain landscape at sunset with golden light",
    // 模型默认为 'ideogram-v3'，所以您无需在此处指定
  });

  console.log(result.images[0].url);
}

createImage();
```

运行代码后，您将收到一个包含图像 URL 和使用数据的响应对象。

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

## 输入参数

`invoke` 方法接受一个包含多个参数的对象，用于控制图像生成过程。以下是最常用的一些参数：

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="您想要生成的图像的文本描述。"></x-field>
  <x-field data-name="model" data-type="string" data-default="ideogram-v3" data-desc="用于生成的模型。目前仅支持 'ideogram-v3'。"></x-field>
  <x-field data-name="n" data-type="number" data-default="1" data-desc="要生成的图像数量。必须在 1 到 8 之间。"></x-field>
  <x-field data-name="negativePrompt" data-type="string" data-desc="一个可选的描述，说明您想从图像中排除的内容（例如，'模糊、文本、水印'）。"></x-field>
  <x-field data-name="seed" data-type="number" data-desc="用于可复现结果的随机种子。一个介于 0 和 2147483647 之间的整数。"></x-field>
  <x-field data-name="resolution" data-type="string" data-default="1024x1024" data-desc="生成图像的分辨率（例如，'1024x1024'、'1792x1024'）。"></x-field>
  <x-field data-name="aspectRatio" data-type="string" data-default="1x1" data-desc="图像的宽高比（例如，'1x1'、'16x9'、'9x16'）。"></x-field>
  <x-field data-name="renderingSpeed" data-type="string" data-default="DEFAULT">
    <x-field-desc markdown>控制生成速度和质量。可以是 `"TURBO"`、`"DEFAULT"` 或 `"QUALITY"`。</x-field-desc>
  </x-field>
  <x-field data-name="magicPrompt" data-type="string" data-default="AUTO">
    <x-field-desc markdown>自动增强您的提示以获得更好的结果。可以是 `"AUTO"`、`"ON"` 或 `"OFF"`。</x-field-desc>
  </x-field>
  <x-field data-name="styleType" data-type="string" data-default="AUTO">
    <x-field-desc markdown>指定图像的整体风格。可以是 `"AUTO"`、`"GENERAL"`、`"REALISTIC"`、`"DESIGN"` 或 `"FICTION"`。</x-field-desc>
  </x-field>
</x-field-group>

## 高级用法

您可以组合多个参数来微调您的图像生成请求，以获得更具体的结果。

```typescript Advanced Image Generation icon=logos:javascript
const result = await model.invoke({
  prompt: "A futuristic cityscape with neon lights and flying cars",
  n: 4, // 生成 4 张不同的图像
  resolution: "1792x1024",
  renderingSpeed: "TURBO",
  styleType: "FICTION",
  negativePrompt: "blurry, low quality, distorted",
  seed: 12345 // 使用特定的种子以确保一致性
});

console.log(result.images);
```

## 设置默认选项

如果您经常使用相同的设置，可以在初始化模型时将它们定义为默认选项。这些默认值将应用于所有后续的 `invoke` 调用，除非被覆盖。

```typescript Model with Default Options icon=logos:javascript
const model = new IdeogramImageModel({
  apiKey: "your-api-key",
  modelOptions: {
    styleType: "REALISTIC",
    renderingSpeed: "QUALITY",
    magicPrompt: "ON"
  }
});

// 现在此调用将使用上面定义的默认选项
const result = await model.invoke({
  prompt: "A photorealistic portrait of an astronaut on Mars"
});
```

## 延伸阅读

有关所有参数、支持的分辨率和高级功能的完整列表，请参阅官方的 [Ideogram API 参考](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)。