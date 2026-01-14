# AWS Bedrock

`@aigne/bedrock` パッケージは、AIGNE フレームワークと Amazon Web Services (AWS) Bedrock との間の直接的で堅牢な統合を提供します。これにより、開発者は AWS のスケーラブルで安全なインフラストラクチャを活用しつつ、一貫したインターフェースを維持しながら、AIGNE アプリケーション内で AWS Bedrock を通じて利用可能な多様な基盤モデルを活用できます。

このガイドでは、`BedrockChatModel` のインストール、設定、および使用方法の体系的な概要を説明します。その他のモデルの詳細については、メインの [モデル概要](./models-overview.md) を参照してください。

## インストール

まず、お好みのパッケージマネージャーを使用して必要なパッケージをインストールします。`@aigne/core` パッケージは必須のピア依存関係です。

```bash Terminal
# npm を使用する場合
npm install @aigne/bedrock @aigne/core

# yarn を使用する場合
yarn add @aigne/bedrock @aigne/core

# pnpm を使用する場合
pnpm add @aigne/bedrock @aigne/core
```

## 設定

適切な設定には、AWS 認証情報の設定と、希望するパラメータでの `BedrockChatModel` のインスタンス化が含まれます。

### AWS 認証情報

AWS SDK は、リクエストを認証するために認証情報を必要とします。認証情報は次の 2 つの方法のいずれかで提供できます。

1.  **環境変数（推奨）**: 開発環境またはデプロイ環境で以下の環境変数を設定します。SDK はこれらを自動的に検出して使用します。
    *   `AWS_ACCESS_KEY_ID`: AWS アクセスキー ID。
    *   `AWS_SECRET_ACCESS_KEY`: AWS シークレットアクセスキー。
    *   `AWS_REGION`: Bedrock サービスが有効になっている AWS リージョン（例: `us-east-1`）。

2.  **直接インスタンス化**: 認証情報を `BedrockChatModel` コンストラクタに直接渡します。この方法は特定のユースケースには適していますが、一般的に環境変数を使用するよりも安全性が低くなります。

### BedrockChatModel オプション

`BedrockChatModel` は、AWS Bedrock と対話するための主要なクラスです。そのコンストラクタは、動作を設定するためのオプションオブジェクトを受け入れます。

<x-field-group>
  <x-field data-name="accessKeyId" data-type="string" data-required="false">
    <x-field-desc markdown>AWS アクセスキー ID。提供されない場合、SDK は `AWS_ACCESS_KEY_ID` 環境変数から読み取ろうとします。</x-field-desc>
  </x-field>
  <x-field data-name="secretAccessKey" data-type="string" data-required="false">
    <x-field-desc markdown>AWS シークレットアクセスキー。提供されない場合、SDK は `AWS_SECRET_ACCESS_KEY` 環境変数から読み取ろうとします。</x-field-desc>
  </x-field>
  <x-field data-name="region" data-type="string" data-required="false">
    <x-field-desc markdown>Bedrock サービスの AWS リージョン。提供されない場合、SDK は `AWS_REGION` 環境変数から読み取ろうとします。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="us.amazon.nova-lite-v1:0">
    <x-field-desc markdown>使用する基盤モデルの ID（例: `anthropic.claude-3-sonnet-20240229-v1:0`, `meta.llama3-8b-instruct-v1:0`）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>モデルの推論動作を制御するための追加オプション。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="生成におけるランダム性を制御します。値が高いほど、より創造的な応答になります。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="ニュークリアスサンプリングを制御します。モデルは、上位 P の確率質量を持つトークンのみを考慮します。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>AWS SDK の基盤となる `BedrockRuntimeClient` に直接渡される高度な設定オプション。</x-field-desc>
  </x-field>
</x-field-group>

## 使用例

以下の例では、標準的な呼び出しとストリーミング呼び出しの両方で `BedrockChatModel` を使用する方法を示します。

### 基本的な使用方法

この例では、モデルをインスタンス化し、それを呼び出して単一の完全な応答を取得する方法を示します。

```typescript Basic Invocation icon=logos:javascript
import { BedrockChatModel } from "@aigne/bedrock";

// 認証情報とモデル ID でモデルをインスタンス化
const model = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID", // または環境変数を使用
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY", // または環境変数を使用
  region: "us-east-1", // AWS リージョンを指定
  model: "anthropic.claude-3-haiku-20240307-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

// 入力メッセージを定義
const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, what is AWS Bedrock?" }],
});

console.log(result.text);
```

出力は、モデルの応答を含む文字列になります。`result` オブジェクトには使用状況のメトリクスも含まれています。

### ストリーミング応答

リアルタイムのフィードバックが必要なアプリケーションでは、生成される応答をストリーミングできます。これは、チャットボットやその他のインタラクティブな体験に役立ちます。

```typescript Streaming Invocation icon=logos:javascript
import { BedrockChatModel } from "@aigne/bedrock";
import { isAgentResponseDelta } from "@aigne/core";

const model = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  region: "us-east-1",
  model: "anthropic.claude-3-haiku-20240307-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, what is AWS Bedrock?" }],
  },
  { streaming: true },
);

let fullText = "";

for await (const chunk of stream) {
  // タイプガードを使用してチャンクがデルタであるかを確認
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text); // 応答の各部分が届くたびに表示
    }
  }
}

console.log("\n--- Full Response ---");
console.log(fullText);
```

このコードは `AgentResponseChunk` オブジェクトのストリームを処理します。各チャンクには応答の差分が含まれており、これを蓄積して完全なテキストを形成します。

## サポートされているモデル

AWS Bedrock は、Anthropic、Cohere、Meta、Stability AI、Amazon などの主要な AI 企業が提供する多種多様な基盤モデルへのアクセスを提供します。一意の `modelId` を使用して、目的のモデルを指定できます。

一般的に使用されるモデルファミリーには、以下のようなものがあります。
-   **Anthropic Claude**: `anthropic.claude-3-sonnet-20240229-v1:0`, `anthropic.claude-3-haiku-20240307-v1:0`
-   **Meta Llama**: `meta.llama3-8b-instruct-v1:0`
-   **Amazon Titan**: `amazon.titan-text-express-v1`

利用可能なモデルとその対応する ID の完全かつ最新のリストについては、[AWS Bedrock の公式ドキュメント](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html) を参照してください。

## まとめ

`@aigne/bedrock` パッケージは、AWS Bedrock の強力な基盤モデルを AIGNE アプリケーションに統合するための合理化された方法を提供します。このガイドで概説されている設定手順と使用パターンに従うことで、AI 駆動の機能を効率的に構築し、デプロイできます。

ツールの使用や構造化出力などのより高度なトピックについては、[AI Agent](./developer-guide-agents-ai-agent.md) のドキュメントを参照してください。