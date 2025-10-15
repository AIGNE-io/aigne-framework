# AIGNE Hub

AIGNE Hubは、複数のプロバイダーが提供するさまざまな大規模言語モデル（LLM）や画像生成サービスにアクセスするための統一されたプロキシレイヤーを提供します。`@aigne/aigne-hub` パッケージを使用することで、クライアント側のアプリケーションロジックを変更することなく、異なるAIモデル間をシームレスに切り替え、すべてのリクエストを単一の一貫したAPIエンドポイント経由で送信できます。

このガイドでは、アプリケーションをAIGNE Hubに接続するための `AIGNEHubChatModel` および `AIGNEHubImageModel` クラスのインストール、設定、使用方法について説明します。

## 概要

AIGNE Hubは、OpenAI、Anthropic、Googleなどの主要なAIプロバイダーを集約するゲートウェイとして機能します。このアーキテクチャは、各プロバイダーのAPI固有の要件を抽象化することで、統合を簡素化します。プロバイダーのプレフィックスを含む一意の識別子（例：`openai/gpt-4o-mini` や `anthropic/claude-3-sonnet`）を渡すだけで、サポートされている任意のモデルと対話できます。

### アーキテクチャ図

以下の図は、AIGNE Hubがアプリケーションと様々なLLMプロバイダーとの間でどのように仲介役として機能するかを示しています。アプリケーションは統一されたリクエストをHubに送信し、Hubは指定されたモデルに基づいて適切な下流サービスにリクエストをルーティングします。

```d2
direction: down

Your-Application: {
  label: "あなたのアプリケーション"
  shape: rectangle
}

AIGNE-Hub: {
  label: "AIGNE Hub"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

LLM-Providers: {
  label: "LLM プロバイダー"
  shape: rectangle
  style.stroke-dash: 4

  OpenAI: {
    label: "OpenAI\n(GPT-4o, DALL-E 3)"
  }
  Anthropic: {
    label: "Anthropic\n(Claude)"
  }
  Google: {
    label: "Google\n(Gemini, Imagen)"
  }
}

Your-Application -> AIGNE-Hub: "統一 API リクエスト\n(例: 'openai/gpt-4o-mini')"
AIGNE-Hub -> LLM-Providers.OpenAI: "リクエストをルーティング"
AIGNE-Hub -> LLM-Providers.Anthropic: "リクエストをルーティング"
AIGNE-Hub -> LLM-Providers.Google: "リクエストをルーティング"
```

### 主な機能

-   **統一アクセス**: すべてのLLMおよび画像生成リクエストに対応する単一のエンドポイント。
-   **マルチプロバイダーサポート**: OpenAI、Anthropic、AWS Bedrock、Google、DeepSeek、Ollama、xAI、OpenRouterのモデルにアクセス可能。
-   **セキュアな認証**: 単一のAPIキー（`accessKey`）でアクセスを管理。
-   **チャットおよび画像モデル**: チャット補完と画像生成の両方をサポート。
-   **ストリーミング**: チャット応答のリアルタイム、トークンレベルのストリーミング。
-   **シームレスな統合**: 広範なAIGNEフレームワークと完全に連携するように設計。

### サポートされているプロバイダー

AIGNE Hubは、統一APIを通じて幅広いAIプロバイダーをサポートしています。

| プロバイダー | 識別子 |
| :---------- | :------------ |
| OpenAI      | `openai`      |
| Anthropic   | `anthropic`   |
| AWS Bedrock | `bedrock`     |
| DeepSeek    | `deepseek`    |
| Google      | `google`      |
| Ollama      | `ollama`      |
| OpenRouter  | `openRouter`  |
| xAI         | `xai`         |

## インストール

始めるには、プロジェクトに `@aigne/aigne-hub` と `@aigne/core` パッケージをインストールします。

```bash npm install icon=logos:npm
npm install @aigne/aigne-hub @aigne/core
```

```bash yarn add icon=logos:yarn
yarn add @aigne/aigne-hub @aigne/core
```

```bash pnpm add icon=logos:pnpm
pnpm add @aigne/aigne-hub @aigne/core
```

## 設定

チャットモデルと画像モデルの両方で、AIGNE Hubインスタンスに接続するための設定が必要です。主なオプションには、HubのURL、アクセスキー、および目的のモデル識別子が含まれます。

### チャットモデルの設定

`AIGNEHubChatModel` は、以下のオプションを使用して設定します。

<x-field-group>
  <x-field data-name="baseUrl" data-type="string" data-required="true">
    <x-field-desc markdown>AIGNE Hub インスタンスのベース URL（例：`https://your-aigne-hub-instance/ai-kit`）。</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-required="true">
    <x-field-desc markdown>AIGNE Hub での認証に使用する API アクセスキー。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="true">
    <x-field-desc markdown>プロバイダーのプレフィックスが付いたモデル識別子（例：`openai/gpt-4o-mini`）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>プロバイダーの API に渡すオプションのモデル固有パラメータ。</x-field-desc>
  </x-field>
</x-field-group>

### 画像モデルの設定

`AIGNEHubImageModel` は、同様の設定構造を使用します。

<x-field-group>
  <x-field data-name="url" data-type="string" data-required="true">
    <x-field-desc markdown>AIGNE Hub インスタンスのエンドポイント。</x-field-desc>
  </x-field>
  <x-field data-name="accessKey" data-type="string" data-required="true">
    <x-field-desc markdown>認証用の API アクセスキー。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="true">
    <x-field-desc markdown>プロバイダーのプレフィックスが付いたモデル識別子（例：`openai/dall-e-3`）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>プロバイダーの API に渡すオプションのモデル固有パラメータ。</x-field-desc>
  </x-field>
</x-field-group>

## 使用方法

### チャット補完

チャット補完を実行するには、設定を使用して `AIGNEHubChatModel` をインスタンス化し、`invoke` メソッドを呼び出します。

```typescript 基本的なチャット補完 icon=logos:typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(result);
```

**レスポンス例**

```json
{
  "text": "Hello! How can I help you today?",
  "model": "openai/gpt-4o-mini",
  "usage": {
    "inputTokens": 8,
    "outputTokens": 9
  }
}
```

**モデル例：**

*   `openai/gpt-4o-mini`
*   `anthropic/claude-3-sonnet`
*   `google/gemini-pro`
*   `xai/grok-1`
*   `openRouter/mistralai/mistral-7b-instruct`
*   `ollama/llama3`

### チャット応答のストリーミング

リアルタイムの応答を得るには、`invoke` 呼び出しで `streaming` オプションを `true` に設定します。これにより、応答チャンクが利用可能になるたびにそれを生成する非同期イテレータが返されます。

```typescript ストリーミングの例 icon=logos:typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AIGNEHubChatModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
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
    if (text) {
      fullText += text;
      process.stdout.write(text);
    }
  }
}

console.log("\n--- Response Complete ---");
console.log(fullText);
```

### 画像生成

AIGNE Hubは、複数のプロバイダーからの画像生成をサポートしています。`AIGNEHubImageModel` をインスタンス化し、プロンプトとモデル固有のパラメータを提供します。

#### OpenAI DALL-E

```typescript DALL-E 3 で生成 icon=logos:typescript
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
  quality: "standard",
  style: "natural",
});

console.log(result.images[0].url);
```

-   **リファレンス**: [OpenAI Images API ドキュメント](https://platform.openai.com/docs/guides/images)

#### Google Gemini Imagen

```typescript Imagen で生成 icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset",
  n: 1,
  aspectRatio: "1:1",
});

console.log(result.images[0].base64); // 注意: Gemini モデルは base64 データを返します
```

-   **リファレンス**: [Google AI Generative Models API](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html)

#### Ideogram

```typescript Ideogram で生成 icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "ideogram/ideogram-v3",
});

const result = await model.invoke({
  prompt: "A cyberpunk character with glowing blue eyes, cinematic style",
  aspectRatio: "1:1",
  styleType: "cinematic",
});

console.log(result.images[0].url);
```

-   **リファレンス**: [Ideogram API ドキュメント](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)

## まとめ

`@aigne/aigne-hub` パッケージは、AIGNE Hubサービス用の統一クライアントを提供することで、マルチプロバイダーのLLM統合を簡素化します。プロバイダー固有のロジックを抽象化することにより、開発者はより柔軟で保守性の高いAI搭載アプリケーションを構築できます。

特定のモデルとその機能に関する詳細情報については、各AIプロバイダーが提供するドキュメントを参照してください。他のモデル統合を調べるには、[モデル概要](./models-overview.md) を参照してください。