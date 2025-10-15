# DeepSeek

このガイドでは、`@aigne/deepseek` パッケージを介して AIGNE Framework 内で DeepSeek モデルを設定し、使用する方法について説明します。API キーの設定、モデルのインスタンス化、および標準応答とストリーミング応答の両方の例を扱います。

`@aigne/deepseek` パッケージは DeepSeek API との直接的な統合を提供し、その強力な言語モデルを活用します。AIGNE Framework の `ChatModel` インターフェースと互換性があるように設計されており、一貫した開発体験を保証します。

## インストール

まず、お好みのパッケージマネージャーを使用して必要なパッケージをインストールします。`@aigne/core` パッケージは必須のピア依存関係です。

```bash tabs
npm install @aigne/deepseek @aigne/core
```

```bash tabs
yarn add @aigne/deepseek @aigne/core
```

```bash tabs
pnpm add @aigne/deepseek @aigne/core
```

## 設定

`DeepSeekChatModel` クラスは、DeepSeek モデルと対話するための主要なインターフェースです。これは `OpenAIChatModel` を拡張し、DeepSeek 固有の API エンドポイントと認証方法を使用するように設定されています。

認証には DeepSeek API キーが必要です。キーは2つの方法で提供できます：

1.  **コンストラクタで直接**: `apiKey` プロパティを介してキーを渡します。
2.  **環境変数**: `DEEPSEEK_API_KEY` 環境変数を設定します。`apiKey` プロパティが提供されていない場合、モデルは自動的にこれを使用します。

### パラメータ

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>DeepSeek API キー。提供されない場合、クライアントは `DEEPSEEK_API_KEY` 環境変数を探します。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="deepseek-chat" data-required="false">
    <x-field-desc markdown>チャット補完に使用する特定の DeepSeek モデル。デフォルトは `deepseek-chat` です。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>`temperature`、`top_p`、`max_tokens` など、モデル API に渡す追加のオプション。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://api.deepseek.com" data-required="false">
    <x-field-desc markdown>DeepSeek API のベース URL。カスタムプロキシを使用している場合を除き、これを変更すべきではありません。</x-field-desc>
  </x-field>
</x-field-group>

## 使用方法

設定が完了すると、モデルを使用してテキスト補完を生成したり、応答をストリーミングしたりできます。

### 基本的な呼び出し

標準的な応答を生成するには、`invoke` メソッドを使用します。メッセージのリストを提供すると、このメソッドはモデルからの完全な応答で解決されるプロミスを返します。

```typescript 基本的な使用方法 icon=logos:typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // APIキーを直接指定するか、環境変数 DEEPSEEK_API_KEY を使用します
  apiKey: "your-api-key", // 環境変数に設定されている場合は省略可能
  // モデルのバージョンを指定します（デフォルトは 'deepseek-chat'）
  model: "deepseek-chat",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

`result` オブジェクトには、生成されたテキストとモデルの使用状況に関するメタデータが含まれています。

**応答の例**

```json
{
  "text": "こんにちは！私は DeepSeek の言語モデルを搭載した AI アシスタントです。",
  "model": "deepseek-chat",
  "usage": {
    "inputTokens": 7,
    "outputTokens": 12
  }
}
```

### ストリーミング応答

リアルタイムアプリケーション向けに、モデルからの応答をストリーミングできます。`invoke` メソッドの第2引数で `streaming` オプションを `true` に設定します。これにより、応答のチャンクが利用可能になるたびにそれらを生成する非同期イテレータが返されます。

```typescript ストリーミング応答 icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  apiKey: "your-api-key",
  model: "deepseek-chat",
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

console.log(fullText);
// 期待される出力: "こんにちは！私は DeepSeek の言語モデルを搭載した AI アシスタントです。"

console.log(json);
// 期待される出力: { model: "deepseek-chat", usage: { inputTokens: 7, outputTokens: 12 } }
```

この例では、コードはストリームを反復処理し、各チャンクからのテキストデルタを蓄積して完全な応答を構築します。トークン使用量などの最終的なメタデータは、最後のチャンクで提供されます。

## まとめ

このガイドでは、AIGNE Framework で DeepSeek モデルをインストール、設定、および使用するための基本的な手順を説明しました。これらの指示に従うことで、DeepSeek のチャット機能をシングルターンおよびストリーミングの両方のユースケースでアプリケーションに統合できます。より高度な設定や機能については、API リファレンスやドキュメントの他のセクションを参照してください。