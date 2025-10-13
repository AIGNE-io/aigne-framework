このドキュメントでは、AWS Bedrock 基盤モデルを AIGNE フレームワークに統合するために設計された SDK である `@aigne/bedrock` パッケージの使用方法を包括的に解説します。パッケージのインストール、AWS での認証、基本操作、そしてストリーミングやツール使用といった高度な機能の活用方法を学びます。

### 対象読者

このドキュメントは、AIGNE ベースのアプリケーション内で AWS Bedrock の生成 AI モデルを使用したい開発者を対象としています。TypeScript、Node.js、および AIGNE フレームワークに関する基本的な理解があることを前提としています。

# @aigne/bedrock

`@aigne/bedrock` は、AIGNE フレームワークと AWS Bedrock 間のシームレスな接続を提供します。これにより、幅広い基盤モデルを活用するための一貫性のある型安全なインターフェースが提供され、AWS の安全でスケーラブルなインフラストラクチャ上に強力な AI 機能を構築できます。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-bedrock-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-bedrock.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-bedrock.png" alt="AIGNE Bedrock Architecture">
</picture>

## 機能

-   **シームレスな AWS Bedrock 統合**: 公式の AWS SDK を使用して、最小限の設定で AWS Bedrock に接続します。
-   **マルチモデル対応**: Claude、Llama、Titan など、さまざまな基盤モデルにアクセスできます。
-   **チャット補完 API**: サポートされているすべてのモデルで、チャットベースの対話のための一元化されたインターフェースを提供します。
-   **ストリーミング応答**: レスポンシブでリアルタイムなアプリケーションを作成するためのストリーミングを組み込みでサポートします。
-   **型安全**: TypeScript で完全に型付けされており、安全性を確保し、開発者体験を向上させます。
-   **AIGNE フレームワークとの互換性**: AIGNE フレームワークのモデルインターフェースに準拠し、一貫した使用法を実現します。
-   **堅牢なエラー処理**: エラーを処理し、リクエストを再試行するためのメカニズムが含まれています。
-   **広範な設定**: モデルの動作を微調整するための幅広いオプションを提供します。

## インストール

まず、`@aigne/bedrock` をコアの AIGNE パッケージと一緒にインストールします。

**npm**
```bash
npm install @aigne/bedrock @aigne/core
```

**yarn**
```bash
yarn add @aigne/bedrock @aigne/core
```

**pnpm**
```bash
pnpm add @aigne/bedrock @aigne/core
```

## 認証

`BedrockChatModel` は、認証されたリクエストを行うために AWS の認証情報を必要とします。認証情報は 2 つの方法で提供できます。

1.  **コンストラクタで直接渡す**: `accessKeyId` と `secretAccessKey` オプションとして認証情報を渡します。
2.  **環境変数**: `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_REGION` の環境変数が環境に設定されている場合、SDK はそれらを自動的に検出して使用します。

```typescript
import { BedrockChatModel } from "@aigne/bedrock";

// オプション 1: 直接インスタンス化
const modelWithKeys = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  region: "us-east-1", // AWS リージョンを指定
});

// オプション 2: 環境変数を使用 (本番環境で推奨)
// process.env.AWS_ACCESS_KEY_ID = "YOUR_ACCESS_KEY_ID";
// process.env.AWS_SECRET_ACCESS_KEY = "YOUR_SECRET_ACCESS_KEY";
// process.env.AWS_REGION = "us-east-1";
const modelFromEnv = new BedrockChatModel();
```

## 基本的な使用方法

AWS Bedrock と対話するための主要なクラスは `BedrockChatModel` です。以下は、モデルをインスタンス化して応答を取得する基本的な例です。

```typescript
import { BedrockChatModel } from "@aigne/bedrock";

async function getChatResponse() {
  const model = new BedrockChatModel({
    // 認証用の環境変数が設定されていることを前提とします
    region: "us-east-1",
    model: "anthropic.claude-3-sonnet-20240229-v1:0", // モデル ID を指定
    modelOptions: {
      temperature: 0.7,
    },
  });

  const result = await model.invoke({
    messages: [{ role: "user", content: "こんにちは、AIGNE フレームワークとは何ですか？" }],
  });

  console.log(result.text);
  console.log("Usage:", result.usage);
}

getChatResponse();
/* 期待される出力:
こんにちは！AIGNE フレームワークは...のためのツールキットです。
Usage: { inputTokens: 15, outputTokens: 50 }
*/
```

## API リファレンス

### `BedrockChatModel`

`BedrockChatModel` クラスは、この SDK を使用するためのメインのエントリーポイントです。

**コンストラクタオプション (`BedrockChatModelOptions`)**

<x-field-group>
  <x-field data-name="accessKeyId" data-type="string" data-required="false" data-desc="AWS アクセスキー ID。指定しない場合、環境変数 `AWS_ACCESS_KEY_ID` が使用されます。"></x-field>
  <x-field data-name="secretAccessKey" data-type="string" data-required="false" data-desc="AWS シークレットアクセスキー。指定しない場合、環境変数 `AWS_SECRET_ACCESS_KEY` が使用されます。"></x-field>
  <x-field data-name="region" data-type="string" data-required="false" data-desc="Bedrock サービス用の AWS リージョン (例: 'us-east-1')。指定しない場合、環境変数 `AWS_REGION` が使用されます。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="リクエストに使用するデフォルトのモデル ID (例: 'anthropic.claude-3-haiku-20240307-v1:0')。デフォルトは `us.amazon.nova-lite-v1:0` です。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="モデル推論のデフォルトオプション。">
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="ランダム性を制御します。値が低いほど、モデルの決定性が高まります。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="Nucleus サンプリングパラメータ。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="BedrockRuntimeClientConfig" data-required="false" data-desc="AWS `BedrockRuntimeClient` に直接渡される高度な設定オプション。"></x-field>
</x-field-group>

## 高度な使用方法

### ストリーミング応答

リアルタイムアプリケーション向けに、モデルが生成する応答をストリーミングできます。`invoke` メソッドで `streaming: true` オプションを設定します。

```typescript
import { BedrockChatModel } from "@aigne/bedrock";
import { isAgentResponseDelta } from "@aigne/core";

async function streamChatResponse() {
  const model = new BedrockChatModel({
    region: "us-east-1",
    model: "anthropic.claude-3-sonnet-20240229-v1:0",
  });

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "ロボットについての短い物語を教えてください。" }],
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

  console.log("\n\n--- ストリームの終わり ---");
  console.log("最終テキスト:", fullText);
}

streamChatResponse();
```

次の図は、ストリーミング操作中のデータフローを示しています。

```d2
shape: sequence_diagram

Application: {
  label: "あなたのアプリケーション"
}
Aigne-Bedrock-SDK: {
  label: "@aigne/bedrock SDK"
}
AWS-Bedrock: {
  label: "AWS Bedrock"
}
Foundation-Model: {
  label: "基盤モデル"
}

Application -> Aigne-Bedrock-SDK: "1. invoke(..., { streaming: true })"
Aigne-Bedrock-SDK -> AWS-Bedrock: "2. ストリーミング API リクエストを送信"
AWS-Bedrock -> Foundation-Model: "3. リクエストをモデルに転送"

loop: "リアルタイム応答生成" {
  Foundation-Model -> AWS-Bedrock: "4a. テキストチャンクを生成"
  AWS-Bedrock -> Aigne-Bedrock-SDK: "4b. チャンクをストリームバック"
  Aigne-Bedrock-SDK -> Application: "4c. 非同期イテレータ経由でチャンクを生成"
}

AWS-Bedrock -> Aigne-Bedrock-SDK: "5. ストリーム終了信号"
Aigne-Bedrock-SDK -> Application: "6. ストリームが閉じる"
```

### 構造化 JSON 出力

特定の Zod スキーマに準拠した構造化 JSON オブジェクトを返すようにモデルに指示できます。これは、予測可能で機械可読な出力を生成するのに役立ちます。

これを行うには、Zod スキーマを定義し、それを `invoke` メソッドの `responseFormat` オプションで渡します。SDK は、目的の出力を生成するために `generate_json` ツールを使用するようモデルに自動的にプロンプトを出します。

```typescript
import { BedrockChatModel } from "@aigne/bedrock";
import { z } from "zod";

async function getStructuredResponse() {
  const model = new BedrockChatModel({
    region: "us-east-1",
    model: "anthropic.claude-3-sonnet-20240229-v1:0",
  });

  const userSchema = z.object({
    name: z.string().describe("ユーザーのフルネーム。"),
    email: z.string().email().describe("ユーザーのメールアドレス。"),
    age: z.number().positive().describe("ユーザーの年齢。"),
  });

  const result = await model.invoke({
    messages: [
      {
        role: "user",
        content: "次のテキストからユーザー情報を抽出してください：John Doe は 30 歳で、メールアドレスは john.doe@example.com です。",
      },
    ],
    responseFormat: {
      type: "json_schema",
      jsonSchema: {
        schema: userSchema,
      },
    },
  });

  console.log(result.json);
}

getStructuredResponse();
/* 期待される出力:
{
  name: "John Doe",
  email: "john.doe@example.com",
  age: 30
}
*/
```