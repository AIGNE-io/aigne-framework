# AWS Bedrock

通过亚马逊完全托管的 AWS Bedrock 服务，可以访问来自顶尖 AI 公司的多种基础模型。`@aigne/bedrock` 包提供了 AIGNE 框架与 AWS Bedrock 之间的无缝集成，让您可以在 AIGNE 应用程序中轻松使用 Claude、Llama 和 Titan 等模型。这为您提供了一致的接口，同时还能受益于 AWS 安全且可扩展的基础设施。

![AIGNE Bedrock Integration](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-bedrock.png)

## 特性

- **直接集成 AWS Bedrock**：使用官方 AWS SDK 连接到 AWS Bedrock 服务。
- **支持多种模型**：可以访问通过 Bedrock 提供的 Claude、Llama、Titan 及其他基础模型。
- **聊天补全**：全面支持所有兼容模型的聊天补全 API。
- **流式响应**：启用流式传输，以实现响应更迅速、交互性更强的应用程序。
- **一致的接口**：遵循标准的 AIGNE 框架模型接口，方便更换提供商。
- **完整的配置**：提供丰富的选项，用于微调模型行为和客户端设置。
- **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义。

## 安装

首先，在您的项目中安装必要的 AIGNE 包。

```bash npm icon=logos:npm
npm install @aigne/bedrock @aigne/core
```

```bash yarn icon=logos:yarn
yarn add @aigne/bedrock @aigne/core
```

```bash pnpm icon=pnpm:pnpm
pnpm add @aigne/bedrock @aigne/core
```

## 配置

要使用 AWS Bedrock 模型，您需要使用您的 AWS 凭证来配置 `BedrockChatModel`。您可以直接在构造函数中提供 `accessKeyId` 和 `secretAccessKey`，也可以将它们设置为环境变量（`AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY`）。

<x-field-group>
  <x-field data-name="accessKeyId" data-type="string" data-required="false">
    <x-field-desc markdown>您的 AWS 访问密钥 ID。也可以通过 `AWS_ACCESS_KEY_ID` 环境变量设置。</x-field-desc>
  </x-field>
  <x-field data-name="secretAccessKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 AWS 秘密访问密钥。也可以通过 `AWS_SECRET_ACCESS_KEY` 环境变量设置。</x-field-desc>
  </x-field>
  <x-field data-name="region" data-type="string" data-required="false">
    <x-field-desc markdown>Bedrock 服务所在的 AWS 区域。也可以通过 `AWS_REGION` 环境变量设置。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="us.amazon.nova-lite-v1:0">
    <x-field-desc markdown>您想使用的特定 Bedrock 模型 ID。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>用于配置模型行为的附加选项。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制模型输出的随机性。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心采样参数。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>直接传递给 AWS `BedrockRuntimeClient` 的高级配置选项。</x-field-desc>
  </x-field>
</x-field-group>

## 基本用法

以下是一个如何调用 Bedrock 模型执行聊天补全任务的简单示例。

```typescript Bedrock Chat Example icon=logos:typescript
import { BedrockChatModel } from "@aigne/bedrock";

const model = new BedrockChatModel({
  // 直接提供凭证或使用环境变量
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  model: "us.amazon.nova-premier-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

**响应示例**

```json Response
{
  "text": "Hello! How can I assist you today?",
  "model": "us.amazon.nova-premier-v1:0",
  "usage": {
    "inputTokens": 10,
    "outputTokens": 9
  }
}
```

## 流式响应

对于实时交互，您可以流式传输模型的响应。这可以通过在 `invoke` 方法中设置 `streaming: true` 选项来实现。然后，您可以遍历流以接收生成的数据块。

```typescript Streaming Example icon=logos:typescript
import { BedrockChatModel } from "@aigne/bedrock";
import { isAgentResponseDelta } from "@aigne/core";

const model = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  model: "us.amazon.nova-premier-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
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

console.log(fullText); 
console.log(json);
```

**输出示例**

```text Console Output
Hello! How can I assist you today?
{ model: 'us.amazon.nova-premier-v1:0', usage: { inputTokens: 10, outputTokens: 9 } }
```

该包可以轻松地通过 AWS Bedrock 将各种强大的基础模型集成到您的 AIGNE agents 中。对于其他模型集成，您可能对 [Anthropic (Claude)](./models-anthropic.md) 或 [OpenAI](./models-openai.md) 感兴趣。