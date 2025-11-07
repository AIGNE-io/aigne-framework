# モデル設定

AIGNE Framework内で様々なAIモデルを統合して利用するには、まず環境変数を介して必要な認証情報を設定する必要があります。これにより、それぞれのサードパーティサービスとの安全かつ適切な認証が保証されます。このガイドでは、サポートされている各モデルプロバイダーに必要な特定の環境変数について説明します。

## 一般的な使用方法

特定のモデルを使用するには、通常、主に2つの環境変数を設定する必要があります。

1.  `MODEL`: モデルの識別子を指定します。多くの場合、プロバイダー名のプレフィックスが付いています（例：`openai:gpt-4o`）。
2.  `[PROVIDER]_API_KEY`: そのプロバイダー固有のAPIキーです（例：`OPENAI_API_KEY`）。

アプリケーションを実行する前に、これらの変数をシェルで設定できます。

```bash 環境変数を設定 icon=lucide:terminal
export MODEL=openai:gpt-4o
export OPENAI_API_KEY="your_api_key_here"

# AIGNEアプリケーションを実行
node your-app.js
```

## プロバイダーの設定

以下は、サポートされている各モデルプロバイダーに必要な環境変数の詳細なリストです。プレースホルダーの値を実際の認証情報に置き換えてください。

### OpenAI

GPT-4oのようなOpenAIモデルに接続するには、次の変数を設定します。

```bash OpenAIの設定 icon=lucide:key-round
export MODEL="openai:gpt-4o"
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

### Anthropic

AnthropicのClaudeモデルを使用するには、次のように設定します。

```bash Anthropicの設定 icon=lucide:key-round
export MODEL="anthropic:claude-3-7-sonnet-latest"
export ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY"
```

### Google Gemini

GoogleのGeminiモデルを使用するには、これらの変数を設定します。

```bash Geminiの設定 icon=lucide:key-round
export MODEL="gemini:gemini-2.0-flash"
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### AWS Bedrock

AWS Bedrockでホストされているモデルの場合、AWSの認証情報と対象リージョンを提供する必要があります。

```bash AWS Bedrockの設定 icon=lucide:key-round
export MODEL="bedrock:us.amazon.nova-premier-v1:0"
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
export AWS_REGION="YOUR_AWS_REGION"
```

### DeepSeek

DeepSeekモデルを使用するには、次のAPIキーを設定します。

```bash DeepSeekの設定 icon=lucide:key-round
export MODEL="deepseek/deepseek-chat"
export DEEPSEEK_API_KEY="YOUR_DEEPSEEK_API_KEY"
```

### Doubao

Doubaoモデルの場合、次の環境変数を設定します。

```bash Doubaoの設定 icon=lucide:key-round
export MODEL="doubao-seed-1-6-250615"
export DOUBAO_API_KEY="YOUR_DOUBAO_API_KEY"
```

### Ideogram

Ideogramの画像生成モデルの場合、次のようにAPIキーを設定します。

```bash Ideogramの設定 icon=lucide:key-round
export MODEL="ideogram-v3"
export IDEOGRAM_API_KEY="YOUR_IDEOGRAM_API_KEY"
```

### Ollama

ローカルでホストされているOllamaインスタンスを使用する場合、モデル名とAPIエンドポイントを指定する必要があります。APIキーは通常プレースホルダーです。

```bash Ollamaの設定 icon=lucide:server
export MODEL="llama3"
export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434/v1"
export OLLAMA_API_KEY="ollama"
```

### OpenRouter

OpenRouterは、単一のAPIを介して様々なモデルへのアクセスを提供します。モデルをフルパスで指定してください。

```bash OpenRouterの設定 icon=lucide:key-round
export MODEL="openai/gpt-4o"
export OPEN_ROUTER_API_KEY="YOUR_OPEN_ROUTER_API_KEY"
```

### Poe

Poeを介してモデルに接続するには、次の設定を使用します。

```bash Poeの設定 icon=lucide:key-round
export MODEL="claude-3-opus"
export POE_API_KEY="YOUR_POE_API_KEY"
```

### xAI

xAIのGrokモデルの場合、`XAI_API_KEY`環境変数を設定します。

```bash xAIの設定 icon=lucide:key-round
export MODEL="grok-2-latest"
export XAI_API_KEY="YOUR_XAI_API_KEY"
```

### LMStudio

LMStudioを介してローカルでホストされているモデルの場合、モデル名を指定します。LMStudioはデフォルトで認証なしでローカル実行されるため、APIキーは通常プレースホルダーです。

```bash LMStudioの設定 icon=lucide:server
export MODEL="llama-3.2-3b-instruct"
export LM_STUDIO_API_KEY="lmstudio"
```

## まとめ

これらの環境変数を適切に設定することは、AIGNE Frameworkに任意のモデルを統合するための基礎的なステップです。このアプローチにより、機密性の高いAPIキーを安全に保ち、アプリケーションコードを変更することなく柔軟なモデル選択が可能になります。各プロバイダーに関するより詳細なガイドについては、[OpenAI](./models-openai.md)や[Google Gemini](./models-gemini.md)などの特定のドキュメントページを参照してください。