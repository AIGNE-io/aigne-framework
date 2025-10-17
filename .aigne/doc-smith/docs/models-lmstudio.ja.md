# LMStudio

`@aigne/lmstudio` パッケージは、[LM Studio](https://lmstudio.ai/) を介してローカルでホストされる大規模言語モデル (LLM) と AIGNE を統合するためのモデルアダプターを提供します。これにより、開発者は AIGNE フレームワーク内でローカルモデルの能力を活用でき、プライバシー、コントロール、コスト効率が向上します。

このガイドでは、LM Studio に必要な設定について説明し、`LMStudioChatModel` を使用してローカルモデルと対話する方法を示します。他のローカルモデルプロバイダーに関する情報については、[Ollama](./models-ollama.md) のドキュメントを参照してください。

## 前提条件

このパッケージを使用する前に、以下の手順を完了する必要があります。

1.  **LM Studio のインストール**: 公式ウェブサイト [https://lmstudio.ai/](https://lmstudio.ai/) から LM Studio アプリケーションをダウンロードしてインストールします。
2.  **モデルのダウンロード**: LM Studio のインターフェースを使用してモデルを検索し、ダウンロードします。Llama 3.2、Mistral、Phi-3 の派生モデルなどが人気です。
3.  **ローカルサーバーの起動**: LM Studio の「Local Server」タブ (サーバーアイコン) に移動し、ドロップダウンからダウンロードしたモデルを選択して、「Start Server」をクリックします。これにより、OpenAI 互換の API エンドポイントが公開されます。通常は `http://localhost:1234/v1` です。

## インストール

LMStudio パッケージをプロジェクトに追加するには、ターミナルで次のいずれかのコマンドを実行します。

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

LM Studio サーバーが実行されたら、`LMStudioChatModel` を使用してローカルモデルと対話できます。次の例は、モデルをインスタンス化し、簡単なリクエストを送信する方法を示しています。

```typescript Quick Start icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

// 1. モデルをインスタンス化します
// モデル名が LM Studio にロードされたものと一致することを確認してください。
const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

// 2. モデルを呼び出します
async function main() {
  try {
    const response = await model.invoke({
      messages: [
        { role: "user", content: "What is the capital of France?" }
      ],
    });

    console.log(response.text);
  } catch (error) {
    console.error("Error invoking model:", error);
  }
}

main();
```

リクエストが成功した場合、出力は次のようになります。

```text
フランスの首都はパリです。
```

## 設定

`LMStudioChatModel` は、コンストラクターまたは環境変数を通じて設定できます。

### コンストラクターオプション

`LMStudioChatModel` は標準の `OpenAIChatModel` を拡張し、以下のオプションを受け入れます。

<x-field-group>
  <x-field data-name="model" data-type="string" data-required="false">
    <x-field-desc markdown>使用するモデルの名前。LM Studio サーバーにロードされたモデルファイルと一致する必要があります。デフォルトは `llama-3.2-3b-instruct` です。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>LM Studio サーバーのベース URL。デフォルトは `http://localhost:1234/v1` です。</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>API キー。LM Studio サーバーで認証を設定している場合に必要です。デフォルトでは、LM Studio は認証なしで実行され、キーはプレースホルダー値 `not-required` に設定されます。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>モデル生成を制御するための追加オプション。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="ランダム性を制御します。低い値 (例: 0.2) は出力をより決定論的にします。デフォルトは 0.7 です。"></x-field>
    <x-field data-name="maxTokens" data-type="number" data-required="false" data-desc="レスポンスで生成するトークンの最大数。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="Nucleus サンプリングパラメーター。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="既存の頻度に基づいて新しいトークンにペナルティを課します。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="これまでのテキストに表示されるかどうかに基づいて新しいトークンにペナルティを課します。"></x-field>
  </x-field>
</x-field-group>

以下はカスタム設定の例です。

```typescript Configuration Example icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  baseURL: "http://localhost:1234/v1",
  model: "Mistral-7B-Instruct-v0.2-GGUF",
  modelOptions: {
    temperature: 0.8,
    maxTokens: 4096,
  },
});
```

### 環境変数

環境変数を設定してモデルを設定することもできます。両方が提供されている場合、コンストラクターオプションが優先されます。

-   `LM_STUDIO_BASE_URL`: サーバーのベース URL を設定します。デフォルトは `http://localhost:1234/v1` です。
-   `LM_STUDIO_API_KEY`: API キーを設定します。サーバーが認証を必要とする場合にのみ必要です。

```bash .env
LM_STUDIO_BASE_URL=http://localhost:1234/v1
# LM_STUDIO_API_KEY=必要に応じてキーを入力
```

## 機能

`LMStudioChatModel` は、ストリーミング、ツール呼び出し、構造化出力など、いくつかの高度な機能をサポートしています。

### ストリーミング

リアルタイムアプリケーション向けに、生成中のレスポンスをストリーミングできます。`invoke` メソッドで `streaming: true` オプションを設定します。

```typescript Streaming Example icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

async function streamStory() {
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
}

streamStory();
```

### ツール呼び出し

多くのローカルモデルは、OpenAI 互換のツール呼び出し (関数呼び出しとしても知られています) をサポートしています。モデルにツールのリストを提供すると、モデルはそれらを呼び出すために必要な引数を生成します。

```typescript Tool Calling Example icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_weather",
      description: "Get the current weather for a specified location.",
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

async function checkWeather() {
  const response = await model.invoke({
    messages: [
      { role: "user", content: "What's the weather like in New York?" }
    ],
    tools,
  });

  if (response.toolCalls?.length) {
    console.log("Tool calls:", JSON.stringify(response.toolCalls, null, 2));
  }
}

checkWeather();
```

### 構造化出力

モデルの出力が特定の JSON スキーマに準拠するように、`responseFormat` を定義できます。これは、信頼性の高い、機械可読なデータを必要とするタスクに役立ちます。

```typescript Structured Output Example icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

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

async function getWeatherAsJson() {
  const response = await model.invoke({
    messages: [
      { role: "user", content: "What is the weather in Paris? Respond in the requested JSON format." }
    ],
    responseFormat,
  });

  console.log(response.json);
}

getWeatherAsJson();
```

## サポートされているモデル

LM Studio は、さまざまな GGUF 形式のモデルをサポートしています。正確なモデル名は、LM Studio のユーザーインターフェースに表示されるものと一致する必要があります。互換性のある人気のモデルには、次のものがあります。

| モデルファミリー | バリアント |
| :----------- | :------------------------------------- |
| **Llama 3.2**  | 3B, 8B, 70B Instruct                   |
| **Llama 3.1**  | 8B, 70B, 405B Instruct                 |
| **Mistral**    | 7B, 8x7B Instruct                      |
| **Phi-3**      | Mini, Small, Medium Instruct           |
| **CodeLlama**  | 7B, 13B, 34B Instruct                  |
| **Qwen**       | Various sizes                          |

## トラブルシューティング

問題が発生した場合は、以下の一般的な問題と解決策のリストを参照してください。

| 問題 | 解決策 |
| :------------------ | :--------------------------------------------------------------------------------------------------------- |
| **接続拒否** | LM Studio のローカルサーバーが実行中であり、コード内の `baseURL` が正しいことを確認してください。 |
| **モデルが見つからない** | コード内の `model` 名が、LM Studio サーバーにロードされたモデルファイル名と完全に一致することを確認してください。 |
| **応答が遅い** | 利用可能な場合は、LM Studio のサーバー設定で GPU アクセラレーションを有効にしてください。より小さなモデルを使用することも役立ちます。 |
| **メモリ不足** | モデルがシステムで利用可能な RAM よりも多くの RAM を必要とする場合があります。より小さなモデルを使用するか、コンテキスト長を短くしてみてください。 |

### エラー処理

ネットワークの問題など、潜在的なランタイムエラーを処理するために、モデルの呼び出しを `try...catch` ブロックで囲むことをお勧めします。

```typescript Error Handling Example icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel();

async function safeInvoke() {
  try {
    const response = await model.invoke({
      messages: [{ role: "user", content: "Hello!" }],
    });
    console.log(response.text);
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.error("Connection failed. Please ensure the LM Studio server is running.");
    } else {
      console.error("An unexpected error occurred:", error.message);
    }
  }
}

safeInvoke();
```

---

詳細については、公式の [LM Studio ドキュメント](https://lmstudio.ai/docs) を参照してください。他のモデル統合を調べるには、[AIGNE Hub](./models-aigne-hub.md) のドキュメントに進むことができます。