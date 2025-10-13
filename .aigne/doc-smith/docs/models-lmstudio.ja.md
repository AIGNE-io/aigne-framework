このドキュメントでは、LM Studio経由でローカルにホストされたAIモデルと統合するためのAIGNEモデルアダプターである`@aigne/lmstudio`パッケージの使用方法について包括的にガイドします。

## 概要

`@aigne/lmstudio`モデルアダプターは、LM StudioのOpenAI互換APIとのシームレスな統合を提供し、AIGNEフレームワークを通じてローカルの大規模言語モデル（LLM）を実行できるようにします。LM Studioは、ローカルAIモデルをダウンロード、管理、実行するためのユーザーフレンドリーなインターフェースを提供し、OpenAI APIを模倣する組み込みサーバーを備えています。

このアダプターは`@aigne/openai`パッケージから継承しているため、チャット、ストリーミング、ツール/関数呼び出し、構造化出力などの操作において、使い慣れたOpenAI API構造をサポートしています。

## 前提条件

このパッケージを使用する前に、以下の手順を完了する必要があります。

1.  **LM Studioのインストール**: 公式ウェブサイトからLM Studioアプリケーションをダウンロードしてインストールします： [https://lmstudio.ai/](https://lmstudio.ai/)
2.  **モデルのダウンロード**: LM Studioのインターフェースを使用してローカルモデルを検索し、ダウンロードします。人気のある選択肢には、Llama 3.2、Mistral、Phi-3などがあります。
3.  **ローカルサーバーの起動**: LM Studioの「Local Server」タブに移動し、ダウンロードしたモデルを選択して「Start Server」をクリックします。これにより、アダプターが接続するローカルエンドポイント（通常は`http://localhost:1234/v1`）が公開されます。

## インストール

お好みのパッケージマネージャーを使用して、パッケージをプロジェクトにインストールします。

```bash
npm install @aigne/lmstudio
```

```bash
pnpm add @aigne/lmstudio
```

```bash
yarn add @aigne/lmstudio
```

## クイックスタート

次の例は、`LMStudioChatModel`のインスタンスを作成し、基本的なリクエストを行う方法を示しています。

```typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

// 1. 新しいLM Studioチャットモデルインスタンスを作成します
const model = new LMStudioChatModel({
  // baseURLは、LM Studioローカルサーバーのアドレスと一致する必要があります
  baseURL: "http://localhost:1234/v1",
  // モデル名は、LM Studioでロードされたものと完全に一致する必要があります
  model: "llama-3.2-3b-instruct",
  modelOptions: {
    temperature: 0.7,
    maxTokens: 2048,
  },
});

// 2. ユーザーメッセージでモデルを呼び出します
const response = await model.invoke({
  messages: [
    { role: "user", content: "What is the capital of France?" }
  ],
});

// 3. 応答テキストを出力します
console.log(response.text);
// 期待される出力: "The capital of France is Paris."
```

## 設定

`LMStudioChatModel`は、コンストラクタまたは環境変数を使用して設定できます。

### コンストラクタオプション

`LMStudioChatModel`は`OpenAIChatModel`を拡張しているため、標準のOpenAIオプションを受け入れます。

```typescript
const model = new LMStudioChatModel({
  // LM StudioサーバーのベースURL（デフォルトは http://localhost:1234/v1）
  baseURL: "http://localhost:1234/v1",
  
  // モデル識別子。LM Studioでロードされたものと一致する必要があります
  model: "llama-3.2-3b-instruct",

  // ローカルのLM StudioインスタンスにはAPIキーは不要です
  // デフォルトは "not-required" です
  // apiKey: "your-key-if-needed",

  // 標準モデルオプション
  modelOptions: {
    temperature: 0.7,     // ランダム性を制御します（0.0から2.0）
    maxTokens: 2048,      // 応答の最大トークン数
    topP: 0.9,            // 核サンプリング
    frequencyPenalty: 0,  // 新しいトークンをその頻度に基づいてペナルティを与えます
    presencePenalty: 0,   // 新しいトークンをその存在に基づいてペナルティを与えます
  },
});
```

### 環境変数

より柔軟な設定を行うために、環境変数を使用できます。

```bash
# LM StudioサーバーのURLを設定します（デフォルト: http://localhost:1234/v1）
LM_STUDIO_BASE_URL=http://localhost:1234/v1

# デフォルトでは、ローカルのLM StudioにAPIキーは不要です。
# サーバーで認証を設定している場合にのみ、これを設定してください。
# LM_STUDIO_API_KEY=your-key-if-needed
```

**注意:** LM Studioは通常、認証なしでローカルで実行されます。APIキーは、基礎となるOpenAIクライアントを満たすために、デフォルトでプレースホルダー値`"not-required"`に設定されています。

## 機能

このアダプターは、ストリーミング、ツール呼び出し、構造化JSON出力など、いくつかの高度な機能をサポートしています。

### ストリーミングのサポート

リアルタイムの応答を得るために、モデルからの出力をストリーミングできます。これは、応答が生成されている間に表示したいチャットボットのようなアプリケーションに便利です。

```typescript
const model = new LMStudioChatModel();

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story about a robot who discovers music." }],
  },
  { streaming: true }
);

for await (const chunk of stream) {
  if (chunk.type === "delta" && chunk.delta.text) {
    process.stdout.write(chunk.delta.text.text);
  }
}
```

### ツールと関数の呼び出し

このアダプターはOpenAI互換の関数呼び出しをサポートしており、モデルが外部ツールの呼び出しをリクエストできます。

```typescript
// ツール仕様を定義します
const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_weather",
      description: "Get the current weather information for a specified location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g., San Francisco, CA",
          },
        },
        required: ["location"],
      },
    },
  },
];

// ツールを使ってモデルを呼び出します
const response = await model.invoke({
  messages: [
    { role: "user", content: "What's the weather like in New York?" }
  ],
  tools,
});

// モデルがツール呼び出しをリクエストしたかどうかを確認します
if (response.toolCalls?.length) {
  console.log("Tool calls:", response.toolCalls);
  // 出力例:
  // Tool calls: [ { id: '...', type: 'function', function: { name: 'get_weather', arguments: '{"location":"New York"}' } } ]
}
```

### 構造化出力（JSON）

モデルに、特定のJSONスキーマに準拠した応答を生成するように指示できます。

```typescript
// 出力に必要なJSONスキーマを定義します
const responseFormat = {
  type: "json_schema" as const,
  json_schema: {
    name: "weather_response",
    schema: {
      type: "object",
      properties: {
        location: { type: "string" },
        temperature: { type: "number" },
        description: { type: "string" },
      },
      required: ["location", "temperature", "description"],
    },
  },
};

// 応答形式を指定してモデルを呼び出します
const response = await model.invoke({
  messages: [
    { role: "user", content: "Get the current weather for Paris in JSON format." }
  ],
  responseFormat,
});

// パースされたJSONオブジェクトは `response.json` フィールドで利用可能です
console.log(response.json);
```

## サポートされているモデル

LM Studioは、多種多様なオープンソースモデルをサポートしています。設定で使用されるモデル名は、LM Studioインターフェースに表示されるものと完全に一致する必要があります。人気のある選択肢は次のとおりです。

-   **Llama 3.2** (3B、8B、70Bバリアント)
-   **Llama 3.1** (8B、70B、405Bバリアント)
-   **Mistral** (7B、8x7Bバリアント)
-   **CodeLlama** (7B、13B、34Bバリアント)
-   **Qwen** (さまざまなサイズ)
-   **Phi-3** (mini、small、mediumバリアント)

## エラーハンドリング

ローカルサーバーと対話する際には、潜在的な接続エラーを処理することが重要です。一般的な問題は、LM Studioサーバーがアクティブでないことです。

```typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel();

try {
  const response = await model.invoke({
    messages: [{ role: "user", content: "Hello!" }],
  });
  console.log(response.text);
} catch (error) {
  // 接続拒否エラーを具体的にチェックします
  if (error.code === "ECONNREFUSED") {
    console.error("Connection failed: The LM Studio server is not running. Please start the local server.");
  } else {
    console.error("An unexpected error occurred:", error.message);
  }
}
```

## トラブルシューティング

一般的な問題とその解決策は次のとおりです。

1.  **接続拒否**: このエラー（`ECONNREFUSED`）は、LM Studioローカルサーバーが実行されていない場合に発生します。LM Studioアプリケーションの「Local Server」タブからサーバーを起動したことを確認してください。
2.  **モデルが見つかりません**: 「model not found」エラーが表示された場合は、設定の`model`名がLM Studioにロードされたモデルファイル名と完全に一致していることを確認してください。
3.  **メモリ不足**: 大規模なモデルは、かなりのシステムリソースを消費する可能性があります。クラッシュやメモリの問題が発生した場合は、より小さなモデル（例：3Bまたは8Bパラメータのバリアント）を使用するか、コンテキスト長（`maxTokens`）を減らしてみてください。
4.  **応答が遅い**: 応答速度は、ハードウェア（CPU/GPU）とモデルサイズに依存します。より高速な推論のためには、ハードウェアがサポートしており、LM Studioで正しく設定されている場合は、GPUアクセラレーションの使用を検討してください。