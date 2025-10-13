AIGNE 支持多种模型提供商，让开发者能够根据自身需求选择最合适的模型。本节将详细介绍支持的提供商以及如何使用它们。

### 支持的模型提供商

支持以下模型提供商：

- **OpenAI**：来自 OpenAI 的模型，包括 GPT 系列。
- **Anthropic**：来自 Anthropic 的模型，例如 Claude。
- **Gemini**：谷歌的 Gemini 模型。
- **Bedrock**：亚马逊的 Bedrock 服务，提供对一系列模型的访问。
- **DeepSeek**：来自 DeepSeek 的模型。
- **Doubao**：豆包模型。
- **Ideogram**：来自 Ideogram 的图像生成模型。
- **Ollama**：使用 Ollama 在本地运行开源模型。
- **OpenRouter**：通过 OpenRouter 服务访问各种模型。
- **Poe**：可通过 Poe 使用的模型。
- **XAI**：来自 XAI 的模型。
- **AIGNE Hub**：一个用于访问和管理各种模型的中心枢纽。

这些提供商可以在您的 AIGNE 应用程序中进行配置和使用，为您的 AI Agent 带来灵活性和强大功能。

### 支持的模型示意图

下图展示了 AIGNE 模型支持的架构，其核心框架连接到各种模型提供商。

AIGNE 支持多种模型提供商，让开发者能够根据自身需求选择最合适的模型。本节将详细介绍支持的提供商以及如何使用它们。

### 支持的模型提供商

支持以下模型提供商：

- **OpenAI**：来自 OpenAI 的模型，包括 GPT 系列。
- **Anthropic**：来自 Anthropic 的模型，例如 Claude。
- **Gemini**：谷歌的 Gemini 模型。
- **Bedrock**：亚马逊的 Bedrock 服务，提供对一系列模型的访问。
- **DeepSeek**：来自 DeepSeek 的模型。
- **Doubao**：豆包模型。
- **Ideogram**：来自 Ideogram 的图像生成模型。
- **Ollama**：使用 Ollama 在本地运行开源模型。
- **OpenRouter**：通过 OpenRouter 服务访问各种模型。
- **Poe**：可通过 Poe 使用的模型。
- **XAI**：来自 XAI 的模型。
- **AIGNE Hub**：一个用于访问和管理各种模型的中心枢纽。

这些提供商可以在您的 AIGNE 应用程序中进行配置和使用，为您的 AI Agent 带来灵活性和强大功能。

### 支持的模型示意图

下图展示了 AIGNE 模型支持的架构，其核心框架连接到各种模型提供商。

```d2
direction: down

AIGNE: {
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

Model-Providers: {
  label: "支持的模型提供商"
  shape: rectangle
  style.stroke-dash: 2
  grid-columns: 3

  OpenAI
  Anthropic
  Gemini
  Bedrock
  DeepSeek
  Doubao
  Ideogram
  Ollama
  OpenRouter
  Poe
  XAI
  AIGNE-Hub: "AIGNE 枢纽"
}

AIGNE -> Model-Providers: "连接到"
```

### 在 AIGNE 中使用模型

要使用模型，您首先需要安装相应的包。例如，要使用 OpenAI 模型，您需要安装 `@aigne/openai` 包。

```bash
npm install @aigne/openai
```

然后，您可以导入模型并在您的 Agent 定义中使用它。

```javascript
import { OpenAIChatModel } from '@aigne/openai';

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
});
```

### AIGNE Hub

AIGNE Hub 是一项服务，允许您从一个地方访问和管理各种模型。要使用它，您需要将 AIGNE CLI 连接到 Hub。

```bash
aigne hub connect
```

这将引导您完成 AIGNE Hub 的身份验证过程。连接后，您就可以使用任何支持的模型，而无需管理各个 API 密钥。

### 模型配置

您可以通过向模型的构造函数传递一个选项对象来配置模型。可用选项取决于模型提供商。例如，`OpenAIChatModel` 支持 `temperature`、`max_tokens` 和 `top_p` 等选项。

```javascript
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 1024,
});
```

### 各提供商支持的模型

下表列出了每个提供商支持的模型。请参阅提供商的文档以获取最新的列表。

| 提供商 | 支持的模型 |
| --- | --- |
| **OpenAI** | `gpt-4`、`gpt-4-32k`、`gpt-4-turbo`、`gpt-3.5-turbo` 等。 |
| **Anthropic** | `claude-2`、`claude-instant-1` 等。 |
| **Gemini** | `gemini-pro` 等。 |
| **Bedrock** | 来自 AI21 Labs、Anthropic、Cohere、Meta 和 Stability AI 的各种模型。 |
| **DeepSeek** | `deepseek-coder`、`deepseek-llm` 等。 |
| **Doubao** | `doubao-pro-4k`、`doubao-pro-32k` 等。 |
| **Ideogram** | 图像生成模型。 |
| **Ollama** | 各种开源模型。 |
| **OpenRouter** | 来自不同提供商的各种模型。 |
| **Poe** | 可通过 Poe 平台使用的模型。 |
| **XAI** | `grok-1` 等。 |
| **AIGNE Hub**| 上述所有提供商的模型。 |