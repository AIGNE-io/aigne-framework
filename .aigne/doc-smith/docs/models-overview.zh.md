# 模型

模型是 AIGNE 平台的核心组件，提供了与各种第三方 AI 模型交互的标准化接口。本文档涵盖了基本模型架构，列出了可用的模型，并提供了如何使用它们的示例。

## 概述

AIGNE 模型系统采用分层结构设计。基础是 `Agent`，它为任何处理单元定义了基本接口。在此之上是通用的 `Model` 类，这是一个抽象类，引入了对不同数据类型（特别是文件内容）的专门处理。

每个第三方 AI 提供商（如 OpenAI 或 Anthropic）都有 `Model` 类的具体实现。例如，`OpenAIChatModel` 和 `AnthropicChatModel` 是处理各自服务独特 API 和需求的特定类。这种架构允许您以一致的方式使用不同的模型。

```d2
direction: down

Agent: {
  label: "Agent\n（基础接口）"
  shape: rectangle
}

Model: {
  label: "Model\n（抽象类）\n处理文件内容"
  shape: rectangle
  style: {
    stroke-dash: 4
  }
}

Concrete-Models: {
  label: "具体模型实现"
  grid-columns: 2
  grid-gap: 100

  Chat-Models: {
    label: "聊天模型"
    shape: rectangle
    grid-columns: 3

    OpenAIChatModel
    AnthropicChatModel
    BedrockChatModel
    DeepSeekChatModel
    GeminiChatModel
    OllamaChatModel
    OpenRouterChatModel
    XAIChatModel
    DoubaoChatModel
    PoeChatModel
    AIGNEHubChatModel
  }

  Image-Models: {
    label: "图像模型"
    shape: rectangle
    grid-columns: 2

    OpenAIImageModel
    GeminiImageModel
    IdeogramImageModel
    DoubaoImageModel
    AIGNEHubImageModel
  }
}

Model -> Agent: "extends"
Concrete-Models.Chat-Models -> Model: "implements"
Concrete-Models.Image-Models -> Model: "implements"

```

## 核心概念

### 通用 Model 类

抽象的 `Model` 类定义在 `packages/core/src/agents/model.ts` 中，是所有特定模型实现的基础。其主要职责包括：

-   **标准化交互**：提供一致的 API 来调用模型，无论底层提供商是什么。
-   **文件处理**：自动在不同格式之间转换文件内容。这是简化数据处理的关键特性。`Model` 类可以接受以下格式的文件数据：
    -   **URL**：文件的公共 URL。模型将下载并处理它。
    -   **本地文件**：本地文件系统上的文件路径。
    -   **Base64 编码**：以 base64 字符串编码的文件内容。

该类管理这些格式之间的转换，确保数据格式正确，以供所使用的特定模型调用。

## 可用模型

AIGNE 支持来自不同提供商的多种聊天和图像生成模型。

### 聊天模型

下表列出了可用的聊天模型，可以实例化并用于基于文本的交互。

| 提供商 / 类名 | 别名 | API 密钥环境变量 |
| :--- | :--- | :--- |
| `OpenAIChatModel` | | `OPENAI_API_KEY` |
| `AnthropicChatModel` | | `ANTHROPIC_API_KEY` |
| `BedrockChatModel` | | `AWS_ACCESS_KEY_ID` |
| `DeepSeekChatModel` | | `DEEPSEEK_API_KEY` |
| `GeminiChatModel` | `google` | `GEMINI_API_KEY`, `GOOGLE_API_KEY` |
| `OllamaChatModel` | | `OLLAMA_API_KEY` |
| `OpenRouterChatModel`| | `OPEN_ROUTER_API_KEY` |
| `XAIChatModel` | | `XAI_API_KEY` |
| `DoubaoChatModel` | | `DOUBAO_API_KEY` |
| `PoeChatModel` | | `POE_API_KEY` |
| `AIGNEHubChatModel` | | `AIGNE_HUB_API_KEY` |

### 图像模型

下表列出了可用于生成视觉内容的图像模型。

| 提供商 / 类名 | 别名 | API 密钥环境变量 |
| :--- | :--- | :--- |
| `OpenAIImageModel` | | `OPENAI_API_KEY` |
| `GeminiImageModel` | `google` | `GEMINI_API_KEY` |
| `IdeogramImageModel` | | `IDEOGRAM_API_KEY` |
| `DoubaoImageModel` | | `DOUBAO_API_KEY` |
| `AIGNEHubImageModel` | | `AIGNE_HUB_API_KEY` |

## 用法

您可以轻松实例化并使用任何受支持的模型。系统提供了辅助函数，可根据提供商字符串查找并加载正确的模型。

### 解析模型标识符

模型通常由 `provider/model_name` 格式的字符串标识，例如 `openai/gpt-4o`。`parseModel` 工具可用于将此字符串分解为其组成部分。

```typescript
import { parseModel } from "models/aigne-hub/src/utils/model.ts";

const { provider, model } = parseModel("openai/gpt-4o");

console.log(provider); // "openai"
console.log(model);    // "gpt-4o"
```

### 查找和创建模型

`findModel` 函数允许您从可用模型列表中定位正确的模型类。然后，您可以使用匹配模型的 `create` 方法来实例化它。

此示例演示了如何通过提供商名称查找模型并创建其实例。

```typescript
import { findModel, parseModel } from "models/aigne-hub/src/utils/model.ts";

// 完整的模型标识符字符串
const modelIdentifier = "openai/gpt-4o";

// 1. 解析标识符以获取提供商和模型名称
const { provider, model: modelName } = parseModel(modelIdentifier);

// 2. 查找对应的可加载模型配置
const { match } = findModel(provider);

if (match) {
  // 3. 创建模型实例
  const chatModel = match.create({
    model: modelName,
    // modelOptions 可用于传递附加参数
    modelOptions: {
      temperature: 0.7,
    },
    // API 密钥也可以直接传递，但建议使用
    // 环境变量。
    // apiKey: "sk-...",
  });

  // 现在您可以使用 chatModel 实例进行 API 调用
  console.log(`Successfully created model: ${chatModel.constructor.name}`);
} else {
  console.error(`Model provider "${provider}" not found.`);
}
```

这种模块化的方法使得在不同 AI 模型之间切换变得简单，只需少量代码更改，从而提高了应用程序的灵活性和可重用性。