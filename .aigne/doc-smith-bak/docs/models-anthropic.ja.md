# Anthropic

このガイドでは、`@aigne/anthropic` パッケージを介して AIGNE フレームワーク内で Anthropic の Claude モデルを設定および使用する方法について説明します。API キーの設定、モデルのインスタンス化、標準応答とストリーミング応答の両方でモデルを呼び出す方法をカバーしています。

AIGNE フレームワーク内でのモデルの動作に関する一般的な概要については、[モデルのコアコンセプト](./developer-guide-core-concepts-models.md) のドキュメントを参照してください。

## はじめに

`@aigne/anthropic` パッケージは、AIGNE フレームワークと Anthropic の強力な Claude 言語モデルとの間で、直接的かつシームレスな統合を提供します。これにより、開発者は Claude 3.5 Sonnet や Claude 3 Opus のようなモデルの高度な機能を、標準化された `ChatModel` インターフェースを通じて活用でき、Agent アプリケーション全体で一貫性を確保できます。

この統合の主な機能は次のとおりです：

*   **ダイレクト API 統合**: 公式の Anthropic SDK を利用して信頼性の高い通信を実現します。
*   **チャット補完**: Anthropic のチャット補完 API を完全にサポートします。
*   **ツール呼び出し**: Claude のツール呼び出し機能をネイティブにサポートします。
*   **ストリーミング応答**: ストリーミング出力を処理することで、リアルタイムで応答性の高いアプリケーションを可能にします。
*   **タイプセーフ**: 堅牢な開発のための包括的な TypeScript 型定義が付属しています。

## インストール

開始するには、お好みのパッケージマネージャーを使用して、`@aigne/anthropic` パッケージとコア AIGNE パッケージをインストールします。

<tabs>
<tab-item title="npm">

```bash
npm install @aigne/anthropic @aigne/core
```

</tab-item>
<tab-item title="yarn">

```bash
yarn add @aigne/anthropic @aigne/core
```

</tab-item>
<tab-item title="pnpm">

```bash
pnpm add @aigne/anthropic @aigne/core
```

</tab-item>
</tabs>

## 設定

`AnthropicChatModel` クラスは、Claude モデルと対話するための主要なエントリーポイントです。これをインスタンス化するには、Anthropic API キーを提供し、オプションでモデルやその他の設定を指定する必要があります。

### API キー

Anthropic API キーは、優先順位の高い順に、次の 3 つの方法のいずれかで設定できます：

1.  **コンストラクタで直接指定**: `apiKey` プロパティ経由でキーを渡します。
2.  **`ANTHROPIC_API_KEY` 環境変数**: モデルはこの変数を自動的に検出して使用します。
3.  **`CLAUDE_API_KEY` 環境変数**: 同様にサポートされている代替の環境変数です。

```typescript モデルのインスタンス化 icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // オプション 1: API キーを直接指定
  apiKey: "your-anthropic-api-key", 
  
  // ANTHROPIC_API_KEY または CLAUDE_API_KEY が環境に設定されており、
  // apiKey が指定されていない場合、モデルは自動的にそれらを使用します。
});
```

### モデルの選択

`model` プロパティを使用して、どの Claude モデルを使用するかを指定できます。指定しない場合、デフォルトで `claude-3-7-sonnet-latest` になります。`temperature` のような他の一般的なモデルパラメータは、`modelOptions` オブジェクト内で設定できます。

一般的に使用されるモデルのリストには、以下が含まれます：
*   `claude-3-5-sonnet-20240620`
*   `claude-3-opus-20240229`
*   `claude-3-sonnet-20240229`
*   `claude-3-haiku-20240307`

```typescript モデル設定 icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: "your-anthropic-api-key",
  
  // モデルのバージョンを指定
  model: "claude-3-haiku-20240307",

  // 他のモデルの動作を設定
  modelOptions: {
    temperature: 0.7, // ランダム性を制御 (0.0 から 1.0)
  },
});
```

## 基本的な使用方法

応答を生成するには、`invoke` メソッドを使用します。会話を開始するために、メッセージのリストをモデルに渡します。このメソッドは、テキスト応答やトークン使用統計を含むモデルの出力で解決される Promise を返します。

```typescript 基本的なチャット補完 icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: "your-anthropic-api-key",
  model: "claude-3-haiku-20240307",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```

`result` オブジェクトには、生成されたテキストと API からのその他のメタデータが含まれています。

**応答の例**

```json
{
  "text": "I am Claude, a large language model trained by Anthropic.",
  "model": "claude-3-haiku-20240307",
  "usage": {
    "inputTokens": 8,
    "outputTokens": 12
  }
}
```

## ストリーミング応答

リアルタイムの対話が必要なアプリケーションでは、`invoke` メソッドで `streaming` オプションを `true` に設定することでストリーミングを有効にできます。これにより、応答チャンクが利用可能になるたびにそれらを生成する非同期イテレータが返されます。

`isAgentResponseDelta` ユーティリティを使用して、チャンクに新しいデータが含まれているかどうかを確認できます。

```typescript ストリーミングの例 icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AnthropicChatModel({
  apiKey: "your-anthropic-api-key",
  model: "claude-3-haiku-20240307",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story about a robot." }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      process.stdout.write(text); // テキストが届き次第コンソールに出力
      fullText += text;
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n\n--- Final Response ---");
console.log(fullText);
console.log(json);
```

このコードはストリームを処理し、テキストチャンクを即座にコンソールに出力し、完全な応答とメタデータを蓄積します。

## まとめ

これで、AIGNE アプリケーション内で Anthropic の Claude モデルをインストール、設定、および使用するために必要な情報を得ました。単純なタスクには基本的な呼び出しを実行でき、よりインタラクティブな体験にはストリーミングを使用できます。

複数のモデルと Agent のオーケストレーションについてさらに学ぶには、[Team Agent](./developer-guide-agents-team-agent.md) のドキュメントを参照してください。利用可能な他のモデルの詳細については、メインの [モデル](./models.md) セクションをご覧ください。