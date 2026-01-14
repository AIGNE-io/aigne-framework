# AIGNE Hub

AIGNE Hub は、複数のプロバイダーが提供する様々な大規模言語モデル（LLM）、画像生成サービス、動画生成サービスにアクセスするための統一されたプロキシレイヤーを提供します。`@aigne/aigne-hub` パッケージを使用することで、クライアント側のアプリケーションロジックを変更することなく、異なるAIモデル間をシームレスに切り替え、すべてのリクエストを単一の一貫したAPIエンドポイント経由で送信できます。

このガイドでは、`AIGNEHubChatModel`、`AIGNEHubImageModel`、および `AIGNEHubVideoModel` クラスを使用してアプリケーションを AIGNE Hub に接続するためのインストール、設定、および使用方法について説明します。

## 概要

AIGNE Hub は、OpenAI、Anthropic、Google などの主要な AI プロバイダーを集約するゲートウェイとして機能します。このアーキテクチャにより、各プロバイダーの API の特定の要件が抽象化され、統合が簡素化されます。プロバイダーのプレフィックスを含む一意の識別子（例：`openai/gpt-4o-mini` または `anthropic/claude-3-sonnet`）を渡すだけで、サポートされているどのモデルとも対話できます。

### 主な機能

-   **統一アクセス**: すべての LLM、画像、動画生成リクエストに対応する単一のエンドポイント。
-   **マルチプロバイダー対応**: OpenAI、Anthropic、AWS Bedrock、Google、DeepSeek、Ollama、xAI、OpenRouter のモデルにアクセス可能。
-   **セキュアな認証**: 単一のAPIキー（`apiKey`）でアクセスを管理。
-   **チャット、画像、動画モデル**: チャット補完、画像生成、動画作成をサポート。
-   **ストリーミング**: チャット応答のリアルタイム、トークンレベルのストリーミング。
-   **シームレスな統合**: より広範な AIGNE フレームワークと連携するように設計されています。

### 対応プロバイダー

AIGNE Hub は、統一された API を通じて幅広い AI プロバイダーをサポートしています。

| プロバイダー | 識別子 |
| :--- | :--- |
| OpenAI | `openai` |
| Anthropic | `anthropic` |
| AWS Bedrock | `bedrock` |
| DeepSeek | `deepseek` |
| Google | `google` |
| Ollama | `ollama` |
| OpenRouter | `openRouter` |
| xAI | `xai` |

## インストール

まず、プロジェクトに `@aigne/aigne-hub` と `@aigne/core` パッケージをインストールします。

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

チャット、画像、動画モデルを AIGNE Hub インスタンスに接続するには、設定が必要です。主なオプションには、Hub の URL、アクセスキー、および希望するモデルの識別子が含まれます。

### モデル設定

設定オプションは `AIGNEHubChatModel`、`AIGNEHubImageModel`、`AIGNEHubVideoModel` で共通です。

<x-field-group>
  <x-field data-name="baseUrl" data-type="string" data-required="true">
    <x-field-desc markdown>AIGNE Hub インスタンスのベースURL（例：`https://your-aigne-hub-instance/ai-kit`）。</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-required="true">
    <x-field-desc markdown>AIGNE Hub での認証に使用する API アクセスキー。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="true">
    <x-field-desc markdown>プロバイダーのプレフィックスが付いたモデル識別子（例：`openai/gpt-4o-mini`）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>プロバイダーのAPIに渡す、モデル固有のオプションパラメータ。</x-field-desc>
  </x-field>
</x-field-group>

## 使用方法

### チャット補完

チャット補完を実行するには、`AIGNEHubChatModel` を設定でインスタンス化し、`invoke` メソッドを呼び出します。

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

リアルタイムで応答を得るには、`invoke` の呼び出しで `streaming` オプションを `true` に設定します。これにより、応答チャンクが利用可能になるたびにそれを生成する非同期イテレータが返されます。

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

AIGNE Hub は複数のプロバイダーからの画像生成をサポートしています。`AIGNEHubImageModel` をインスタンス化し、プロンプトとモデル固有のパラメータを提供します。

#### OpenAI DALL-E

```typescript DALL-E 3 で生成 icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
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

-   **参照**: [OpenAI Images API ドキュメンテーション](https://platform.openai.com/docs/guides/images)

#### Google Gemini Imagen

```typescript Imagen で生成 icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset",
  n: 1,
  aspectRatio: "1:1",
});

console.log(result.images[0].base64); // 注意：Gemini モデルは base64 データを返します
```

-   **参照**: [Google AI Generative Models API](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html)

#### Ideogram

```typescript Ideogram で生成 icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "ideogram/ideogram-v3",
});

const result = await model.invoke({
  prompt: "A cyberpunk character with glowing blue eyes, cinematic style",
  aspectRatio: "1:1",
  styleType: "cinematic",
});

console.log(result.images[0].url);
```

-   **参照**: [Ideogram API ドキュメンテーション](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)

### 動画生成

AIGNE Hub は、その統一されたAPIを、主要プロバイダーによるAIを活用した動画生成にまで拡張しています。動画を作成するには、`AIGNEHubVideoModel` を適切な設定でインスタンス化します。

#### OpenAI Sora

```typescript Sora で生成 icon=logos:typescript
import { AIGNEHubVideoModel } from "@aigne/aigne-hub";

const model = new AIGNEHubVideoModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "openai/sora-2",
});

const result = await model.invoke({
  prompt: "A serene beach scene with gentle waves at sunset",
  size: "1280x720",
  seconds: "8",
  outputFileType: "url",
});

console.log(result);
```

**レスポンス例**
```json
{
  "videos": [{ "url": "https://...", "type": "url" }],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0,
    "aigneHubCredits": 200
  },
  "model": "openai/sora-2",
  "seconds": 8
}
```

-   **参照**: [OpenAI Video API ドキュメンテーション](https://platform.openai.com/docs/api-reference/videos)

#### Google Gemini Veo

```typescript Veo で生成 icon=logos:typescript
import { AIGNEHubVideoModel } from "@aigne/aigne-hub";

const model = new AIGNEHubVideoModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "google/veo-3.1-generate-preview",
});

const result = await model.invoke({
  prompt: "A majestic eagle soaring through mountain valleys",
  aspectRatio: "16:9",
  size: "1080p",
  seconds: "6",
  outputFileType: "url",
});

console.log(result);
```

**レスポンス例**
```json
{
  "videos": [{ "url": "https://...", "type": "url" }],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0,
    "aigneHubCredits": 150
  },
  "model": "google/veo-3.1-generate-preview",
  "seconds": 6
}
```

-   **参照**: [Google Gemini Video API ドキュメンテーション](https://ai.google.dev/api/generate-videos)

## まとめ

`@aigne/aigne-hub` パッケージは、AIGNE Hub サービスのための統一されたクライアントを提供することで、マルチプロバイダーの LLM 統合を簡素化します。チャット、画像、動画モデルのプロバイダー固有のロジックを抽象化することにより、開発者はより柔軟で保守性の高いAI搭載アプリケーションを構築できます。

特定のモデルとその機能に関する詳細については、各AIプロバイダーが提供するドキュメントを参照してください。他のモデル統合については、[モデル概要](./models-overview.md) を参照してください。