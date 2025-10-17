# 概述

AIGNE 框架设计为模型无关，允许开发者集成来自不同提供商的各种大型语言模型 (LLM) 和图像生成模型。这是通过一个标准化的适配器系统实现的，该系统将每个提供商独特的 API 抽象在一个统一的接口之后。

该系统的核心是 `ChatModel` 和 `ImageModel` Agent。这些专门的 Agent 充当应用程序逻辑与外部 AI 服务之间的桥梁。通过使用这些标准化的 Agent，您只需最少的代码更改即可在不同模型提供商之间切换，通常只需要更改配置。每个受支持的提供商都有一个专用软件包（例如 `@aigne/openai`、`@aigne/anthropic`），其中包含用于与其 API 通信的具体实现。

本节概述了所有官方支持的模型提供商。有关如何安装、配置和使用特定提供商的详细说明，请参阅其专门的文档页面。

```d2
direction: down
style: {
  stroke-width: 2
  font-size: 14
}

AIGNE_Framework_Core: {
  label: "AIGNE 框架核心"
  shape: rectangle
  style: {
    fill: "#D1E7DD"
    stroke: "#198754"
  }
}

Model_Abstraction_Layer: {
  label: "模型抽象层"
  shape: rectangle
  style: {
    fill: "#cfe2ff"
    stroke: "#0d6efd"
  }
}

ChatModel: {
  label: "ChatModel 接口"
  shape: rectangle
  style: {
    fill: "#f8d7da"
    stroke: "#dc3545"
  }
}

ImageModel: {
  label: "ImageModel 接口"
  shape: rectangle
  style: {
    fill: "#f8d7da"
    stroke: "#dc3545"
  }
}

Model_Providers: {
  label: "模型提供商适配器"
  shape: cloud
  style: {
    fill: "#fff3cd"
    stroke: "#ffc107"
  }
}

OpenAI: "OpenAI 适配器\n(@aigne/openai)"
Anthropic: "Anthropic 适配器\n(@aigne/anthropic)"
Google: "Google Gemini 适配器\n(@aigne/gemini)"
Bedrock: "AWS Bedrock 适配器\n(@aigne/bedrock)"
Ollama: "Ollama 适配器\n(@aigne/ollama)"
Other_Providers: {
    label: "..."
    shape: circle
}


AIGNE_Framework_Core -> Model_Abstraction_Layer: 交互

Model_Abstraction_Layer.ChatModel
Model_Abstraction_Layer.ImageModel

Model_Abstraction_Layer -> Model_Providers: 接入

Model_Providers.OpenAI
Model_Providers.Anthropic
Model_Providers.Google
Model_Providers.Bedrock
Model_Providers.Ollama
Model_Providers.Other_Providers

ChatModel -> OpenAI
ChatModel -> Anthropic
ChatModel -> Google
ChatModel -> Bedrock
ChatModel -> Ollama
ImageModel -> OpenAI
ImageModel -> Google
```

## 支持的聊天模型

下表列出了 AIGNE 框架官方支持的聊天模型提供商。选择一个提供商以查看其详细的集成指南。

| 提供商 | 软件包 |
| :--- | :--- |
| [AIGNE Hub](./models-aigne-hub.md) | `@aigne/aigne-hub` |
| [Anthropic](./models-anthropic.md) | `@aigne/anthropic` |
| [AWS Bedrock](./models-bedrock.md) | `@aigne/bedrock` |
| [DeepSeek](./models-deepseek.md) | `@aigne/deepseek` |
| [Doubao](./models-doubao.md) | `@aigne/doubao` |
| [Google Gemini](./models-gemini.md) | `@aigne/gemini` |
| [LMStudio](./models-lmstudio.md) | `@aigne/lmstudio` |
| [Ollama](./models-ollama.md) | `@aigne/ollama` |
| [OpenAI](./models-openai.md) | `@aigne/openai` |
| [OpenRouter](./models-open-router.md) | `@aigne/open-router` |
| [Poe](./models-poe.md) | `@aigne/poe` |
| [xAI](./models-xai.md) | `@aigne/xai` |

## 支持的图像模型

下表列出了官方支持的图像生成模型提供商。选择一个提供商以查看其详细的集成指南。

| 提供商 | 软件包 |
| :--- | :--- |
| [AIGNE Hub](./models-aigne-hub.md) | `@aigne/aigne-hub` |
| [Doubao](./models-doubao.md) | `@aigne/doubao` |
| [Google Gemini](./models-gemini.md) | `@aigne/gemini` |
| [Ideogram](./models-ideogram.md) | `@aigne/ideogram` |
| [OpenAI](./models-openai.md) | `@aigne/openai` |