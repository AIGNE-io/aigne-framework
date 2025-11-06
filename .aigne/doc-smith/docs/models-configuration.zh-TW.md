# 模型組態

若要整合並利用 AIGNE 框架所支援的各種 AI 模型，設定適當的環境變數至關重要。此設定過程通常需要提供用於驗證的 API 金鑰，並可能包含其他供應商特定的設定。本指南將作為一份全面的參考，詳細說明每個支援的模型供應商所需的環境變數。

## 供應商組態

下表詳細說明了每個 AI 模型供應商所需的環境變數。您必須在您的環境中設定這些變數，框架才能驗證並連線至相應的服務。

| 供應商 | 環境變數 | 說明 |
| :--- | :--- | :--- |
| **AIGNE Hub** | `AIGNE_HUB_BASE_URL`<br/>`AIGNE_HUB_API_KEY` | 設定您的 AIGNE Hub 執行個體的基礎 URL 以及驗證所需的 API 金鑰。 |
| **Anthropic** | `ANTHROPIC_API_KEY` | 您用於存取 Anthropic 的 Claude 模型的 API 金鑰。 |
| **AWS Bedrock** | `AWS_ACCESS_KEY_ID`<br/>`AWS_SECRET_ACCESS_KEY`<br/>`AWS_REGION` | 您的 AWS 憑證以及透過 AWS Bedrock 存取模型所需的特定區域。 |
| **DeepSeek** | `DEEPSEEK_API_KEY` | 您用於存取 DeepSeek 模型的 API 金鑰。 |
| **Doubao** | `DOUBAO_API_KEY` | 您用於存取 Doubao 模型的 API 金鑰。 |
| **Google Gemini**| `GEMINI_API_KEY` | 您用於存取 Google Gemini 模型的 API 金鑰。 |
| **Ideogram** | `IDEOGRAM_API_KEY` | 您用於 Ideogram 影像生成模型的 API 金鑰。 |
| **LMStudio** | `LM_STUDIO_BASE_URL`<br/>`LM_STUDIO_API_KEY` | 您本地 LMStudio 伺服器的基礎 URL（例如：`http://localhost:1234/v1`）。通常不需要 API 金鑰，預設為預留位置。 |
| **Ollama** | `OLLAMA_DEFAULT_BASE_URL`<br/>`OLLAMA_API_KEY` | 您本地 Ollama 執行個體的基礎 URL（例如：`http://localhost:11434/v1`）。API 金鑰通常是一個預留位置，如 `ollama`。 |
| **OpenAI** | `OPENAI_API_KEY` | 您用於存取 OpenAI 模型的 API 金鑰，例如 GPT-4o。 |
| **OpenRouter** | `OPEN_ROUTER_API_KEY` | 您透過 OpenRouter 服務存取各種模型的 API 金鑰。 |
| **Poe** | `POE_API_KEY` | 您透過 Poe 服務存取各種模型的 API 金鑰。 |
| **xAI** | `XAI_API_KEY` | 您用於存取 xAI 的 Grok 模型的 API 金鑰。 |

## 設定環境變數

您可以在執行應用程式之前，在您的 shell 中設定這些變數。具體指令取決於您的作業系統。

### macOS 和 Linux

使用 `export` 指令為當前的終端機工作階段設定環境變數。

```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```

若要使變數在不同工作階段之間保持永久有效，請將 `export` 指令新增至您的 shell 設定檔中，例如 `~/.bash_profile`、`~/.zshrc` 或 `~/.profile`。

### Windows

在命令提示字元中使用 `set` 指令，或在 PowerShell 中使用 `$env:`。

**命令提示字元：**
```powershell 在 CMD 中設定 OpenAI API 金鑰 icon=lucide:terminal
set OPENAI_API_KEY="your-openai-api-key"
```

**PowerShell：**
```powershell 在 PowerShell 中設定 OpenAI API 金鑰 icon=lucide:terminal
$env:OPENAI_API_KEY="your-openai-api-key"
```

若要在 Windows 上永久設定環境變數，請使用「系統內容」中的「環境變數」對話方塊。

## 摘要

正確設定這些環境變數是使用任何整合 AI 模型的先決條件。請確保為您打算使用的供應商設定了正確的金鑰和其他必要的值。有關使用特定模型的詳細指南，請參考各供應商的個別文件頁面，例如 [OpenAI](./models-openai.md) 或 [Google Gemini](./models-gemini.md)。