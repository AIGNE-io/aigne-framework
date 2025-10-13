本文档为 `@aigne/bedrock` 包的使用提供了全面指南，该 SDK 旨在将 AWS Bedrock 基础模型集成到 AIGNE 框架中。您将学习如何安装该包、使用 AWS 进行身份验证、执行基本操作以及利用流式处理和工具使用等高级功能。

### 目标受众

本文档适用于希望在其基于 AIGNE 的应用程序中使用 AWS Bedrock 生成式 AI 模型的开发人员。我们假设读者对 TypeScript、Node.js 和 AIGNE 框架有基本的了解。

# @aigne/bedrock

`@aigne/bedrock` 提供了 AIGNE 框架与 AWS Bedrock 之间的无缝连接。它为利用各种基础模型提供了一个一致的、类型安全的接口，让您能够在 AWS 安全且可扩展的基础设施之上构建强大的 AI 功能。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-bedrock-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-bedrock.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-bedrock.png" alt="AIGNE Bedrock 架构">
</picture>

## 功能特性

-   **无缝集成 AWS Bedrock**：使用官方 AWS SDK，以最少的配置连接到 AWS Bedrock。
-   **多模型支持**：可访问包括 Claude、Llama、Titan 等在内的多种基础模型。
-   **聊天补全 API**：为所有支持的模型提供统一的、基于聊天的交互接口。
-   **流式响应**：内置流式传输支持，可创建响应迅速的实时应用程序。
-   **类型安全**：完全采用 TypeScript 类型定义，确保安全并改善开发人员体验。
-   **兼容 AIGNE 框架**：遵循 AIGNE 框架的模型接口，以实现一致的使用方式。
-   **强大的错误处理**：包含用于处理错误和重试请求的机制。
-   **丰富的配置选项**：提供广泛的选项来微调模型行为。

## 安装

首先，请安装 `@aigne/bedrock` 以及核心的 AIGNE 包。

**npm**
```bash
npm install @aigne/bedrock @aigne/core
```

**yarn**
```bash
yarn add @aigne/bedrock @aigne/core
```

**pnpm**
```bash
pnpm add @aigne/bedrock @aigne/core
```

## 身份验证

`BedrockChatModel` 需要 AWS 凭证来进行身份验证请求。您可以通过两种方式提供凭证：

1.  **直接在构造函数中提供**：将您的凭证作为 `accessKeyId` 和 `secretAccessKey` 选项传入。
2.  **环境变量**：如果您的环境中设置了 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` 和 `AWS_REGION` 环境变量，SDK 将自动检测并使用它们。

```typescript
import { BedrockChatModel } from "@aigne/bedrock";

// 选项 1：直接实例化
const modelWithKeys = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  region: "us-east-1", // 指定您的 AWS 区域
});

// 选项 2：使用环境变量（推荐用于生产环境）
// process.env.AWS_ACCESS_KEY_ID = "YOUR_ACCESS_KEY_ID";
// process.env.AWS_SECRET_ACCESS_KEY = "YOUR_SECRET_ACCESS_KEY";
// process.env.AWS_REGION = "us-east-1";
const modelFromEnv = new BedrockChatModel();
```

## 基本用法

与 AWS Bedrock 交互的主要类是 `BedrockChatModel`。以下是如何实例化模型并获取响应的基本示例。

```typescript
import { BedrockChatModel } from "@aigne/bedrock";

async function getChatResponse() {
  const model = new BedrockChatModel({
    // 假设已为身份验证设置了环境变量
    region: "us-east-1",
    model: "anthropic.claude-3-sonnet-20240229-v1:0", // 指定模型 ID
    modelOptions: {
      temperature: 0.7,
    },
  });

  const result = await model.invoke({
    messages: [{ role: "user", content: "你好，什么是 AIGNE 框架？" }],
  });

  console.log(result.text);
  console.log("Usage:", result.usage);
}

getChatResponse();
/* 预期输出：
你好！AIGNE 框架是一个用于...的工具包。
Usage: { inputTokens: 15, outputTokens: 50 }
*/
```

## API 参考

### `BedrockChatModel`

`BedrockChatModel` 类是使用该 SDK 的主要入口点。

**构造函数选项 (`BedrockChatModelOptions`)**

<x-field-group>
  <x-field data-name="accessKeyId" data-type="string" data-required="false" data-desc="您的 AWS 访问密钥 ID。如果未提供，则使用 `AWS_ACCESS_KEY_ID` 环境变量。"></x-field>
  <x-field data-name="secretAccessKey" data-type="string" data-required="false" data-desc="您的 AWS 秘密访问密钥。如果未提供，则使用 `AWS_SECRET_ACCESS_KEY` 环境变量。"></x-field>
  <x-field data-name="region" data-type="string" data-required="false" data-desc="Bedrock 服务所在的 AWS 区域（例如 'us-east-1'）。如果未提供，则使用 `AWS_REGION` 环境变量。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="用于请求的默认模型 ID（例如 'anthropic.claude-3-haiku-20240307-v1:0'）。默认为 `us.amazon.nova-lite-v1:0`。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="模型推理的默认选项。">
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制随机性。值越低，模型越确定。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心采样参数。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="BedrockRuntimeClientConfig" data-required="false" data-desc="直接传递给 AWS `BedrockRuntimeClient` 的高级配置选项。"></x-field>
</x-field-group>

## 高级用法

### 流式响应

对于实时应用程序，您可以在模型生成响应时以流的形式接收它们。在 `invoke` 方法中设置 `streaming: true` 选项。

```typescript
import { BedrockChatModel } from "@aigne/bedrock";
import { isAgentResponseDelta } from "@aigne/core";

async function streamChatResponse() {
  const model = new BedrockChatModel({
    region: "us-east-1",
    model: "anthropic.claude-3-sonnet-20240229-v1:0",
  });

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "给我讲一个关于机器人的短篇故事。" }],
    },
    { streaming: true },
  );

  let fullText = "";
  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.text;
      if (text) {
        fullText += text;
        process.stdout.write(text);
      }
    }
  }

  console.log("\n\n--- 流结束 ---");
  console.log("最终文本:", fullText);
}

streamChatResponse();
```

下图说明了流式操作期间的数据流：

```d2
shape: sequence_diagram

Application: {
  label: "您的应用程序"
}
Aigne-Bedrock-SDK: {
  label: "@aigne/bedrock SDK"
}
AWS-Bedrock: {
  label: "AWS Bedrock"
}
Foundation-Model: {
  label: "基础模型"
}

Application -> Aigne-Bedrock-SDK: "1. invoke(..., { streaming: true })"
Aigne-Bedrock-SDK -> AWS-Bedrock: "2. 发送流式 API 请求"
AWS-Bedrock -> Foundation-Model: "3. 将请求转发给模型"

loop: "实时响应生成" {
  Foundation-Model -> AWS-Bedrock: "4a. 生成文本块"
  AWS-Bedrock -> Aigne-Bedrock-SDK: "4b. 将文本块流式传回"
  Aigne-Bedrock-SDK -> Application: "4c. 通过异步迭代器产生文本块"
}

AWS-Bedrock -> Aigne-Bedrock-SDK: "5. 流结束信号"
Aigne-Bedrock-SDK -> Application: "6. 流关闭"
```

### 结构化 JSON 输出

您可以指示模型返回一个符合特定 Zod schema 的结构化 JSON 对象。这对于生成可预测的、机器可读的输出非常有用。

为此，请定义一个 Zod schema，并将其传入 `invoke` 方法的 `responseFormat` 选项中。SDK 将自动提示模型使用 `generate_json` 工具来生成所需的输出。

```typescript
import { BedrockChatModel } from "@aigne/bedrock";
import { z } from "zod";

async function getStructuredResponse() {
  const model = new BedrockChatModel({
    region: "us-east-1",
    model: "anthropic.claude-3-sonnet-20240229-v1:0",
  });

  const userSchema = z.object({
    name: z.string().describe("用户的全名。"),
    email: z.string().email().describe("用户的电子邮件地址。"),
    age: z.number().positive().describe("用户的年龄。"),
  });

  const result = await model.invoke({
    messages: [
      {
        role: "user",
        content: "从以下文本中提取用户信息：John Doe 今年 30 岁，他的电子邮件是 john.doe@example.com。",
      },
    ],
    responseFormat: {
      type: "json_schema",
      jsonSchema: {
        schema: userSchema,
      },
    },
  });

  console.log(result.json);
}

getStructuredResponse();
/* 预期输出：
{
  name: "John Doe",
  email: "john.doe@example.com",
  age: 30
}
*/
```