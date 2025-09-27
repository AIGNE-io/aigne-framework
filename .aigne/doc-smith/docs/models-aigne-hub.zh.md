# AIGNE Hub

AIGNE Hub 是一项强大的服务，它作为一个统一的网关，可以连接来自 OpenAI、Anthropic、Google 等众多不同提供商的各种大语言模型 (LLM)。您无需管理多个 API 密钥和账户，只需使用一个访问密钥连接到 Hub，即可无缝使用任何支持的模型。

这简化了开发过程，通过避免在您的应用程序中暴露各个提供商的密钥来增强安全性，并提供了一种集中管理使用和计费的方式。

### 工作原理

您的 AIGNE agent 与 AIGNE Hub 通信，Hub 会根据您选择的模型将您的请求安全地路由到相应的 AI 提供商。这意味着您可以在不同的模型和提供商之间切换，而无需更改应用程序的任何连接设置。

```d2
direction: down

Your-Agent: {
  label: "您的 AIGNE Agent"
  shape: rectangle
}

AIGNE-Hub: {
  label: "AIGNE Hub"
  shape: rectangle
  style.fill: "#f0f9ff"
}

AI-Providers: {
  label: "AI 模型提供商"
  shape: rectangle
  grid-columns: 3

  OpenAI: {
    label: "OpenAI"
  }

  Anthropic: {
    label: "Anthropic"
  }

  Google: {
    label: "Google Gemini"
  }

  Bedrock: {
    label: "AWS Bedrock"
  }

  Ollama: {
    label: "Ollama"
  }

  More: {
    label: "... 及更多"
  }
}

Your-Agent -> AIGNE-Hub: "1. 使用一个访问密钥发起单个请求"
AIGNE-Hub -> AI-Providers.OpenAI: "2. 路由到正确的提供商"
AIGNE-Hub -> AI-Providers.Anthropic
AIGNE-Hub -> AI-Providers.Google

```

### 主要特性

<x-cards data-columns="2">
  <x-card data-title="统一的 LLM 访问" data-icon="lucide:library">
    通过一个可靠的端点路由您所有的 AI 请求。无需管理多个 SDK 或 API 配置。
  </x-card>
  <x-card data-title="多提供商支持" data-icon="lucide:cloud">
    只需更改模型名称，即可在 OpenAI、Google、Anthropic 等顶级提供商的模型之间轻松切换。
  </x-card>
  <x-card data-title="简化的 API 密钥管理" data-icon="lucide:key-round">
    使用单个 AIGNE Hub 访问密钥来验证所有请求，确保您各个提供商的密钥在服务器端的安全。
  </x-card>
  <x-card data-title="聊天和图像生成" data-icon="lucide:messages-square">
    Hub 支持基于文本的聊天补全以及 DALL-E 和 Ideogram 等提供商的高级图像生成。
  </x-card>
</x-cards>

## 连接到 Hub

通过一个简单的命令，即可将您的本地开发环境连接到 AIGNE Hub。此过程将为您打开一个 Web 浏览器进行安全身份验证，并自动配置您的凭据。

1.  **打开您的终端或命令提示符。**
2.  **运行连接命令：**

    ```bash
    aigne hub connect
    ```

3.  **选择一个 Hub。** 系统将提示您连接到官方 AIGNE Hub（推荐新用户使用）或自定义的自托管实例。

4.  **在浏览器中授权。** 浏览器将打开一个窗口，要求您登录并批准连接。一旦您批准，CLI 将安全地接收并保存访问密钥。

就是这样！您的机器现已连接，并准备好通过 AIGNE Hub 使用模型。

## 管理您的 Hub 连接

AIGNE CLI 提供了几个命令来管理您的 Hub 连接。

### 检查连接状态

要查看当前连接的详细信息，包括您的用户信息和信用余额，请使用 `status` 命令。

```bash
aigne hub status
```

该命令将显示您连接的 Hub URL、您的用户详细信息以及您的可用积分。

### 列出所有连接

如果您使用多个 Hub（例如，官方 Hub 和私有 Hub），您可以列出所有已配置的连接。

```bash
aigne hub list
```

### 在 Hub 之间切换

要更改您的活动 Hub，请使用 `use` 命令。系统将为您呈现一个已保存连接的列表供您选择。

```bash
aigne hub use
```

### 移除连接

要断开连接并移除特定 Hub 的凭据，请使用 `remove` 命令。

```bash
aigne hub remove
```

## 使用 Hub 模型

连接后，您可以在您的 agent 配置中以 `provider/model-name` 的格式指定模型名称，以使用 Hub 上任何可用的模型。

以下是一些模型标识符的示例：

-   `openai/gpt-4o-mini`
-   `anthropic/claude-3-sonnet`
-   `google/gemini-pro`
-   `ollama/llama3`
-   `openai/dall-e-3` (for images)

通过使用这种格式，AIGNE Hub 就知道该将您的请求发送到哪里。

## 支持的提供商

AIGNE Hub 支持的 AI 提供商列表在不断增长，其中包括：

-   OpenAI
-   Anthropic
-   AWS Bedrock
-   DeepSeek
-   Doubao
-   Google Gemini
-   Ideogram
-   LM Studio
-   Ollama
-   OpenRouter
-   Poe
-   xAI (Grok)

## 总结

AIGNE Hub 是为您的 agent 提供各种 AI 模型支持的最简单、最安全的方式。它简化了密钥管理，集中了计费，并让您可以灵活地试验不同的提供商而无需重写代码。

要了解有关您可以通过 Hub 访问的具体模型的更多信息，请浏览本节中的其他页面。

- [OpenAI 模型](./models-openai.md)
- [Anthropic (Claude)](./models-anthropic.md)
- [Google Gemini](./models-gemini.md)