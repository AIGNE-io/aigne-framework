# OpenAI

`@aigne/openai` パッケージは、OpenAI のモデルスイートとのシームレスな統合を提供し、開発者が AIGNE フレームワーク内で直接、チャット補完のための GPT、画像生成のための DALL-E、ビデオ作成のための Sora などのサービスを活用できるようにします。このドキュメントでは、これらのモデルのインストール、設定、および使用に関する包括的なガイドを提供します。

利用可能なモデルプロバイダーの概要については、[モデル](./models.md) のセクションを参照してください。

## 特徴

OpenAI 統合は堅牢で開発者に優しく設計されており、さまざまな機能を提供します。

*   **包括的なモデルサポート**: OpenAI のチャット、画像、およびビデオ生成 API との完全な統合。
*   **公式 SDK**: 最大限の信頼性と互換性を確保するために、公式の OpenAI SDK 上に構築されています。
*   **高度な機能**: 関数呼び出し、ストリーミング応答、構造化 JSON 出力をサポートします。
*   **タイプセーフ**: すべてのモデル設定と API 応答に対して完全な TypeScript 型付けを提供し、コードの品質とオートコンプリートを保証します。
*   **一貫したインターフェース**: AIGNE フレームワークのモデルインターフェースに準拠し、異なるプロバイダー間で統一された実装を実現します。
*   **豊富な設定**: 特定のアプリケーションニーズに合わせてモデルの動作を微調整するための詳細なオプションを提供します。

## インストール

OpenAI モデルをプロジェクトに統合するには、`@aigne/core` フレームワークと一緒に `@aigne/openai` パッケージをインストールします。お使いのパッケージマネージャーに適したコマンドを使用してください。

```bash npm
npm install @aigne/openai @aigne/core
```

```bash yarn
yarn add @aigne/openai @aigne/core
```

```bash pnpm
pnpm add @aigne/openai @aigne/core
```

## チャットモデル (`OpenAIChatModel`)

`OpenAIChatModel` クラスは、GPT-4o や GPT-4o-mini などの OpenAI のテキストベースの言語モデルと対話するための主要なインターフェースとして機能します。

### 設定

`OpenAIChatModel` のインスタンスを作成する際には、OpenAI API キーを提供する必要があります。これはコンストラクタで直接渡すか、`OPENAI_API_KEY` という名前の環境変数として設定することができます。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API キー。省略した場合、システムは `OPENAI_API_KEY` 環境変数を探します。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API のオプションのベース URL。プロキシや代替エンドポイントを介して接続する場合に便利です。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false">
    <x-field-desc markdown>チャット補完に使用されるモデルの識別子（例：「gpt-4o」）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>生成プロセスを制御するためのパラメータセット。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="出力のランダム性を制御します。値が低いほど、より決定論的な結果が生成されます。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="temperature サンプリングの代替であり、nucleus サンプリングとして知られています。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="トークンの繰り返しを減らす可能性を高めます。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="トピックの繰り返しを減らす可能性を高めます。"></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="モデルが複数の関数呼び出しを同時に実行できるようにします。"></x-field>
    <x-field data-name="reasoningEffort" data-type="string | number" data-required="false" data-desc="推論モデル（o1/o3）の場合、推論の労力（「minimal」、「low」、「medium」、「high」、またはトークン数）を設定します。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>高度なカスタマイズのために、基盤となる OpenAI SDK クライアントに直接渡される追加オプション。</x-field-desc>
  </x-field>
</x-field-group>

### 基本的な使用法

以下の例は、`OpenAIChatModel` をインスタンス化し、`invoke` メソッドを使用して応答を取得する方法を示しています。

```typescript 基本的なチャット補完 icon=logos:typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // API キーには環境変数の使用を推奨します。
  apiKey: "your-api-key", 
  model: "gpt-4o",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

**応答例**

```json
{
  "text": "Hello! How can I assist you today?",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 10,
    "outputTokens": 9
  }
}
```

### ストリーミング応答

リアルタイムアプリケーションの場合、`invoke` メソッドに `{ streaming: true }` を渡すことでストリーミングを有効にできます。これにより、生成された応答チャンクを生成する非同期イテレータが返されます。

```typescript ストリーミングチャット応答 icon=logos:typescript
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
    if (text) {
      fullText += text;
      process.stdout.write(text);
    }
  }
}

console.log("\n--- Response Complete ---");
```

## 画像モデル (`OpenAIImageModel`)

`OpenAIImageModel` クラスは、DALL-E 2、DALL-E 3、gpt-image-1 といった OpenAI の画像生成および編集モデル用のインターフェースを提供します。

### 設定

画像モデルはチャットモデルと同様に設定され、API キーが必要で、モデル固有のオプションを指定できます。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API キー。提供されない場合は、デフォルトで `OPENAI_API_KEY` 環境変数が使用されます。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API のオプションのベース URL。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false">
    <x-field-desc markdown>使用する画像モデル（例：「dall-e-3」、「gpt-image-1」）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>画像生成プロセスを制御するパラメータ。利用可能なオプションはモデルによって異なります。</x-field-desc>
    <x-field data-name="size" data-type="string" data-required="false" data-desc="生成される画像の寸法（例：「1024x1024」）。"></x-field>
    <x-field data-name="quality" data-type="string" data-required="false" data-desc="画像の品質。「standard」または「hd」（DALL-E 3 のみ）。"></x-field>
    <x-field data-name="style" data-type="string" data-required="false" data-desc="芸術的なスタイル。「vivid」または「natural」（DALL-E 3 のみ）。"></x-field>
    <x-field data-name="n" data-type="number" data-required="false" data-desc="生成する画像の数。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>基盤となる OpenAI SDK クライアントに直接渡される高度なオプション。</x-field-desc>
  </x-field>
</x-field-group>

### 画像生成

画像を生成するには、`OpenAIImageModel` のインスタンスを作成し、テキストプロンプトで呼び出します。

```typescript 画像生成 icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
  modelOptions: {
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
  },
});

const result = await imageModel.invoke({
  prompt: "A futuristic city at sunset with flying cars",
});

console.log(result);
```

**応答例**

```json
{
  "images": [
    {
      "type": "url",
      "url": "https://...",
      "mimeType": "image/png"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "dall-e-3"
}
```

### 画像編集

画像編集は `gpt-image-1` のような特定のモデルでサポートされています。画像を編集するには、プロンプトと参照画像の両方を提供します。

```typescript 画像編集 icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "gpt-image-1",
});

const result = await imageModel.invoke({
  prompt: "Add a rainbow to the sky",
  image: [
    {
      type: "url",
      url: "https://example.com/original-image.png",
    },
  ],
});

console.log(result.images); // 編集された画像の配列
```

## ビデオモデル (`OpenAIVideoModel`)

`OpenAIVideoModel` クラスは、OpenAI の Sora モデルを使用したビデオ生成を可能にします。

### 設定

ビデオモデルには API キーが必要で、モデル、解像度、および持続時間を指定できます。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API キー。提供されない場合は、デフォルトで `OPENAI_API_KEY` 環境変数が使用されます。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="sora-2" data-required="false">
    <x-field-desc markdown>使用するビデオモデル。「sora-2」（標準）または「sora-2-pro」（高品質）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>ビデオ生成プロセスを制御するパラメータ。</x-field-desc>
    <x-field data-name="size" data-type="string" data-default="1280x720" data-required="false" data-desc="ビデオの解像度（例：水平の場合は「1280x720」、垂直の場合は「720x1280」）。"></x-field>
    <x-field data-name="seconds" data-type="string" data-default="4" data-required="false" data-desc="ビデオの持続時間（秒）。許容される値は「4」、「8」、または「12」です。"></x-field>
  </x-field>
</x-field-group>

### ビデオ生成

以下の例は、テキストプロンプトから短いビデオを生成する方法を示しています。

```typescript ビデオ生成 icon=logos:typescript
import { OpenAIVideoModel } from "@aigne/openai";

const videoModel = new OpenAIVideoModel({
  apiKey: "your-api-key",
  model: "sora-2",
  modelOptions: {
    size: "1280x720",
    seconds: "4",
  },
});

const result = await videoModel.invoke({
  prompt: "A serene lake with mountains in the background, gentle waves rippling",
});

console.log(result);
```

**応答例**

```json
{
  "videos": [
    {
      "type": "file",
      "data": "base64-encoded-video-data...",
      "mimeType": "video/mp4",
      "filename": "video-id.mp4"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "sora-2",
  "seconds": 4
}
```

### 画像からビデオへの生成

静止画をアニメーション化してビデオを生成することもできます。

```typescript 画像からビデオへ icon=logos:typescript
import { OpenAIVideoModel } from "@aigne/openai";

const videoModel = new OpenAIVideoModel({
  apiKey: "your-api-key",
  model: "sora-2",
});

const result = await videoModel.invoke({
  prompt: "Animate this image with gentle movement",
  image: {
    type: "url",
    url: "https://example.com/input-image.png",
  },
  size: "1280x720",
  seconds: "8",
});

console.log(result.videos);
```

## まとめ

このガイドでは、OpenAI のチャット、画像、およびビデオモデルを AIGNE アプリケーションに統合するための基本を説明しました。`@aigne/openai` パッケージを使用することで、これらの高度な AI の能力を簡単に活用できます。

詳細については、公式の [OpenAI API ドキュメント](https://platform.openai.com/docs/api-reference) を参照してください。他のサポートされているモデルプロバイダーについては、[モデル概要](./models-overview.md) をご覧ください。