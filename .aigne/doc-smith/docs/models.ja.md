# AIGNE モデル

AIGNE は、多種多様な AI モデルプロバイダーとのシームレスな統合のために設計された、包括的な SDK スイートを提供します。これらのパッケージは、AIGNE フレームワーク全体で一貫した統一インターフェースを提供し、開発者がコアアプリケーションロジックを変更することなく、さまざまな AI モデルの強力な機能を簡単に活用できるようにします。

OpenAI の GPT モデル、Anthropic の Claude、Google の Gemini、または Ollama を介したローカルホストモデルのいずれを使用している場合でも、AIGNE モデル SDK は開発プロセスを効率化します。各 SDK は、特定のプロバイダーの API に合わせて調整されていますが、チャット補完、ストリーミング、その他の機能については標準化された `invoke` メソッドに準拠しています。

さらに、`@aigne/aigne-hub` を使用すると、単一のゲートウェイを介して複数のプロバイダーにアクセスでき、API キーの管理を簡素化し、動的なモデルの切り替えやフォールバックが可能になります。この導入部では、利用可能なモデルの概要を説明し、そのインストールと使用方法を案内します。

```d2
direction: down

Developer-Application: {
  label: "開発者のアプリケーション"
  shape: rectangle
}

AIGNE-Ecosystem: {
  label: "AIGNE SDK エコシステム"
  shape: rectangle
  style: {
    stroke-dash: 4
  }
  grid-gap: 100

  AIGNE-SDKs: {
    label: "AIGNE SDK"
    shape: rectangle
    grid-columns: 4
    grid-gap: 40

    aigne-core: {
      label: "@aigne/core\n(基盤)"
      style.fill: "#d1e7dd"
    }

    aigne-hub: {
      label: "@aigne/aigne-hub\n(ゲートウェイ)"
      style.fill: "#cfe2ff"
    }
    aigne-open-router: {
      label: "@aigne/open-router\n(ゲートウェイ)"
      style.fill: "#cfe2ff"
    }
    aigne-poe: {
      label: "@aigne/poe\n(ゲートウェイ)"
      style.fill: "#cfe2ff"
    }

    aigne-openai: { label: "@aigne/openai" }
    aigne-anthropic: { label: "@aigne/anthropic" }
    aigne-gemini: { label: "@aigne/gemini" }
    aigne-bedrock: { label: "@aigne/bedrock" }
    aigne-deepseek: { label: "@aigne/deepseek" }
    aigne-doubao: { label: "@aigne/doubao" }
    aigne-ideogram: { label: "@aigne/ideogram" }
    aigne-ollama: { label: "@aigne/ollama" }
    aigne-xai: { label: "@aigne/xai" }
  }

  AI-Model-Providers: {
    label: "AI モデルプロバイダー (外部サービス)"
    shape: rectangle
    grid-columns: 4
    grid-gap: 40

    OpenAI: { label: "OpenAI\n(GPT, DALL-E)" }
    Anthropic: { label: "Anthropic\n(Claude)" }
    Google: { label: "Google\n(Gemini, Imagen)" }
    AWS-Bedrock: { label: "AWS Bedrock" }
    Deepseek: { label: "Deepseek" }
    Doubao: { label: "Doubao" }
    Ideogram: { label: "Ideogram" }
    Ollama: { label: "Ollama\n(ローカルサービス)" }
    OpenRouter: { label: "OpenRouter" }
    Poe: { label: "Poe" }
    xAI: { label: "xAI\n(Grok)" }
  }
}

Developer-Application -> AIGNE-Ecosystem.AIGNE-SDKs: "SDK を使用"

AIGNE-Ecosystem.AIGNE-SDKs.aigne-openai -> AIGNE-Ecosystem.AI-Model-Providers.OpenAI
AIGNE-Ecosystem.AIGNE-SDKs.aigne-anthropic -> AIGNE-Ecosystem.AI-Model-Providers.Anthropic
AIGNE-Ecosystem.AIGNE-SDKs.aigne-gemini -> AIGNE-Ecosystem.AI-Model-Providers.Google
AIGNE-Ecosystem.AIGNE-SDKs.aigne-bedrock -> AIGNE-Ecosystem.AI-Model-Providers.AWS-Bedrock
AIGNE-Ecosystem.AIGNE-SDKs.aigne-deepseek -> AIGNE-Ecosystem.AI-Model-Providers.Deepseek
AIGNE-Ecosystem.AIGNE-SDKs.aigne-doubao -> AIGNE-Ecosystem.AI-Model-Providers.Doubao
AIGNE-Ecosystem.AIGNE-SDKs.aigne-ideogram -> AIGNE-Ecosystem.AI-Model-Providers.Ideogram
AIGNE-Ecosystem.AIGNE-SDKs.aigne-ollama -> AIGNE-Ecosystem.AI-Model-Providers.Ollama
AIGNE-Ecosystem.AIGNE-SDKs.aigne-open-router -> AIGNE-Ecosystem.AI-Model-Providers.OpenRouter
AIGNE-Ecosystem.AIGNE-SDKs.aigne-poe -> AIGNE-Ecosystem.AI-Model-Providers.Poe
AIGNE-Ecosystem.AIGNE-SDKs.aigne-xai -> AIGNE-Ecosystem.AI-Model-Providers.xAI

AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.OpenAI
AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.Anthropic
AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.Google
AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.Ideogram
```

## はじめに

まず、コア AIGNE パッケージと、使用したい AI モデルプロバイダー用の特定の SDK をインストールする必要があります。

### インストール

お好みのパッケージマネージャーを使用して、必要なパッケージをインストールします。例えば、OpenAI SDK を使用する場合：

**npm を使用**
```bash
npm install @aigne/openai @aigne/core
```

**yarn を使用**
```bash
yarn add @aigne/openai @aigne/core
```

**pnpm を使用**
```bash
pnpm add @aigne/openai @aigne/core
```

## サポートされているプロバイダー

AIGNE は、多様な AI モデルプロバイダーをサポートしており、それぞれに最適な統合のための専用 SDK が用意されています。以下は、サポートされている各プロバイダーの詳細なガイドです。

### AIGNE Hub

`@aigne/aigne-hub` は、単一のゲートウェイサービスを通じて複数の LLM プロバイダーへの統一されたアクセスを提供します。これにより、クライアント側のコードを変更することなく、OpenAI、Anthropic、Google などのプロバイダーのモデルを切り替えることができます。

**主な機能:**
-   単一のエンドポイントを介して、サポートされている任意のプロバイダーにリクエストをルーティングします。
-   単一の `accessKey` を使用して API キーを安全に管理します。
-   チャット補完、ストリーミング、画像生成をサポートします。

#### インストール
```bash
npm install @aigne/aigne-hub @aigne/core
```

#### 基本的なチャットの使用法
```typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(result);
/* 出力例:
  {
    text: "Hello! How can I help you today?",
    model: "openai/gpt-4o-mini",
    usage: {
      inputTokens: 8,
      outputTokens: 9
    }
  }
*/
```

#### 画像生成
AIGNE Hub は、複数のプロバイダーからの画像生成をサポートしています。モデル名を指定するだけで、それらを切り替えることができます。

**OpenAI DALL-E の例**
```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/dall-e-3",
});

const result = await model.invoke({
  prompt: "A futuristic cityscape with flying cars and neon lights",
  n: 1,
  size: "1024x1024",
});
```

**Google Imagen の例**
```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset",
});
```

**Ideogram の例**
```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "ideogram/ideogram-v3",
});

const result = await model.invoke({
  prompt: "A cyberpunk character with glowing blue eyes",
  resolution: "1024x1024",
});
```

### OpenAI

`@aigne/openai` SDK は、OpenAI の GPT モデルとのシームレスな統合を提供します。チャット補完、関数呼び出し、ストリーミングレスポンスをサポートしています。

#### インストール
```bash
npm install @aigne/openai @aigne/core
```

#### 基本的な使用法
```typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // API キーを直接指定するか、環境変数 OPENAI_API_KEY を使用します
  apiKey: "your-api-key", // 環境変数に設定されている場合はオプションです
  model: "gpt-4o", // 指定しない場合、デフォルトは "gpt-4o-mini" です
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

#### ストリーミングレスポンス
```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: "your-api-key",
  model: "gpt-4o",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
  },
  { streaming: true },
);

let fullText = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
  }
}
console.log(fullText);
```

### Anthropic

`@aigne/anthropic` SDK は、Anthropic の Claude AI モデルと統合し、チャット補完、ツール呼び出し、ストリーミングをサポートします。

#### インストール
```bash
npm install @aigne/anthropic @aigne/core
```

#### 基本的な使用法
```typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // API キーを直接指定するか、環境変数 ANTHROPIC_API_KEY を使用します
  apiKey: "your-api-key", // 環境変数に設定されている場合はオプションです
  model: "claude-3-haiku-20240307", // デフォルトは 'claude-3-7-sonnet-latest' です
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```

### Google Gemini

`@aigne/gemini` SDK は、Google の Gemini AI モデルに接続し、マルチモーダル入力、関数呼び出し、および Imagen による画像生成をサポートします。

#### インストール
```bash
npm install @aigne/gemini @aigne/core
```

#### 基本的なチャットの使用法
```typescript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // API キーを直接指定するか、環境変数 GOOGLE_API_KEY を使用します
  apiKey: "your-api-key", // 環境変数に設定されている場合はオプションです
  model: "gemini-1.5-flash", // デフォルトは 'gemini-1.5-pro' です
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
```

#### 画像生成
```typescript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key", 
  model: "imagen-4.0-generate-001", // デフォルトの Imagen モデル
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
```

### AWS Bedrock

`@aigne/bedrock` SDK は、AWS Bedrock でホストされている Claude、Llama、Titan などの基盤モデルと統合し、安全でスケーラブルなソリューションを提供します。

#### インストール
```bash
npm install @aigne/bedrock @aigne/core
```

#### 基本的な使用法
```typescript
import { BedrockChatModel } from "@aigne/bedrock";

const model = new BedrockChatModel({
  // 環境変数 AWS_ACCESS_KEY_ID と AWS_SECRET_ACCESS_KEY を使用します
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  model: "us.amazon.nova-premier-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

### Deepseek

`@aigne/deepseek` SDK は Deepseek の言語モデルに接続し、チャット補完のための強力で費用対効果の高いオプションを提供します。

#### インストール
```bash
npm install @aigne/deepseek @aigne/core
```

#### 基本的な使用法
```typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // API キーを直接指定するか、環境変数 DEEPSEEK_API_KEY を使用します
  apiKey: "your-api-key",
  model: "deepseek-chat", // デフォルトは 'deepseek-chat' です
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

### Doubao

`@aigne/doubao` SDK は、Doubao の言語モデルとの統合を提供します。

#### インストール
```bash
npm install @aigne/doubao @aigne/core
```

#### 基本的な使用法
```typescript
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  // API キーを直接指定するか、環境変数 DOUBAO_API_KEY を使用します
  apiKey: "your-api-key",
  model: "doubao-seed-1-6-250615", // デフォルトモデル
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

### Ideogram

`@aigne/ideogram` SDK は、Ideogram の高度な画像生成モデルとの統合に特化しています。

#### インストール
```bash
npm install @aigne/ideogram @aigne/core
```

#### 基本的な使用法
```typescript
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  apiKey: "your-api-key", // 環境変数に設定されている場合はオプションです
});

const result = await model.invoke({
  model: "ideogram-v3",
  prompt: "A serene mountain landscape at sunset with golden light",
});

console.log(result);
```

### Ollama

`@aigne/ollama` SDK を使用すると、Ollama を介してローカルでホストされているオープンソースモデルに接続でき、プライバシーと AI 機能へのオフラインアクセスが保証されます。

#### インストール
```bash
npm install @aigne/ollama @aigne/core
```

#### 前提条件
[Ollama](https://ollama.ai/) がお使いのマシンにインストールされ、実行されていることを確認してください。

#### 基本的な使用法
```typescript
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  baseURL: "http://localhost:11434", // デフォルトは localhost です
  model: "llama3", // デフォルトは 'llama3' です
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me what model you're using" }],
});

console.log(result);
```

### OpenRouter

`@aigne/open-router` SDK は、単一の統合を通じて OpenAI、Anthropic、Google などの複数のプロバイダーのモデルにアクセスするための統一された API を提供します。

#### インストール
```bash
npm install @aigne/open-router @aigne/core
```

#### 基本的な使用法
```typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  // API キーを直接指定するか、環境変数 OPEN_ROUTER_API_KEY を使用します
  apiKey: "your-api-key",
  model: "anthropic/claude-3-opus", // デフォルトは 'openai/gpt-4o' です
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

### Poe

`@aigne/poe` SDK は Poe の API と統合し、プラットフォーム上で利用可能なさまざまな言語モデルへのアクセスを提供します。

#### インストール
```bash
npm install @aigne/poe @aigne/core
```

#### 基本的な使用法
```typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // API キーを直接指定するか、環境変数 POE_API_KEY を使用します
  apiKey: "your-api-key",
  model: "claude-3-opus", // デフォルトは 'openai/gpt-4o' です
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

### xAI

`@aigne/xai` SDK は、独自の個性とリアルタイムの情報アクセスで知られる Grok を含む、XAI の言語モデルに接続します。

#### インストール
```bash
npm install @aigne/xai @aigne/core
```

#### 基本的な使用法
```typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // API キーを直接指定するか、環境変数 XAI_API_KEY を使用します
  apiKey: "your-api-key",
  model: "grok-2-latest", // デフォルトは 'grok-2-latest' です
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```