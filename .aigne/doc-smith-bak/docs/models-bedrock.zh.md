# AWS Bedrock

`@aigne/bedrock` 包提供了 AIGNE 框架与 Amazon Web Services (AWS) Bedrock 之间直接而强大的集成。这使得开发者能够在他们的 AIGNE 应用程序中利用 AWS Bedrock 提供的各种基础模型，既能受益于 AWS 可扩展且安全的基础设施，又能保持一致的接口。

本指南系统地概述了 `BedrockChatModel` 的安装、配置和使用。有关其他模型的详细信息，请参阅主要的[模型概述](./models-overview.md)。

## 安装

首先，使用您偏好的包管理器安装必要的包。`@aigne/core` 包是必需的对等依赖项。

```bash Terminal
# 使用 npm
npm install @aigne/bedrock @aigne/core

# 使用 yarn
yarn add @aigne/bedrock @aigne/core

# 使用 pnpm
pnpm add @aigne/bedrock @aigne/core
```

## 配置

正确的配置涉及设置 AWS 凭证并使用所需参数实例化 `BedrockChatModel`。

### AWS 凭证

AWS SDK 需要凭证来验证请求。您可以通过以下两种方式之一提供它们：

1.  **环境变量（推荐）**：在您的开发或部署环境中设置以下环境变量。SDK 将自动检测并使用它们。
    *   `AWS_ACCESS_KEY_ID`：您的 AWS access key ID。
    *   `AWS_SECRET_ACCESS_KEY`：您的 AWS secret access key。
    *   `AWS_REGION`：您的 Bedrock 服务启用的 AWS 区域（例如 `us-east-1`）。

2.  **直接实例化**：将凭证直接传递给 `BedrockChatModel` 构造函数。此方法适用于特定的使用场景，但通常不如使用环境变量安全。

### BedrockChatModel 选项

`BedrockChatModel` 是与 AWS Bedrock 交互的主要类。其构造函数接受一个选项对象来配置其行为。

<x-field-group>
  <x-field data-name="accessKeyId" data-type="string" data-required="false">
    <x-field-desc markdown>您的 AWS access key ID。如果未提供，SDK 将尝试从 `AWS_ACCESS_KEY_ID` 环境变量中读取。</x-field-desc>
  </x-field>
  <x-field data-name="secretAccessKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 AWS secret access key。如果未提供，SDK 将尝试从 `AWS_SECRET_ACCESS_KEY` 环境变量中读取。</x-field-desc>
  </x-field>
  <x-field data-name="region" data-type="string" data-required="false">
    <x-field-desc markdown>Bedrock 服务所在的 AWS 区域。如果未提供，SDK 将尝试从 `AWS_REGION` 环境变量中读取。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="us.amazon.nova-lite-v1:0">
    <x-field-desc markdown>要使用的基础模型的 ID（例如 `anthropic.claude-3-sonnet-20240229-v1:0`、`meta.llama3-8b-instruct-v1:0`）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>用于控制模型推理行为的附加选项。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制生成内容的随机性。值越高，响应越具创造性。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="控制核采样。模型仅考虑概率总和为 P 的最高概率的词元。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>直接传递给底层 AWS SDK 的 `BedrockRuntimeClient` 的高级配置选项。</x-field-desc>
  </x-field>
</x-field-group>

## 用法示例

以下示例演示了如何使用 `BedrockChatModel` 进行标准调用和流式调用。

### 基本用法

此示例展示了如何实例化模型并调用它以获得单个完整的响应。

```typescript Basic Invocation icon=logos:javascript
import { BedrockChatModel } from "@aigne/bedrock";

// 使用凭证和模型 ID 实例化模型
const model = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID", // 或使用环境变量
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY", // 或使用环境变量
  region: "us-east-1", // 指定您的 AWS 区域
  model: "anthropic.claude-3-haiku-20240307-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

// 定义输入消息
const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, what is AWS Bedrock?" }],
});

console.log(result.text);
```

输出将是一个包含模型响应的字符串。`result` 对象还包含使用情况的指标。

### 流式响应

对于需要实时反馈的应用程序，您可以在生成响应时以流的形式接收它。这对于聊天机器人和其他交互式体验非常有用。

```typescript Streaming Invocation icon=logos:javascript
import { BedrockChatModel } from "@aigne/bedrock";
import { isAgentResponseDelta } from "@aigne/core";

const model = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  region: "us-east-1",
  model: "anthropic.claude-3-haiku-20240307-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, what is AWS Bedrock?" }],
  },
  { streaming: true },
);

let fullText = "";

for await (const chunk of stream) {
  // 使用类型守卫检查 chunk 是否为增量
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text); // 在响应的每个部分到达时打印它
    }
  }
}

console.log("\n--- Full Response ---");
console.log(fullText);
```

此代码处理一个 `AgentResponseChunk` 对象流。每个块包含响应的增量部分，这些部分累积起来形成完整的文本。

## 支持的模型

AWS Bedrock 提供了对来自 Anthropic、Cohere、Meta、Stability AI 和 Amazon 等领先 AI 公司的各种基础模型的访问。您可以使用其唯一的 `modelId` 来指定所需的模型。

一些常用的模型系列包括：
-   **Anthropic Claude**: `anthropic.claude-3-sonnet-20240229-v1:0`, `anthropic.claude-3-haiku-20240307-v1:0`
-   **Meta Llama**: `meta.llama3-8b-instruct-v1:0`
-   **Amazon Titan**: `amazon.titan-text-express-v1`

有关可用模型及其相应 ID 的完整和最新列表，请参阅 [AWS Bedrock 官方文档](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html)。

## 总结

`@aigne/bedrock` 包提供了一种将 AWS Bedrock 强大的基础模型集成到您的 AIGNE 应用程序中的简化方法。通过遵循本指南中概述的配置步骤和使用模式，您可以高效地构建和部署由 AI 驱动的功能。

有关更高级的主题，例如工具使用和结构化输出，请参阅 [AI Agent](./developer-guide-agents-ai-agent.md) 文档。