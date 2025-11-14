# 模型配置

要在 AIGNE 框架内集成和利用各种 AI 模型，您必须首先配置必要的凭证，主要通过环境变量。这确保了与相应第三方服务的安全和正确的身份验证。本指南提供了每个支持的模型提供商所需的特定环境变量。

## 通用用法

要使用特定模型，您通常需要设置两个主要的环境变量：

1.  `MODEL`：指定模型标识符，通常以提供商的名称为前缀（例如，`openai:gpt-4o`）。
2.  `[PROVIDER]_API_KEY`：该提供商的唯一 API 密钥（例如，`OPENAI_API_KEY`）。

您可以在运行应用程序之前在您的 shell 中设置这些变量。

```bash 设置环境变量 icon=lucide:terminal
export MODEL=openai:gpt-4o
export OPENAI_API_KEY="your_api_key_here"

# 然后运行您的 AIGNE 应用程序
node your-app.js
```

## 提供商配置

以下是每个受支持的模型提供商所需环境变量的详细列表。请将占位符值替换为您的实际凭证。

### OpenAI

要连接到 OpenAI 模型（如 GPT-4o），请设置以下变量：

```bash OpenAI 配置 icon=lucide:key-round
export MODEL="openai:gpt-4o"
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

### Anthropic

对于 Anthropic 的 Claude 模型，请进行以下配置：

```bash Anthropic 配置 icon=lucide:key-round
export MODEL="anthropic:claude-3-7-sonnet-latest"
export ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY"
```

### Google Gemini

要使用 Google 的 Gemini 模型，请设置以下变量：

```bash Gemini 配置 icon=lucide:key-round
export MODEL="gemini:gemini-2.0-flash"
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### AWS Bedrock

对于托管在 AWS Bedrock 上的模型，您需要提供您的 AWS 凭证和目标区域。

```bash AWS Bedrock 配置 icon=lucide:key-round
export MODEL="bedrock:us.amazon.nova-premier-v1:0"
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
export AWS_REGION="YOUR_AWS_REGION"
```

### DeepSeek

要使用 DeepSeek 模型，请配置以下 API 密钥：

```bash DeepSeek 配置 icon=lucide:key-round
export MODEL="deepseek/deepseek-chat"
export DEEPSEEK_API_KEY="YOUR_DEEPSEEK_API_KEY"
```

### Doubao

对于 Doubao 模型，请设置以下环境变量：

```bash Doubao 配置 icon=lucide:key-round
export MODEL="doubao-seed-1-6-250615"
export DOUBAO_API_KEY="YOUR_DOUBAO_API_KEY"
```

### Ideogram

对于 Ideogram 的图像生成模型，请按如下所示配置您的 API 密钥：

```bash Ideogram 配置 icon=lucide:key-round
export MODEL="ideogram-v3"
export IDEOGRAM_API_KEY="YOUR_IDEOGRAM_API_KEY"
```

### Ollama

当使用本地托管的 Ollama 实例时，您需要指定模型名称和 API 端点。API 密钥通常是一个占位符。

```bash Ollama 配置 icon=lucide:server
export MODEL="llama3"
export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434/v1"
export OLLAMA_API_KEY="ollama"
```

### OpenRouter

OpenRouter 通过单个 API 提供对各种模型的访问。请使用其完整路径指定模型。

```bash OpenRouter 配置 icon=lucide:key-round
export MODEL="openai/gpt-4o"
export OPEN_ROUTER_API_KEY="YOUR_OPEN_ROUTER_API_KEY"
```

### Poe

要通过 Poe 连接到模型，请使用以下配置：

```bash Poe 配置 icon=lucide:key-round
export MODEL="claude-3-opus"
export POE_API_KEY="YOUR_POE_API_KEY"
```

### xAI

对于 xAI 的 Grok 模型，请设置 `XAI_API_KEY` 环境变量。

```bash xAI 配置 icon=lucide:key-round
export MODEL="grok-2-latest"
export XAI_API_KEY="YOUR_XAI_API_KEY"
```

### LMStudio

对于通过 LMStudio 本地托管的模型，请指定模型名称。由于 LMStudio 默认在本地运行且无需身份验证，API 密钥通常是一个占位符。

```bash LMStudio 配置 icon=lucide:server
export MODEL="llama-3.2-3b-instruct"
export LM_STUDIO_API_KEY="lmstudio"
```

## 总结

正确配置这些环境变量是将任何模型集成到 AIGNE 框架中的基础步骤。这种方法可以保护您敏感的 API 密钥安全，并允许在不更改应用程序代码的情况下灵活选择模型。有关每个提供商的更详细指南，请参阅特定的文档页面，例如 [OpenAI](./models-openai.md) 或 [Google Gemini](./models-gemini.md)。