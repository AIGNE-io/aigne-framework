# @aigne/ideogram SDK

`@aigne/ideogram` 软件包提供了 AIGNE 框架与 Ideogram 强大图像生成模型之间的无缝集成。该 SDK 使开发者能够在其 AIGNE 应用程序中轻松利用 Ideogram 的先进图像生成功能，并提供了一致且简化的接口。

本指南将引导您完成 `@aigne/ideogram` SDK 的安装过程、基本用法和高级功能。

## 安装

您可以使用您偏好的包管理器来安装此软件包。

### 使用 npm

```bash
npm install @aigne/ideogram
```

### 使用 yarn

```bash
yarn add @aigne/ideogram
```

### 使用 pnpm

```bash
pnpm add @aigne/ideogram
```

## 身份验证

要使用 Ideogram API，您需要一个 API 密钥。您可以通过两种方式提供该密钥：

1.  **在构造函数中直接提供：** 在选项对象中传递 `apiKey`。
2.  **使用环境变量：** SDK 会自动检测 `IDEOGRAM_API_KEY` 环境变量。

```bash
export IDEOGRAM_API_KEY="your-ideogram-api-key"
```

## 基本用法

以下是一个如何根据文本提示生成图像的简单示例：

```typescript
import { IdeogramImageModel } from "@aigne/ideogram";

// 初始化模型
const model = new IdeogramImageModel({
  apiKey: "your-api-key", // 如果设置了 IDEOGRAM_API_KEY，则此项为可选
});

// 定义生成参数
const result = await model.invoke({
  model: "ideogram-v3",
  prompt: "A serene mountain landscape at sunset with golden light",
});

// 打印输出
console.log(result);
```

### 响应示例

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

## 输入参数

`invoke` 方法接受一个包含多个参数的对象，用于自定义您的图像生成。

### 必需参数

| 参数 | 类型 | 描述 |
| :-------- | :----- | :---------------------------------------------------- |
| `prompt` | string | 您想要生成的图像的文本描述。 |

### 可选参数

| 参数 | 类型 | 描述 |
| :--------------- | :--------- | :-------------------------------------------------------------------------------------------------------- |
| `model` | string | 要用于生成的模型。目前仅支持 `ideogram-v3`。 |
| `n` | number | 要生成的图像数量。必须在 1 到 8 之间。默认为 1。 |
| `seed` | number | 用于可复现结果的随机种子。必须在 0 到 2147483647 之间。 |
| `resolution` | string | 生成图像的分辨率（例如，“1024x1024”、“1792x1024”）。 |
| `aspectRatio` | string | 图像的宽高比（例如，“1x1”、“16x9”）。 |
| `renderingSpeed` | string | 生成速度。可以是“TURBO”、“DEFAULT”或“QUALITY”。 |
| `magicPrompt` | string | 启用或禁用 MagicPrompt。可以是“AUTO”、“ON”或“OFF”。 |
| `negativePrompt` | string | 描述要从图像中排除的内容。 |
| `colorPalette` | object | 影响生成的调色板。 |
| `styleCodes` | string[] | 一个由 8 个字符组成的十六进制样式代码列表。 |
| `styleType` | string | 要应用的样式类型。可以是“AUTO”、“GENERAL”、“REALISTIC”、“DESIGN”或“FICTION”。 |

有关所有参数的完整详细列表，请参阅 [Ideogram 官方 API 参考文档](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)。

## 高级用法

您可以组合使用多个参数，以更精确地控制生成的图像。

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

## 默认模型选项

在创建 `IdeogramImageModel` 实例时设置默认选项，这些选项将应用于所有后续的 `invoke` 调用。这些默认值可以在单次调用中被覆盖。

```typescript
const model = new IdeogramImageModel({
  apiKey: "your-api-key",
  modelOptions: {
    styleType: "REALISTIC",
    renderingSpeed: "QUALITY",
    magicPrompt: "ON"
  }
});

// 本次调用将使用默认的模型选项
const result = await model.invoke({
  prompt: "A photorealistic portrait of an astronaut on Mars",
});
```