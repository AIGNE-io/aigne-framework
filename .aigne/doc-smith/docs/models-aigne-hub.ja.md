# @aigne/aigne-hub

`@aigne/aigne-hub` SDK は、チャットおよび画像生成用の幅広い AI モデルにアクセスするための統一されたインターフェースを提供します。これは、複数の大規模言語モデル (LLM) プロバイダーに接続する強力なプロキシレイヤーである [AIGNE Hub](https://github.com/AIGNE-io/aigne-framework) のクライアントとして機能します。

このガイドでは、チャット補完と画像生成の両方について、SDK のインストール、基本的なセットアップ、および使用方法を説明します。

## はじめに

`@aigne/aigne-hub` は、AIGNE Hub サービスを介してリクエストをルーティングすることで、さまざまな AI プロバイダーとの対話を簡素化します。このゲートウェイは、OpenAI、Anthropic、AWS Bedrock、Google などのプロバイダーを集約し、モデル識別子を変更するだけでシームレスに切り替えることができます。このアプローチは、さまざまな API や認証方法を扱う複雑さを抽象化し、アプリケーションの構築に集中できるようにします。

### 仕組み

SDK は、アプリケーションからのリクエストを中央集権的な AIGNE Hub インスタンスに送信します。その後、Hub は指定されたモデル名に基づいて、これらのリクエストを適切な下流の AI プロバイダーに転送します。このアーキテクチャは、すべての AI インタラクションに対して単一のアクセスポイントと制御を提供します。

```d2
direction: down

Your-Application: {
  label: "あなたのアプリケーション"
  shape: rectangle

  aigne-aigne-hub: {
    label: "@aigne/aigne-hub SDK"
    shape: rectangle
  }
}

AIGNE-Hub: {
  label: "AIGNE Hub サービス"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

LLM-Providers: {
  label: "LLM プロバイダー"
  shape: rectangle
  grid-columns: 4

  OpenAI: {}
  Anthropic: {}
  Google: {}
  AWS-Bedrock: {
    label: "AWS Bedrock"
  }
  DeepSeek: {}
  Ollama: {}
  xAI: {}
  OpenRouter: {}
}

Your-Application.aigne-aigne-hub -> AIGNE-Hub: "API リクエスト"
AIGNE-Hub -> LLM-Providers: "集約とルーティング"
```

## 機能

-   🔌 **統一された LLM アクセス**: すべてのリクエストを単一の一貫したエンドポイント経由でルーティングします。
-   🧠 **マルチプロバイダーサポート**: シンプルな `provider/model` 命名規則を使用して、OpenAI、Anthropic、Google などのモデルにアクセスします。
-   🔐 **セキュアな認証**: 単一の `accessKey` を使用して API アクセスを安全に管理します。
-   💬 **チャット補完**: `{ role, content }` メッセージ形式を使用したチャットモデル用の標準化されたインターフェース。
-   🎨 **画像生成**: OpenAI (DALL-E)、Google (Imagen)、Ideogram のモデルで画像を生成します。
-   🌊 **ストリーミングサポート**: ストリーミングを有効にすることで、チャットモデルのリアルタイムなトークンレベルの応答を取得します。
-   🧱 **フレームワーク互換**: より広範な AIGNE フレームワークとシームレスに統合します。

## インストール

まず、お好みのパッケージマネージャーを使用して `@aigne/aigne-hub` と `@aigne/core` パッケージをインストールします。

**npm**
```bash
npm install @aigne/aigne-hub @aigne/core
```

**yarn**
```bash
yarn add @aigne/aigne-hub @aigne/core
```

**pnpm**
```bash
pnpm add @aigne/aigne-hub @aigne/core
```

## チャットモデル

`AIGNEHubChatModel` クラスは、テキストベースの AI モデルと対話するための主要なツールです。

### 基本的な使用方法

チャットモデルを使用するには、AIGNE Hub のエンドポイント、アクセスキー、および目的のモデル識別子を使用して `AIGNEHubChatModel` をインスタンス化します。

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
/* Example Output:
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

### ストリーミングの使用方法

インタラクティブなリアルタイムアプリケーションの場合、モデルからの応答をストリーミングできます。`invoke` 呼び出しで `streaming` オプションを `true` に設定し、結果のストリームを反復処理して、到着したチャンクを処理します。

```typescript
import { AIGNEHubChatModel, isAgentResponseDelta } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }
}

console.log(fullText); // "I am an AI assistant, ready to help you with any questions or tasks you have."
console.log(json); // { model: "openai/gpt-4o-mini", usage: { ... } }
```

### 設定

`AIGNEHubChatModel` コンストラクターは、次のオプションを受け入れます。

| Parameter      | Type     | Description                                                              |
| -------------- | -------- | ------------------------------------------------------------------------ |
| `url`          | `string` | AIGNE Hub インスタンスのエンドポイント URL。                             |
| `accessKey`    | `string` | AIGNE Hub で認証するためのシークレット API キー。               |
| `model`        | `string` | プロバイダーでプレフィックスが付けられたモデル識別子（例：`openai/gpt-4o`）。 |
| `modelOptions` | `object` | 任意。基盤となるモデルに渡す追加のパラメーター。         |

## 画像生成モデル

`AIGNEHubImageModel` クラスを使用すると、さまざまな AI モデルを使用して画像を生成できます。

### 基本的な使用方法

Hub の認証情報と目的の画像モデルで `AIGNEHubImageModel` をインスタンス化します。次に、プロンプトやその他のモデル固有のパラメーターを指定して `invoke` を呼び出します。

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

console.log(result);
/* Example Output:
  {
    images: [{ url: "https://..." }],
    usage: { inputTokens: 0, outputTokens: 0 },
    model: "openai/dall-e-3"
  }
*/
```

### サポートされているプロバイダーとパラメーター

AIGNE Hub は、それぞれが独自の機能とパラメーターを持つ複数のプロバイダーからの画像生成をサポートしています。

#### OpenAI DALL-E

-   **モデル**: `dall-e-2`, `dall-e-3`
-   **主要なパラメーター**: `prompt`, `size`, `n`, `quality`, `style`。
-   **リファレンス**: [OpenAI Images API ドキュメント](https://platform.openai.com/docs/guides/images)

```typescript
// DALL-E 3 の例
const result = await model.invoke({
  model: "openai/dall-e-3",
  prompt: "A photorealistic image of a cat wearing sunglasses",
  size: "1024x1024",
  quality: "hd",
  style: "vivid",
});
```

#### Google Gemini & Imagen

-   **モデル**: `imagen-4.0`, `gemini-pro-vision` など。
-   **主要なパラメーター**: `prompt`, `imageSize`, `aspectRatio`, `guidanceScale`, `negativePrompt`。
-   **注**: Gemini 画像モデルは現在、画像を `base64` 形式で返します。
-   **リファレンス**: [Google GenAI Models ドキュメント](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html)

```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset",
  n: 1,
  imageSize: "1024x1024",
  aspectRatio: "1:1",
});
```

#### Ideogram

-   **モデル**: `ideogram-v3`
-   **主要なパラメーター**: `prompt`, `resolution`, `aspectRatio`, `renderingSpeed`, `styleType`。
-   **リファレンス**: [Ideogram API ドキュメント](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)

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
  styleType: "cinematic",
});
```

### 設定

`AIGNEHubImageModel` コンストラクターは、次のオプションを受け入れます。

| Parameter      | Type     | Description                                                                 |
| -------------- | -------- | --------------------------------------------------------------------------- |
| `url`          | `string` | AIGNE Hub インスタンスのエンドポイント URL。                                |
| `accessKey`    | `string` | AIGNE Hub で認証するためのシークレット API キー。                  |
| `model`        | `string` | プロバイダーでプレフィックスが付けられたモデル識別子（例：`openai/dall-e-3`）。 |
| `modelOptions` | `object` | 任意。基盤となるモデルに渡す追加のパラメーター。            |