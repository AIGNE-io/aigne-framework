# 模型設定

若要在 AIGNE 框架中整合並利用各種 AI 模型，您必須先設定必要的憑證，主要透過環境變數來完成。這能確保與各自的第三方服務進行安全且適當的驗證。本指南提供了每個支援的模型供應商所需的特定環境變數。

## 一般用法

若要使用特定模型，您通常需要設定兩個主要的環境變數：

1.  `MODEL`：指定模型識別碼，通常以供應商名稱為前綴（例如 `openai:gpt-4o`）。
2.  `[PROVIDER]_API_KEY`：該供應商的唯一 API 金鑰（例如 `OPENAI_API_KEY`）。

您可以在執行應用程式之前，在您的 shell 中設定這些變數。

```bash 設定環境變數 icon=lucide:terminal
export MODEL=openai:gpt-4o
export OPENAI_API_KEY="your_api_key_here"

# 然後執行您的 AIGNE 應用程式
node your-app.js
```

## 供應商設定

以下是每個支援的模型供應商所需的環境變數詳細列表。請將預留位置的值替換為您的實際憑證。

### OpenAI

若要連接到 OpenAI 的模型，如 GPT-4o，請設定以下變數：

```bash OpenAI 設定 icon=lucide:key-round
export MODEL="openai:gpt-4o"
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

### Anthropic

對於 Anthropic 的 Claude 模型，請進行以下設定：

```bash Anthropic 設定 icon=lucide:key-round
export MODEL="anthropic:claude-3-7-sonnet-latest"
export ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY"
```

### Google Gemini

若要使用 Google 的 Gemini 模型，請設定這些變數：

```bash Gemini 設定 icon=lucide:key-round
export MODEL="gemini:gemini-2.0-flash"
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### AWS Bedrock

對於託管在 AWS Bedrock 上的模型，您需要提供您的 AWS 憑證和目標區域。

```bash AWS Bedrock 設定 icon=lucide:key-round
export MODEL="bedrock:us.amazon.nova-premier-v1:0"
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
export AWS_REGION="YOUR_AWS_REGION"
```

### DeepSeek

若要使用 DeepSeek 模型，請設定以下 API 金鑰：

```bash DeepSeek 設定 icon=lucide:key-round
export MODEL="deepseek/deepseek-chat"
export DEEPSEEK_API_KEY="YOUR_DEEPSEEK_API_KEY"
```

### Doubao

對於 Doubao 模型，請設定以下環境變數：

```bash Doubao 設定 icon=lucide:key-round
export MODEL="doubao-seed-1-6-250615"
export DOUBAO_API_KEY="YOUR_DOUBAO_API_KEY"
```

### Ideogram

對於 Ideogram 的圖像生成模型，請如下所示設定您的 API 金鑰：

```bash Ideogram 設定 icon=lucide:key-round
export MODEL="ideogram-v3"
export IDEOGRAM_API_KEY="YOUR_IDEOGRAM_API_KEY"
```

### Ollama

當使用本地託管的 Ollama 實例時，您需要指定模型名稱和 API 端點。API 金鑰通常是一個預留位置。

```bash Ollama 設定 icon=lucide:server
export MODEL="llama3"
export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434/v1"
export OLLAMA_API_KEY="ollama"
```

### OpenRouter

OpenRouter 透過單一 API 提供對各種模型的存取。請使用其完整路徑指定模型。

```bash OpenRouter 設定 icon=lucide:key-round
export MODEL="openai/gpt-4o"
export OPEN_ROUTER_API_KEY="YOUR_OPEN_ROUTER_API_KEY"
```

### Poe

若要透過 Poe 連接到模型，請使用以下設定：

```bash Poe 設定 icon=lucide:key-round
export MODEL="claude-3-opus"
export POE_API_KEY="YOUR_POE_API_KEY"
```

### xAI

對於 xAI 的 Grok 模型，請設定 `XAI_API_KEY` 環境變數。

```bash xAI 設定 icon=lucide:key-round
export MODEL="grok-2-latest"
export XAI_API_KEY="YOUR_XAI_API_KEY"
```

### LMStudio

對於透過 LMStudio 本地託管的模型，請指定模型名稱。API 金鑰通常是一個預留位置，因為 LMStudio 預設在本地執行，無需驗證。

```bash LMStudio 設定 icon=lucide:server
export MODEL="llama-3.2-3b-instruct"
export LM_STUDIO_API_KEY="lmstudio"
```

## 總結

正確設定這些環境變數是將任何模型整合到 AIGNE 框架中的基礎步驟。這種方法可以保護您敏感的 API 金鑰安全，並允許在不更改應用程式程式碼的情況下靈活選擇模型。有關每個供應商的更詳細指南，請參閱特定的文件頁面，例如 [OpenAI](./models-openai.md) 或 [Google Gemini](./models-gemini.md)。