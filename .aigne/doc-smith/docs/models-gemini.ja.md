# @aigne/gemini

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/gemini)](https://www.npmjs.com/package/@aigne/gemini)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/gemini)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

[AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) 内で Google の Gemini AI モデルと統合するための AIGNE Gemini SDK。

## はじめに

`@aigne/gemini` は、AIGNE Framework と Google の Gemini 言語モデルおよび API とのシームレスな統合を提供します。このパッケージにより、開発者は AIGNE アプリケーションで Gemini の高度な AI 機能を簡単に活用でき、Google の最先端のマルチモーダルモデルを利用しながら、フレームワーク全体で一貫したインターフェースを提供します。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-gemini-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-gemini.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-gemini.png" alt="AIGNE Arch" />
</picture>

## アーキテクチャ

以下の図は、`@aigne/gemini` パッケージが AIGNE フレームワーク内でどのように機能し、Google Gemini API と対話するかを示しています。

```d2
direction: down

User-Application: {
  label: "あなたの AIGNE アプリケーション"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE フレームワーク"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  shape: rectangle
  grid-columns: 2
  grid-gap: 100

  AIGNE-Core: {
    label: "@aigne/core"
    shape: rectangle
    
    Model-Interface: {
      label: "モデルインターフェース\n(invoke, stream)"
      shape: rectangle
      style: {
        stroke-dash: 2
      }
    }
  }

  AIGNE-Gemini: {
    label: "@aigne/gemini"
    shape: rectangle
    
    GeminiChatModel: {
      label: "GeminiChatModel"
    }
    
    GeminiImageModel: {
      label: "GeminiImageModel"
    }
  }
}

Google-Cloud: {
  label: "Google Cloud"
  shape: rectangle

  Google-Gemini-API: {
    label: "Google Gemini API"
    shape: cylinder
    grid-columns: 2
    
    Gemini-Models: {
      label: "Gemini モデル\n(例: gemini-1.5-pro)"
    }
    
    Imagen-Models: {
      label: "Imagen モデル\n(例: imagen-4.0)"
    }
  }
}

User-Application -> AIGNE-Framework.AIGNE-Core: "コアを使用"
User-Application -> AIGNE-Framework.AIGNE-Gemini: "インポート & インスタンス化"

AIGNE-Framework.AIGNE-Core.Model-Interface -> AIGNE-Framework.AIGNE-Gemini: {
  label: "実装"
  style: {
    stroke-dash: 4
  }
}

AIGNE-Framework.AIGNE-Gemini.GeminiChatModel -> Google-Cloud.Google-Gemini-API.Gemini-Models: "API 呼び出し"
AIGNE-Framework.AIGNE-Gemini.GeminiImageModel -> Google-Cloud.Google-Gemini-API.Gemini-Models: "API 呼び出し"
AIGNE-Framework.AIGNE-Gemini.GeminiImageModel -> Google-Cloud.Google-Gemini-API.Imagen-Models: "API 呼び出し"

```

## 機能

*   **Google Gemini API との統合**: Google の Gemini API サービスへの直接接続
*   **チャット補完**: 利用可能なすべてのモデルでの Gemini のチャット補完 API のサポート
*   **画像生成**: Imagen と Gemini の両方の画像生成モデルのサポート
*   **マルチモーダル対応**: テキストと画像の両方の入力を処理するための組み込みサポート
*   **関数呼び出し**: 関数呼び出し機能のサポート
*   **ストリーミング応答**: より応答性の高いアプリケーションのためのストリーミング応答のサポート
*   **タイプセーフ**: すべての API とモデルに対する包括的な TypeScript 型定義
*   **一貫したインターフェース**: AIGNE Framework のモデルインターフェースとの互換性
*   **エラーハンドリング**: 堅牢なエラーハンドリングとリトライメカニズム
*   **完全な設定オプション**: 動作を微調整するための広範な設定オプション

## インストール

### npm を使用

```bash
npm install @aigne/gemini @aigne/core
```

### yarn を使用

```bash
yarn add @aigne/gemini @aigne/core
```

### pnpm を使用

```bash
pnpm add @aigne/gemini @aigne/core
```

## はじめに

### 環境変数

SDK を使用する前に、Gemini API キーを設定する必要があります。SDK は次の環境変数からキーを自動的に検出します:

```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

または、モデルをインスタンス化する際に `apiKey` を直接渡すこともできます。

### チャットモデルの使用方法

`GeminiChatModel` は、Gemini のチャット補完モデルと対話するためのインターフェースを提供します。

```typescript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // API キーを直接指定するか、環境変数 GOOGLE_API_KEY を使用します
  apiKey: "your-api-key", // 環境変数に設定されている場合はオプションです
  // Gemini モデルのバージョンを指定します (指定しない場合は 'gemini-1.5-pro' がデフォルトです)
  model: "gemini-1.5-flash",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
/* Output:
  {
    text: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
    model: "gemini-1.5-flash"
  }
*/
```

### 画像生成モデルの使用方法

`GeminiImageModel` を使用すると、Imagen または Gemini モデルを使用して画像を生成できます。

```typescript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key", // 環境変数に設定されている場合はオプションです
  model: "imagen-4.0-generate-001", // デフォルトの Imagen モデル
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
/* Output:
  {
    images: [
      {
        base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
      }
    ],
    usage: {
      inputTokens: 0,
      outputTokens: 0
    },
    model: "imagen-4.0-generate-001"
  }
*/
```

## 高度な使用方法

### ストリーミング応答

リアルタイムアプリケーションでは、チャットモデルからの応答をストリーミングできます。これにより、生成中の出力を処理できます。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  apiKey: "your-api-key",
  model: "gemini-1.5-flash",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hi there, introduce yourself" }],
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

console.log(fullText); // 出力: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"
console.log(json); // { model: "gemini-1.5-flash" }
```

### 画像生成パラメータ

`GeminiImageModel` は、基盤となるモデルファミリー (Imagen または Gemini) に応じて異なる幅広いパラメータをサポートしています。

#### Imagen モデル (例: `imagen-4.0-generate-001`)

-   **`prompt`** (string): 生成したい画像のテキスト説明。
-   **`n`** (number): 生成する画像の数 (デフォルトは 1)。
-   **`seed`** (number): 再現可能な生成のためのランダムシード。
-   **`safetyFilterLevel`** (string): コンテンツモデレーションのためのセーフティフィルターレベル。
-   **`personGeneration`** (string): 人物生成設定。
-   **`outputMimeType`** (string): 出力画像形式 (例: "image/png", "image/jpeg")。
-   **`outputGcsUri`** (string): 出力用の Google Cloud Storage URI。
-   **`outputCompressionQuality`** (number): JPEG 圧縮品質 (1-100)。
-   **`negativePrompt`** (string): 画像から除外するものの説明。
-   **`language`** (string): プロンプトの言語。
-   **`includeSafetyAttributes`** (boolean): 応答にセーフティ属性を含める。
-   **`includeRaiReason`** (boolean): 応答に RAI の理由を含める。
-   **`imageSize`** (string): 生成される画像のサイズ。
-   **`guidanceScale`** (number): 生成のガイダンススケール。
-   **`aspectRatio`** (string): 画像のアスペクト比。
-   **`addWatermark`** (boolean): 生成された画像に透かしを追加する。

#### Gemini モデル (例: `gemini-1.5-pro`)

-   **`prompt`** (string): 生成したい画像のテキスト説明。
-   **`n`** (number): 生成する画像の数 (デフォルトは 1)。
-   **`temperature`** (number): 生成のランダム性を制御します (0.0 から 1.0)。
-   **`maxOutputTokens`** (number): 応答の最大トークン数。
-   **`topP`** (number): Nucleus サンプリングパラメータ。
-   **`topK`** (number): Top-k サンプリングパラメータ。
-   **`safetySettings`** (array): コンテンツ生成のセーフティ設定。
-   **`seed`** (number): 再現可能な生成のためのランダムシード。
-   **`stopSequences`** (array): 生成を停止させるシーケンス。
-   **`systemInstruction`** (string): システムレベルの指示。

#### 高度な画像生成の例

この例では、Imagen モデルでいくつかの高度なパラメータを使用する方法を示します。

```typescript
const result = await model.invoke({
  prompt: "A futuristic cityscape with neon lights and flying cars",
  model: "imagen-4.0-generate-001",
  n: 2,
  imageSize: "1024x1024",
  aspectRatio: "1:1",
  guidanceScale: 7.5,
  negativePrompt: "blurry, low quality, distorted",
  seed: 12345,
  includeSafetyAttributes: true,
  outputMimeType: "image/png"
});
```

### デフォルトのモデルオプション

モデルレベルでデフォルトのオプションを設定でき、これらは後続のすべての `invoke` 呼び出しに適用されます。

```typescript
const model = new GeminiImageModel({
  apiKey: "your-api-key",
  model: "imagen-4.0-generate-001",
  modelOptions: {
    safetyFilterLevel: "BLOCK_MEDIUM_AND_ABOVE",
    includeSafetyAttributes: true,
    outputMimeType: "image/png"
  }
});
```

## API リファレンス

利用可能なすべてのパラメータと高度な機能の完全かつ詳細なリストについては、公式の Google GenAI ドキュメントを参照してください:

-   **Imagen モデル**: [Google GenAI Models.generateImages()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generateimages)
-   **Gemini モデル**: [Google GenAI Models.generateContent()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generatecontent)

## ライセンス

この SDK は [Elastic-2.0 License](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) の下でライセンスされています。