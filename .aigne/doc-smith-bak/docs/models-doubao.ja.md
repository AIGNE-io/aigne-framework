# Doubao

`@aigne/doubao` パッケージは、AIGNE フレームワークと Doubao の強力な言語および画像生成モデルとのシームレスな統合を提供します。このガイドでは、AIGNE アプリケーション内で Doubao モデルを構成し、利用するための完全なリファレンスを提供します。

この統合により、開発者は AIGNE フレームワークの一貫した統一されたインターフェースを通じて、Doubao の高度な AI 機能を利用できます。

## インストール

まず、お好みのパッケージマネージャーを使用して必要なパッケージをインストールします。`@aigne/core` と Doubao 固有のパッケージの両方が必要です。

```bash
npm install @aigne/doubao @aigne/core
```

```bash
yarn add @aigne/doubao @aigne/core
```

```bash
pnpm add @aigne/doubao @aigne/core
```

## 設定

Doubao モデルを使用するには、API キーを提供する必要があります。キーは、優先順位の高い順に、次の 2 つの方法のいずれかで設定できます。

1.  **直接インスタンス化**: `apiKey` をモデルのコンストラクタに直接渡します。この方法は明示的であり、他の設定を上書きします。
2.  **環境変数**: `DOUBAO_API_KEY` 環境変数を設定します。コンストラクタでキーが提供されない場合、モデルはこの変数を自動的に使用します。

```typescript "Configuration Example" icon=logos:typescript
import { DoubaoChatModel } from "@aigne/doubao";

// 方法 1: 直接インスタンス化
const modelWithApiKey = new DoubaoChatModel({
  apiKey: "your-doubao-api-key",
});

// 方法 2: 環境変数
// .env ファイルまたはシェルで DOUBAO_API_KEY を設定します
// DOUBAO_API_KEY="your-doubao-api-key"
const modelFromEnv = new DoubaoChatModel();
```

Doubao API のベース URL は `https://ark.cn-beijing.volces.com/api/v3` に事前設定されていますが、必要に応じてコンストラクタに `baseURL` オプションを渡すことで上書きできます。

## チャットモデル

対話タスクのために、`DoubaoChatModel` は Doubao の言語モデルへのインターフェースを提供します。OpenAI 互換の API 構造を活用しており、使い慣れた開発体験を保証します。

### 基本的な使用方法

チャット補完を実行するには、`DoubaoChatModel` をインスタンス化し、`invoke` メソッドを使用します。

```typescript "Basic Chat Completion" icon=logos:typescript
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  apiKey: "your-doubao-api-key", // または環境変数を使用
  model: "doubao-seed-1-6-250615",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

**レスポンスの例**

```json
{
  "text": "こんにちは！私は Doubao の言語モデルを搭載した AI アシスタントです。",
  "model": "doubao-seed-1-6-250615",
  "usage": {
    "inputTokens": 7,
    "outputTokens": 12
  }
}
```

### ストリーミングレスポンス

リアルタイムアプリケーション向けに、モデルからのレスポンスをストリーミングできます。`invoke` 呼び出しで `streaming` オプションを `true` に設定し、結果のストリームを反復処理して、チャンクが到着するたびに処理します。

```typescript "Streaming Chat Response" icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  apiKey: "your-doubao-api-key",
  model: "doubao-seed-1-6-250615",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Introduce yourself" }],
  },
  { streaming: true }
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text); // テキストチャンクが到着するたびに表示
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n--- Final Data ---");
console.log(fullText);
console.log(json);
```

### チャットモデルのパラメータ

`DoubaoChatModel` コンストラクタは、以下のオプションを受け入れます。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Doubao API キー。指定しない場合、`DOUBAO_API_KEY` 環境変数が使用されます。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="doubao-seed-1-6-250615">
    <x-field-desc markdown>使用する特定のチャットモデル。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-default="https://ark.cn-beijing.volces.com/api/v3">
    <x-field-desc markdown>Doubao API エンドポイントのベース URL。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>`temperature`、`top_p` など、モデル API に渡される追加のオプション。これらは標準の OpenAI 互換パラメータです。</x-field-desc>
  </x-field>
</x-field-group>

## 画像モデル

`DoubaoImageModel` クラスは、Doubao の画像モデルと連携して画像生成を可能にします。

### 基本的な使用方法

`DoubaoImageModel` をインスタンス化し、プロンプトを指定して `invoke` メソッドを呼び出し、画像を生成します。

```typescript "Image Generation" icon=logos:typescript
import { DoubaoImageModel } from "@aigne/doubao";

async function generateImage() {
  const imageModel = new DoubaoImageModel({
    apiKey: "your-doubao-api-key", // または環境変数を使用
    model: "doubao-seedream-4-0-250828",
  });

  const result = await imageModel.invoke({
    prompt: "A photorealistic image of a cat programming on a laptop",
    modelOptions: {
      size: "1024x1024",
      watermark: false,
    },
  });

  console.log(result);
}

generateImage();
```

**レスポンスの例**

```json
{
  "images": [
    {
      "type": "file",
      "data": "...", // base64 エンコードされた画像データ
      "mimeType": "image/jpeg"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 1
  },
  "model": "doubao-seedream-4-0-250828"
}
```

### 画像モデルのパラメータ

`DoubaoImageModel` の `invoke` メソッドは、以下のプロパティを持つ入力オブジェクトを受け入れます。パラメータが利用可能かどうかはモデルによって異なる場合があることに注意してください。

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true">
    <x-field-desc markdown>希望する画像のテキスト記述。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="doubao-seedream-4-0-250828">
    <x-field-desc markdown>使用する画像モデルの識別子。</x-field-desc>
  </x-field>
  <x-field data-name="image" data-type="FileUnion" data-required="false">
    <x-field-desc markdown>画像から画像へのモデル (`doubao-seededit-3-0-i2i`) の場合、入力画像を提供します。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>モデル固有のパラメータを含むオブジェクト。</x-field-desc>
    <x-field data-name="size" data-type="string" data-required="false">
      <x-field-desc markdown>生成される画像の希望の寸法（例: `"1024x1024"`）。</x-field-desc>
    </x-field>
    <x-field data-name="seed" data-type="number" data-required="false">
      <x-field-desc markdown>再現可能な結果を得るためのシード値。`doubao-seedream-3-0-t2i` および `doubao-seededit-3-0-i2i` でサポートされています。</x-field-desc>
    </x-field>
    <x-field data-name="guidanceScale" data-type="number" data-required="false">
      <x-field-desc markdown>生成された画像がプロンプトにどれだけ忠実であるかを制御します。`doubao-seedream-3-0-t2i` および `doubao-seededit-3-0-i2i` でサポートされています。</x-field-desc>
    </x-field>
    <x-field data-name="stream" data-type="boolean" data-required="false" data-default="false">
      <x-field-desc markdown>`true` の場合、生成結果をストリーミングします。`doubao-seedream-4` モデルでサポートされています。</x-field-desc>
    </x-field>
    <x-field data-name="watermark" data-type="boolean" data-required="false" data-default="false">
      <x-field-desc markdown>`false` の場合、生成された画像のウォーターマークを無効にします。</x-field-desc>
    </x-field>
    <x-field data-name="sequentialImageGeneration" data-type="boolean" data-required="false">
      <x-field-desc markdown>順次画像生成を有効にします。`doubao-seedream-4` モデルでサポートされています。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### サポートされている画像モデル

以下の表は、サポートされている画像モデルとその主な特徴を示しています。

| モデルファミリー | サポートされているモデル | 主なユースケース |
| --------------------------- | ------------------------------- | --------------------- |
| `doubao-seedream-4` | `doubao-seedream-4-0-250828` | テキストから画像へ (T2I) |
| `doubao-seedream-3-0-t2i` | (特定のモデル名は異なる) | テキストから画像へ (T2I) |
| `doubao-seededit-3-0-i2i` | (特定のモデル名は異なる) | 画像から画像へ (I2I) |