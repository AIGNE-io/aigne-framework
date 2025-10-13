このドキュメントでは、Doubao AIモデルをAIGNEフレームワークに統合する`@aigne/doubao` SDKの使用方法について包括的に解説します。SDKをインストール、設定し、アプリケーションでDoubaoのチャットおよび画像生成機能を活用する方法を学びます。

SDKの役割を説明するために、以下にアーキテクチャの概要を示します。

```d2
direction: down

User-Application: {
  label: "あなたのアプリケーション"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE フレームワーク"
  shape: rectangle

  aigne-doubao-SDK: {
    label: "@aigne/doubao SDK"
    shape: rectangle
  }
}

Doubao-AI-Service: {
  label: "Doubao AI サービス"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-dash: 4
  }

  Chat-Models: {
    label: "チャットモデル"
  }
  Image-Models: {
    label: "画像生成モデル"
  }
}

User-Application -> AIGNE-Framework.aigne-doubao-SDK: "SDKを使用"
AIGNE-Framework.aigne-doubao-SDK -> Doubao-AI-Service: "APIコール"
```

## 1. 概要

`@aigne/doubao`は、AIGNEフレームワークとDoubaoの強力な言語モデルとのシームレスな統合を提供します。このパッケージにより、開発者はAIGNEアプリケーションでDoubaoのAI機能を簡単に活用でき、Doubaoの高度な機能を利用しながら一貫したインターフェースを提供します。

### 機能

*   **Doubao APIへの直接統合**: DoubaoのAPIサービスに直接接続します。
*   **チャット補完**: 利用可能なすべてのDoubaoチャットモデルをサポートします。
*   **関数呼び出し**: 関数呼び出しの組み込みサポートが含まれています。
*   **ストリーミング応答**: より応答性の高いアプリケーションのためのストリーミングを可能にします。
*   **タイプセーフ**: すべてのAPIに対して包括的なTypeScript型定義を提供します。
*   **一貫したインターフェース**: AIGNEフレームワークのモデルインターフェースと連携し、相互運用性を確保します。
*   **堅牢なエラーハンドリング**: 組み込みのエラーハンドリングとリトライメカニズムを備えています。
*   **完全な設定オプション**: モデルの動作を微調整するための豊富なオプションを提供します。

## 2. インストール

始めるには、お好みのパッケージマネージャーを使用して`@aigne/doubao`と`@aigne/core`パッケージをインストールします。

### npmの使用

```bash
npm install @aigne/doubao @aigne/core
```

### yarnの使用

```bash
yarn add @aigne/doubao @aigne/core
```

### pnpmの使用

```bash
pnpm add @aigne/doubao @aigne/core
```

## 3. 設定

SDKを使用する前に、Doubao APIキーを設定する必要があります。キーはモデルのコンストラクタで直接指定するか、`DOUBAO_API_KEY`環境変数を通じて指定できます。

```typescript
import { DoubaoChatModel } from "@aigne/doubao";

// オプション1: APIキーを直接指定
const model = new DoubaoChatModel({
  apiKey: "your-api-key",
});

// オプション2: 環境変数を使用 (DOUBAO_API_KEY)
// 環境に変数が設定されていることを確認してください
// const model = new DoubaoChatModel();
```

## 4. チャットモデルの使用方法

`DoubaoChatModel`クラスは、Doubaoのチャット補完モデルと対話するためのインターフェースを提供します。

### 基本的な使用方法

以下は、チャットモデルを呼び出して応答を取得する簡単な例です。

```typescript
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  // APIキーを直接指定するか、環境変数 DOUBAO_API_KEY を使用します
  apiKey: "your-api-key", // 環境変数に設定されている場合はオプション
  // モデルバージョンを指定（デフォルトは 'doubao-seed-1-6-250615'）
  model: "doubao-seed-1-6-250615",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
/* 出力:
  {
    text: "Hello! I'm an AI assistant powered by Doubao's language model.",
    model: "doubao-seed-1-6-250615",
    usage: {
      inputTokens: 7,
      outputTokens: 12
    }
  }
*/
```

### ストリーミング応答

リアルタイムアプリケーション向けに、モデルからの応答をストリーミングできます。これにより、出力が利用可能になった時点で処理できます。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  apiKey: "your-api-key",
  model: "doubao-seed-1-6-250615",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Introduce yourself" }],
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

console.log(fullText); // Output: "Hello! I'm an AI assistant powered by Doubao's language model."
console.log(json); // { model: "doubao-seed-1-6-250615", usage: { inputTokens: 7, outputTokens: 12 } }
```

## 5. 画像モデルの使用方法

`DoubaoImageModel`クラスを使用すると、`doubao-seedream-4-0-250828`などのDoubaoの画像作成モデルを使用して画像を生成できます。

### 基本的な画像生成

以下の例は、テキストプロンプトから画像を生成する方法を示しています。

```typescript
import { DoubaoImageModel } from "@aigne/doubao";

async function generateImage() {
  const imageModel = new DoubaoImageModel({
    apiKey: "your-api-key", // または環境変数 DOUBAO_API_KEY を使用
    model: "doubao-seedream-4-0-250828", // 画像モデルを指定
  });

  const output = await imageModel.invoke({
    prompt: "A futuristic cityscape at sunset",
  });

  // 出力には生成された画像データ（URLまたはbase64）が含まれます
  console.log(output.images);
}

generateImage();
```

`output.images`配列には、生成された各画像について、`url`または`data`プロパティ（base64エンコード）を持つオブジェクトが含まれます。

## 6. ライセンス

`@aigne/doubao` SDKは、Elastic-2.0 Licenseの下でリリースされています。