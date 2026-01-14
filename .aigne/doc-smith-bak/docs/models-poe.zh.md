用户希望修复一个 D2 图表语法错误。
错误消息 `invalid style keyword: "font-family"` 表明 `font-family` 在 D2 中不是一个有效的样式属性。
我需要移除或更正 D2 代码中的这一行。

基于 ISTJ 人格，我将执行以下步骤：
1.  **分析请求：** 用户反馈了一个 D2 语法错误。目标是修正图表并重新生成文档。
2.  **识别错误：** 错误是 `invalid style keyword: "font-family"`。这是 D2 代码中的一个事实性错误。
3.  **制定修正方案：** 我必须从 D2 图表的 `style` 块中移除 `font-family` 属性。
4.  **重新生成文档：** 我将使用修正后的 D2 代码重新生成整个文档。我将确保所有其他信息保持准确并遵循既定结构。
5.  **审查输出：** 在最终确定之前，我将仔细检查生成的 Markdown 和修正后的 D2 代码块，以确保其语法正确且逻辑合理。

让我们来分解文档内容的生成过程。

**计划：**

1.  **引言：** 首先概述 `@aigne/poe` 包，解释其用途：将 AIGNE 框架与 Poe API 连接，后者提供了对各种第三方模型的访问。提及它使用了一个与 OpenAI 兼容的 API。链接到主要的模型概述页面。
2.  **图表：** 生成一个修正后的 D2 图表来说明其架构。该图表应显示 AIGNE 应用程序、`@aigne/poe` 包、Poe API 以及底层的语言模型（如 GPT、Claude）。不正确的 `font-family` 样式将被移除。
3.  **安装：** 提供清晰、可复制粘贴的命令，用于使用 npm、yarn 和 pnpm 安装必要的包（`@aigne/poe` 和 `@aigne/core`）。这是一个标准的、实用的步骤。
4.  **配置：** 详细说明 `PoeChatModel` 的配置选项。
    *   解释提供 API 密钥的两种方式（`apiKey` 属性 vs. `POE_API_KEY` 环境变量）。这对设置至关重要。
    *   使用 `<x-field-group>` 以结构化且易于阅读的格式呈现构造函数选项（`apiKey`、`model`、`modelOptions`、`baseURL`）。
    *   为每个字段提供精确的描述，包括默认值（`gpt-5-mini`、`https://api.poe.com/v1`）。这些信息可以在源代码（`models/poe/src/poe.ts`）中找到。
5.  **用法部分：**
    *   **标准调用：** 提供一个完整、可用的 TypeScript 示例，演示如何实例化 `PoeChatModel` 并调用 `invoke` 方法。使用一个清晰、实用的例子（例如，询问模型它是什么）。该示例可在 README 中找到。
    *   显示预期的 JSON 输出。这有助于用户验证他们的实现。
    *   **流式响应：** 提供第二个完整的 TypeScript 示例，演示如何使用 `streaming: true` 选项。展示处理数据块的循环（`isAgentResponseDelta`）。这是 README 中提到的一个关键特性。
    *   显示预期的流式输出，包括最终文本和元数据是如何组装的。
6.  **进一步阅读/总结：** 最后提供相关外部文档（Poe 官方文档）和内部文档（核心概念：模型）的链接。这为用户提供了清晰的下一步。

这个计划有条不紊，基于事实，并直接满足了用户对技术指南的需求，同时纠正了反馈中指出的具体错误。它遵循了 ISTJ 方法，优先考虑准确性、结构和实用性。# Poe

`@aigne/poe` 包提供了一个标准化的接口，用于与 [Poe](https://poe.com/) 集成。Poe 是一项提供对多种第三方语言模型（包括来自 OpenAI、Anthropic 和 Google 的模型）访问的服务。通过利用一个与 OpenAI 兼容的 API 端点，该包允许您在 AIGNE 框架内无缝使用各种模型。

本指南提供了安装、配置和使用 `PoeChatModel` 的分步过程。有关模型集成的更多一般信息，请参阅[模型概述](./models-overview.md)文档。

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Poe](assets/diagram/poe-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 安装

首先，使用您偏好的包管理器安装必要的包。您将需要 `@aigne/core` 和 Poe 的特定包。

```bash
npm install @aigne/poe @aigne/core
```

```bash
yarn add @aigne/poe @aigne/core
```

```bash
pnpm add @aigne/poe @aigne/core
```

## 配置

`PoeChatModel` 类是与 Poe API 交互的主要接口。要实例化它，您必须提供您的 Poe API 密钥并指定所需的模型。

您的 API 密钥可以通过两种方式设置：
1.  直接在构造函数中通过 `apiKey` 属性设置。
2.  作为名为 `POE_API_KEY` 的环境变量设置。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 Poe API 密钥。虽然这在构造函数中是可选的，但密钥必须在此处或在 `POE_API_KEY` 环境变量中提供，身份验证才能成功。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-5-mini" data-required="false">
    <x-field-desc markdown>您希望使用的模型的标识符。Poe 提供了对 `claude-3-opus`、`gpt-4o` 等模型的访问。如果未指定，则默认为 `gpt-5-mini`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>传递给模型 API 的附加选项，例如 `temperature`、`topP` 或 `maxTokens`。这些参数会直接发送给底层的模型提供商。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://api.poe.com/v1" data-required="false">
    <x-field-desc markdown>Poe API 的基础 URL。除非您正在使用自定义代理，否则不应更改此项。</x-field-desc>
  </x-field>
</x-field-group>

## 用法

以下示例演示了如何创建 `PoeChatModel` 实例，并将其用于标准和流式聊天补全。

### 标准调用

对于简单的请求-响应交互，请使用 `invoke` 方法。此方法会发送请求并等待模型的完整响应。

```typescript 基本用法 icon=logos:typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // 直接提供 API 密钥或设置 POE_API_KEY 环境变量
  apiKey: "your-poe-api-key",
  // 指定通过 Poe 可用的所需模型
  model: "claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

`invoke` 方法返回一个结构化的响应，其中包含模型的输出和使用情况元数据。

```json 预期输出 icon=material-symbols:data-object-outline
{
  "text": "我由 Poe 提供支持，使用的是 Anthropic 的 Claude 3 Opus 模型。",
  "model": "claude-3-opus",
  "usage": {
    "inputTokens": 5,
    "outputTokens": 14
  }
}
```

### 流式响应

对于实时应用程序，您可以在响应生成时以流的形式接收它。在 `invoke` 调用中设置 `streaming: true` 选项，以接收响应数据块的异步流。

```typescript 流式示例 icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  apiKey: "your-poe-api-key",
  model: "claude-3-opus",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Which model are you using?" }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text);
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n--- Final Assembled Data ---");
console.log("Full Text:", fullText);
console.log("Metadata:", json);
```

在遍历流时，每个数据块都提供了响应的增量部分。完整的文本和元数据必须从这些单独的数据块中组装起来。

```text 预期输出 icon=material-symbols:terminal
我由 Poe 提供支持，使用的是 Anthropic 的 Claude 3 Opus 模型。
--- 最终组装数据 ---
完整文本: 我由 Poe 提供支持，使用的是 Anthropic 的 Claude 3 Opus 模型。
元数据: { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## 进一步阅读

-   有关可用模型及其功能的完整列表，请查阅 [Poe 官方文档](https://developer.poe.com/docs/server-bots-and-apis)。
-   要了解模型如何融入更广泛的 AIGNE 架构，请参阅[核心概念：模型](./developer-guide-core-concepts-models.md)页面。