# 模型配置

要集成和利用 AIGNE 框架支持的各种 AI 模型，必须配置相应的环境变量。此设置通常涉及提供用于身份验证的 API 密钥，并可能包含其他特定于提供商的设置。本指南为每个受支持的模型提供商所需的环境变量提供了全面的参考。

## 提供商配置

下表详细说明了每个 AI 模型提供商所需的必要环境变量。这些变量必须在您的环境中设置，以便框架能够对相应服务进行身份验证和连接。

| 提供商 | 环境变量 | 描述 |
| :--- | :--- | :--- |
| **AIGNE Hub** | `AIGNE_HUB_BASE_URL`<br/>`AIGNE_HUB_API_KEY` | 设置您的 AIGNE Hub 实例的基础 URL 和身份验证所需的 API 密钥。 |
| **Anthropic** | `ANTHROPIC_API_KEY` | 用于访问 Anthropic 的 Claude 模型的 API 密钥。 |
| **AWS Bedrock** | `AWS_ACCESS_KEY_ID`<br/>`AWS_SECRET_ACCESS_KEY`<br/>`AWS_REGION` | 您的 AWS 凭证和通过 AWS Bedrock 访问模型的特定区域。 |
| **DeepSeek** | `DEEPSEEK_API_KEY` | 用于访问 DeepSeek 模型的 API 密钥。 |
| **Doubao** | `DOUBAO_API_KEY` | 用于访问 Doubao 模型的 API 密钥。 |
| **Google Gemini**| `GEMINI_API_KEY` | 用于访问 Google Gemini 模型的 API 密钥。 |
| **Ideogram** | `IDEOGRAM_API_KEY` | 用于 Ideogram 图像生成模型的 API 密钥。 |
| **LMStudio** | `LM_STUDIO_BASE_URL`<br/>`LM_STUDIO_API_KEY` | 您的本地 LMStudio 服务器的基础 URL（例如 `http://localhost:1234/v1`）。API 密钥通常不是必需的，默认为占位符。 |
| **Ollama** | `OLLAMA_DEFAULT_BASE_URL`<br/>`OLLAMA_API_KEY` | 您的本地 Ollama 实例的基础 URL（例如 `http://localhost:11434/v1`）。API 密钥通常是一个占位符，如 `ollama`。 |
| **OpenAI** | `OPENAI_API_KEY` | 用于访问 OpenAI 模型（如 GPT-4o）的 API 密钥。 |
| **OpenRouter** | `OPEN_ROUTER_API_KEY` | 用于通过 OpenRouter 服务访问各种模型的 API 密钥。 |
| **Poe** | `POE_API_KEY` | 用于通过 Poe 服务访问各种模型的 API 密钥。 |
| **xAI** | `XAI_API_KEY` | 用于访问 xAI 的 Grok 模型的 API 密钥。 |

## 设置环境变量

您可以在运行应用程序之前在 shell 中设置这些变量。具体命令取决于您的操作系统。

### macOS 和 Linux

使用 `export` 命令为当前终端会话设置环境变量。

```bash 设置 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```

要使变量在不同会话中保持持久，请将 `export` 命令添加到您 shell 的配置文件中，例如 `~/.bash_profile`、`~/.zshrc` 或 `~/.profile`。

### Windows

在命令提示符中使用 `set` 命令，或在 PowerShell 中使用 `$env:`。

**命令提示符：**
```powershell 在 CMD 中设置 OpenAI API 密钥 icon=lucide:terminal
set OPENAI_API_KEY="your-openai-api-key"
```

**PowerShell：**
```powershell 在 PowerShell 中设置 OpenAI API 密钥 icon=lucide:terminal
$env:OPENAI_API_KEY="your-openai-api-key"
```

要在 Windows 上永久设置环境变量，请使用“系统属性”中的“环境变量”对话框。

## 总结

正确配置这些环境变量是使用任何集成 AI 模型的先决条件。请确保为您要使用的提供商设置了正确的密钥和其他所需值。有关使用特定模型的详细指南，请参阅每个提供商的单独文档页面，例如 [OpenAI](./models-openai.md) 或 [Google Gemini](./models-gemini.md)。