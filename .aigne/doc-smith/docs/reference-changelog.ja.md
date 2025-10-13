AIGNEは、開発者がニーズに最適なものを選択できるよう、さまざまなモデルプロバイダーをサポートしています。このセクションでは、サポートされているプロバイダーとその使用方法について詳しく説明します。

### サポートされているモデルプロバイダー

以下のモデルプロバイダーがサポートされています。

- **OpenAI**: GPTシリーズを含む、OpenAIのモデル。
- **Anthropic**: ClaudeなどのAnthropicのモデル。
- **Gemini**: GoogleのGeminiモデル。
- **Bedrock**: AmazonのBedrockサービスで、さまざまなモデルへのアクセスを提供します。
- **DeepSeek**: DeepSeekのモデル。
- **Doubao**: Doubaoモデル。
- **Ideogram**: Ideogramの画像生成モデル。
- **Ollama**: Ollamaを使用してオープンソースモデルをローカルで実行。
- **OpenRouter**: OpenRouterサービスを通じてさまざまなモデルにアクセス。
- **Poe**: Poeを通じて利用可能なモデル。
- **XAI**: XAIのモデル。
- **AIGNE Hub**: さまざまなモデルにアクセスし、管理するための中央ハブ。

これらのプロバイダーはAIGNEアプリケーション内で設定して使用でき、AI Agentに柔軟性とパワーを提供します。

### サポートされているモデルの図

次の図は、AIGNEのモデルサポートのアーキテクチャを示しており、コアフレームワークがさまざまなモデルプロバイダーに接続しています。

AIGNEは、開発者がニーズに最適なものを選択できるよう、さまざまなモデルプロバイダーをサポートしています。このセクションでは、サポートされているプロバイダーとその使用方法について詳しく説明します。

### サポートされているモデルプロバイダー

以下のモデルプロバイダーがサポートされています。

- **OpenAI**: GPTシリーズを含む、OpenAIのモデル。
- **Anthropic**: ClaudeなどのAnthropicのモデル。
- **Gemini**: GoogleのGeminiモデル。
- **Bedrock**: AmazonのBedrockサービスで、さまざまなモデルへのアクセスを提供します。
- **DeepSeek**: DeepSeekのモデル。
- **Doubao**: Doubaoモデル。
- **Ideogram**: Ideogramの画像生成モデル。
- **Ollama**: Ollamaを使用してオープンソースモデルをローカルで実行。
- **OpenRouter**: OpenRouterサービスを通じてさまざまなモデルにアクセス。
- **Poe**: Poeを通じて利用可能なモデル。
- **XAI**: XAIのモデル。
- **AIGNE Hub**: さまざまなモデルにアクセスし、管理するための中央ハブ。

これらのプロバイダーはAIGNEアプリケーション内で設定して使用でき、AI Agentに柔軟性とパワーを提供します。

### サポートされているモデルの図

次の図は、AIGNEのモデルサポートのアーキテクチャを示しており、コアフレームワークがさまざまなモデルプロバイダーに接続しています。

```d2
direction: down

AIGNE: {
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

Model-Providers: {
  label: "サポートされているモデルプロバイダー"
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
  AIGNE-Hub: "AIGNE Hub"
}

AIGNE -> Model-Providers: "接続"
```

### AIGNEでのモデルの使用

モデルを使用するには、まず対応するパッケージをインストールする必要があります。たとえば、OpenAIモデルを使用するには、`@aigne/openai`パッケージをインストールします。

```bash
npm install @aigne/openai
```

次に、モデルをインポートし、Agentの定義で使用できます。

```javascript
import { OpenAIChatModel } from '@aigne/openai';

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
});
```

### AIGNE Hub

AIGNE Hubは、さまざまなモデルに単一の場所からアクセスし、管理できるサービスです。これを使用するには、AIGNE CLIをHubに接続する必要があります。

```bash
aigne hub connect
```

これにより、AIGNE Hubでの認証プロセスが案内されます。接続すると、個別のAPIキーを管理することなく、サポートされているモデルのいずれかを使用できます。

### モデルの設定

モデルのコンストラクタにオプションオブジェクトを渡すことで、モデルを設定できます。利用可能なオプションはモデルプロバイダーによって異なります。たとえば、`OpenAIChatModel`は`temperature`、`max_tokens`、`top_p`などのオプションをサポートしています。

```javascript
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 1024,
});
```

### プロバイダー別のサポートされているモデル

次の表は、各プロバイダーでサポートされているモデルの一覧です。最新のリストについては、プロバイダーのドキュメントを参照してください。

| プロバイダー | サポートされているモデル |
| --- | --- |
| **OpenAI** | `gpt-4`、`gpt-4-32k`、`gpt-4-turbo`、`gpt-3.5-turbo`など。 |
| **Anthropic** | `claude-2`、`claude-instant-1`など。 |
| **Gemini** | `gemini-pro`など。 |
| **Bedrock** | AI21 Labs、Anthropic、Cohere、Meta、Stability AIの様々なモデル。 |
| **DeepSeek** | `deepseek-coder`、`deepseek-llm`など。 |
| **Doubao** | `doubao-pro-4k`、`doubao-pro-32k`など。 |
| **Ideogram** | 画像生成モデル。 |
| **Ollama** | 広範なオープンソースモデル。 |
| **OpenRouter** | さまざまなプロバイダーからの多様なモデル。 |
| **Poe** | Poeプラットフォームを通じて利用可能なモデル。 |
| **XAI** | `grok-1`など。 |
| **AIGNE Hub**| 上記のプロバイダーのすべてのモデル。 |