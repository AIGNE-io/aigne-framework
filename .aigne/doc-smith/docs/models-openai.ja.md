# OpenAI

`@aigne/openai` パッケージは、チャット補完用の強力な GPT シリーズや画像生成用の DALL-E など、OpenAI の一連のモデルとの直接的かつ堅牢な統合を提供します。このガイドでは、AIGNE フレームワーク内でこれらのモデルをインストール、設定、および利用するために必要な手順を詳述します。

他のモデルプロバイダーに関する情報については、メインの[モデル](./models.md)の概要を参照してください。

## 機能

OpenAI との統合は包括的に設計されており、以下の機能を提供します。

*   **直接的な API 統合**: 公式の OpenAI SDK を活用し、信頼性の高い通信を実現します。
*   **チャット補完**: `gpt-4o` や `gpt-4o-mini` といった OpenAI のチャット補完モデルを完全にサポートします。
*   **関数呼び出し**: OpenAI の関数呼び出しおよびツール使用機能をネイティブにサポートします。
*   **構造化出力**: モデルから JSON 形式の応答を要求し、解析する機能を提供します。
*   **画像生成**: DALL-E 2 および DALL-E 3 にアクセスし、テキストプロンプトから画像を生成します。
*   **ストリーミング応答**: リアルタイムのチャンク応答を処理し、よりインタラクティブなアプリケーションをサポートします。
*   **タイプセーフ**: すべてのモデルオプションと API 応答に対して完全な TypeScript 型定義を提供します。

## インストール

まず、`@aigne/openai` パッケージを `@aigne/core` フレームワークと一緒にインストールします。お使いのパッケージマネージャーに対応するコマンドを選択してください。

```bash icon=npm install @aigne/openai @aigne/core
npm install @aigne/openai @aigne/core
```

```bash icon=yarn add @aigne/openai @aigne/core
yarn add @aigne/openai @aigne/core
```

```bash icon=pnpm add @aigne/openai @aigne/core
pnpm add @aigne/openai @aigne/core
```

## チャットモデル (`OpenAIChatModel`)

`OpenAIChatModel` クラスは、GPT-4o のような OpenAI の言語モデルと対話するための主要なインターフェースです。

### 設定

モデルをインスタンス化するには、OpenAI API キーを提供する必要があります。これはコンストラクタで直接行うか、`OPENAI_API_KEY` 環境変数を設定することで行えます。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API キー。指定しない場合、システムは `OPENAI_API_KEY` 環境変数をチェックします。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API のオプションのベース URL。リクエストのプロキシや互換性のある代替エンドポイントの使用に便利です。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false">
    <x-field-desc markdown>チャット補完に使用する特定のモデル。例: `gpt-4o`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>モデルの動作を制御するための追加オプション。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="ランダム性を制御します。値が低いほど、モデルはより決定論的になります。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="Nucleus サンプリングパラメータ。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="既存の頻度に基づいて新しいトークンにペナルティを課します。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="これまでのテキストに出現したかどうかに基づいて新しいトークンにペナルティを課します。"></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="モデルが複数のツールを並行して呼び出せるかどうかを決定します。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>基盤となる OpenAI SDK クライアントに直接渡される高度なオプション。</x-field-desc>
  </x-field>
</x-field-group>

### 基本的な使用方法

次の例では、`OpenAIChatModel` インスタンスを作成し、簡単なユーザーメッセージで呼び出す方法を示します。

```typescript 基本的なチャット補完 icon=logos:typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // OPENAI_API_KEY 環境変数を使用することをお勧めします。
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

`invoke` メソッドは、モデルの応答と使用状況メトリクスを含むオブジェクトに解決されるプロミスを返します。

**応答例**
```json
{
  "text": "I am a large language model, trained by Google.",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 10,
    "outputTokens": 9
  }
}
```

### ストリーミング応答

リアルタイムのフィードバックが必要なアプリケーションでは、`invoke` メソッドで `streaming: true` オプションを設定することでストリーミングを有効にできます。これにより、利用可能になった応答チャンクを生成する非同期イテレータが返されます。

```typescript ストリーミングチャット応答 icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: "your-api-key",
  model: "gpt-4o",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story." }],
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

console.log("\n\n--- End of Story ---");
console.log("Full text:", fullText);
```

このアプローチにより、応答を段階的に処理できるため、チャットインターフェースやその他のインタラクティブなユースケースに最適です。

## 画像モデル (`OpenAIImageModel`)

`OpenAIImageModel` クラスは、DALL-E 2 や DALL-E 3 といった OpenAI の画像生成機能のインターフェースを提供します。

### 設定

画像モデルの設定はチャットモデルと似ており、API キーが必要で、モデルの選択が可能です。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API キー。指定しない場合、システムは `OPENAI_API_KEY` 環境変数をチェックします。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API のオプションのベース URL。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false">
    <x-field-desc markdown>使用する画像モデル。例: `dall-e-3`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>画像生成を制御するための追加オプション。利用可能なパラメータは選択されたモデルによって異なります。</x-field-desc>
    <x-field data-name="size" data-type="string" data-required="false" data-desc="生成する画像の希望の寸法 (例: '1024x1024')。"></x-field>
    <x-field data-name="quality" data-type="string" data-required="false" data-desc="画像の品質。「standard」または「hd」(DALL-E 3 のみ)。"></x-field>
    <x-field data-name="style" data-type="string" data-required="false" data-desc="生成される画像のスタイル。「vivid」または「natural」(DALL-E 3 のみ)。"></x-field>
    <x-field data-name="n" data-type="number" data-required="false" data-desc="生成する画像の数。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>基盤となる OpenAI SDK クライアントに直接渡される高度なオプション。</x-field-desc>
  </x-field>
</x-field-group>

### 基本的な使用方法

画像を生成するには、`OpenAIImageModel` のインスタンスを作成し、プロンプトで呼び出します。

```typescript 画像生成 icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";
import fs from "fs/promises";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
  modelOptions: {
    quality: "hd",
    style: "vivid",
  },
});

const result = await imageModel.invoke({
  prompt: "A futuristic cityscape with flying cars, synthwave style",
});

// 結果には画像データが含まれます。URL または base64 エンコードされた文字列のいずれかです。
const firstImage = result.images[0];

if (firstImage.type === "url") {
  console.log("Image URL:", firstImage.url);
} else if (firstImage.type === "file") {
  await fs.writeFile("cityscape.png", firstImage.data, "base64");
  console.log("Image saved as cityscape.png");
}
```

**応答例**
```json
{
  "images": [
    {
      "type": "url",
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
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

応答オブジェクトには、生成された画像の配列が含まれます。各画像は、API から要求された応答形式に応じて、ホストされている画像を指す URL または base64 エンコードされたファイルのいずれかになります。

## まとめ

このガイドでは、AIGNE フレームワーク内で OpenAI のチャットモデルと画像モデルをインストール、設定、使用するために必要な情報を提供しました。`@aigne/openai` パッケージを活用することで、OpenAI の高度な機能を Agent アプリケーションにシームレスに統合できます。

より高度な設定やトラブルシューティングについては、公式の [OpenAI API ドキュメント](https://platform.openai.com/docs/api-reference) を参照してください。利用可能な他のモデルについては、[モデル概要](./models-overview.md) をご覧ください。