# xAI

このガイドでは、AIGNE フレームワーク内で xAI の言語モデル、具体的には Grok を設定して使用するための手順を説明します。必要なパッケージのインストール、API キーの設定、モデルのインスタンス化、そして標準呼び出しとストリーミング呼び出しの両方の例について解説します。

`@aigne/xai` パッケージは xAI API への直接的なインターフェースとして機能し、開発者は AIGNE フレームワークが提供する標準化された `ChatModel` インターフェースを通じて、Grok の機能をアプリケーションに統合できます。

```d2
direction: down

Developer: {
  shape: c4-person
}

aigne-xai: {
  label: "@aigne/xai パッケージ"
  shape: rectangle
}

xAI-Platform: {
  label: "xAI プラットフォーム"
  shape: rectangle

  API-Key: {
    label: "API キー"
  }

  Grok-Models: {
    label: "Grok モデル"
  }
}

Developer -> xAI-Platform.API-Key: "1. API キーを取得"
Developer -> aigne-xai: "2. パッケージを設定\n(API キー、モデル選択)"
aigne-xai -> xAI-Platform.Grok-Models: "3. API リクエストを送信"
xAI-Platform.Grok-Models -> aigne-xai: "4. レスポンスを返す"
aigne-xai -> Developer: "5. 結果を渡す"

```

## インストール

まず、お好みのパッケージマネージャーを使用して `@aigne/xai` パッケージと AIGNE コアライブラリをインストールします。

<x-cards data-columns="3">
  <x-card data-title="npm" data-icon="logos:npm-icon">
    ```bash
    npm install @aigne/xai @aigne/core
    ```
  </x-card>
  <x-card data-title="yarn" data-icon="logos:yarn">
    ```bash
    yarn add @aigne/xai @aigne/core
    ```
  </x-card>
  <x-card data-title="pnpm" data-icon="logos:pnpm">
    ```bash
    pnpm add @aigne/xai @aigne/core
    ```
  </x-card>
</x-cards>

## 設定

`XAIChatModel` クラスは、xAI API とやり取りするための主要なインターフェースです。これを使用するには、xAI API キーで設定する必要があります。

API キーは 2 つの方法で提供できます：
1.  **コンストラクタで直接指定する**：`apiKey` プロパティ経由でキーを渡します。
2.  **環境変数**：`XAI_API_KEY` 環境変数を設定します。モデルはそれを自動的に検出して使用します。

### コンストラクタのオプション

`XAIChatModel` のインスタンスを作成する際に、以下のオプションを指定できます：

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>xAI API キーです。提供されない場合、システムは `XAI_API_KEY` 環境変数をフォールバックとして使用します。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="grok-2-latest">
    <x-field-desc markdown>チャット補完に使用する特定の xAI モデルです。デフォルトは `grok-2-latest` です。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-default="https://api.x.ai/v1">
    <x-field-desc markdown>xAI API のベース URL です。これは事前設定されており、通常は変更する必要はありません。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>`temperature` や `topP` など、xAI API に渡す追加のオプションです。</x-field-desc>
  </x-field>
</x-field-group>

## 基本的な使用方法

以下の例では、`XAIChatModel` をインスタンス化し、それを呼び出してレスポンスを取得する方法を示します。

```typescript Basic Invocation icon=logos:typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // API キーを直接指定するか、環境変数 XAI_API_KEY を使用します
  apiKey: "your-api-key", // 環境変数に設定されている場合はオプションです
  // モデルを指定します (デフォルトは 'grok-2-latest')
  model: "grok-2-latest",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```

### レスポンスの例

`invoke` メソッドは、モデルのレスポンスと使用状況のメタデータを含むオブジェクトを返します。

```json Response Object icon=mdi:code-json
{
  "text": "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!",
  "model": "grok-2-latest",
  "usage": {
    "inputTokens": 6,
    "outputTokens": 17
  }
}
```

## ストリーミングレスポンス

リアルタイムアプリケーション向けに、モデルからのレスポンスをストリーミングできます。`invoke` メソッドで `streaming: true` オプションを設定すると、データが利用可能になり次第、チャンクで受信できます。

```typescript Streaming Example icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  apiKey: "your-api-key",
  model: "grok-2-latest",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me about yourself" }],
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

console.log(fullText);
console.log(json);
```

### ストリーミング出力

ストリームを反復処理する際に、テキストの差分を蓄積して完全なメッセージを形成し、JSON 部分をマージして最終的なメタデータを取得できます。

```text Text Output icon=mdi:text-box
I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!
```

```json JSON Output icon=mdi:code-json
{
  "model": "grok-2-latest",
  "usage": {
    "inputTokens": 6,
    "outputTokens": 17
  }
}
```

これで `@aigne/xai` パッケージの使用に関するガイドは終わりです。利用可能な他のモデルに関する詳細については、[モデル概要](./models-overview.md) を参照してください。