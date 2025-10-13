このドキュメントでは、AIGNE フレームワーク内で OpenAI の GPT モデルとシームレスに統合するために設計された SDK である `@aigne/openai` パッケージの使用に関する包括的なガイドを提供します。

<div align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE ロゴ" width="400" />
  </picture>
</div>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/openai)](https://www.npmjs.com/package/@aigne/openai)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/openai)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

### はじめに

`@aigne/openai` は、AIGNE フレームワークと OpenAI の強力な言語モデルとのシームレスな統合を提供します。このパッケージにより、開発者は AIGNE アプリケーションで OpenAI の GPT モデルを簡単に活用でき、OpenAI の高度な AI 機能を利用しながら、フレームワーク全体で一貫したインターフェースを提供できます。

### アーキテクチャ

`@aigne/openai` パッケージはコネクタとして機能し、AIGNE フレームワークが OpenAI API と直接通信できるようにします。この統合により、OpenAI の高度なモデルを AIGNE アプリケーションにシームレスに組み込むことができます。
<diagram>
```d2
direction: down

Developer: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE フレームワーク"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"

  AIGNE-Application: {
    label: "AIGNE アプリケーション"
    shape: rectangle
  }

  aigne-openai: {
    label: "@aigne/openai\n(コネクタ)"
    shape: rectangle
  }
}

OpenAI-API: {
  label: "OpenAI API\n(GPTモデル)"
  shape: rectangle
}

Developer -> AIGNE-Framework.AIGNE-Application: "構築する"
AIGNE-Framework.AIGNE-Application -> AIGNE-Framework.aigne-openai: "使用する"
AIGNE-Framework.aigne-openai -> OpenAI-API: "APIコール"
```
</diagram>

## 機能

*   **OpenAI API 統合**: 公式 SDK を使用した OpenAI の API サービスへの直接接続。
*   **チャット補完**: すべての利用可能なモデルで OpenAI のチャット補完 API をサポート。
*   **関数呼び出し**: OpenAI の関数呼び出し機能の組み込みサポート。
*   **ストリーミング応答**: より応答性の高いアプリケーションのためのストリーミング応答のサポート。
*   **タイプセーフ**: すべての API とモデルに対する包括的な TypeScript 型定義。
*   **一貫したインターフェース**: AIGNE フレームワークのモデルインターフェースとの互換性。
*   **エラーハンドリング**: 堅牢なエラーハンドリングとリトライメカニズム。
*   **完全な設定**: 動作を微調整するための広範な設定オプション。

## インストール

お好みのパッケージマネージャーを使用して、パッケージとそのコア依存関係をインストールします。

### npm

```bash
npm install @aigne/openai @aigne/core
```

### yarn

```bash
yarn add @aigne/openai @aigne/core
```

### pnpm

```bash
pnpm add @aigne/openai @aigne/core
```

## API リファレンス

`@aigne/openai` パッケージは、OpenAI のサービスと対話するための2つの主要なクラス、`OpenAIChatModel` と `OpenAIImageModel` を公開しています。

### OpenAIChatModel

`OpenAIChatModel` クラスは、テキスト生成、ツール使用、JSON 構造化出力、画像理解など、OpenAI のチャット補完機能へのアクセスを提供します。

#### 設定

`OpenAIChatModel` を設定するには、コンストラクタに `OpenAIChatModelOptions` オブジェクトを渡します。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="OpenAI APIキー。指定しない場合は、環境変数 `OPENAI_API_KEY` が使用されます。"></x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-desc="OpenAI APIのオプションのベースURL。プロキシに便利です。"></x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false" data-desc="チャット補完に使用するOpenAIモデル。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="モデルの動作を制御するための追加オプション。">
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="ランダム性を制御します。値が低いほど、モデルの決定性が高くなります。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="ニュークリアスサンプリングパラメータ。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="既存の頻度に基づいて新しいトークンにペナルティを課します。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="これまでのテキストに出現したかどうかに基づいて新しいトークンにペナルティを課します。"></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="並列関数呼び出しを有効にするかどうか。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="Partial<ClientOptions>" data-required="false" data-desc="基盤となるOpenAI SDKの追加クライアントオプション。"></x-field>
</x-field-group>

#### 基本的な使用方法

以下は、`OpenAIChatModel` をインスタンス化して使用する基本的な例です。

```typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // APIキーを直接提供するか、環境変数OPENAI_API_KEYを使用します
  apiKey: "your-api-key", // 環境変数に設定されている場合はオプション
  model: "gpt-4o", // 指定しない場合、デフォルトは "gpt-4o-mini"
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
/* 出力:
  {
    text: "Hello! How can I assist you today?",
    model: "gpt-4o",
    usage: {
      inputTokens: 10,
      outputTokens: 9
    }
  }
*/
```

#### ストリーミング応答

リアルタイムアプリケーションの場合、モデルからの応答をストリーミングできます。

```typescript
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
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }
}

console.log(fullText); // 出力: "Hello! How can I assist you today?"
console.log(json); // { model: "gpt-4o", usage: { inputTokens: 10, outputTokens: 9 } }
```

### OpenAIImageModel

`OpenAIImageModel` クラスを使用すると、OpenAI の DALL-E モデルを使用して画像を生成および編集できます。

#### 設定

`OpenAIImageModel` を設定するには、コンストラクタに `OpenAIImageModelOptions` オブジェクトを渡します。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="OpenAI APIキー。指定しない場合は、環境変数 `OPENAI_API_KEY` が使用されます。"></x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-desc="OpenAI APIのオプションのベースURL。プロキシに便利です。"></x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false" data-desc="画像生成に使用するOpenAIモデル（例：「dall-e-2」、「dall-e-3」）。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="サイズ、品質、スタイルなど、画像生成の動作を制御するための追加オプション。"></x-field>
  <x-field data-name="clientOptions" data-type="Partial<ClientOptions>" data-required="false" data-desc="基盤となるOpenAI SDKの追加クライアントオプション。"></x-field>
</x-field-group>

#### 使用例

以下は、画像を生成する例です。

```typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
  modelOptions: {
    size: "1024x1024",
    quality: "hd",
  },
});

const result = await imageModel.process({
  prompt: "A futuristic cityscape at sunset, with flying cars and neon lights.",
});

console.log(result.images);
/* 出力:
[
  {
    type: 'url',
    url: 'https://...', // 生成された画像のURL
    mimeType: 'image/png'
  }
]
*/
```

## ライセンス

このパッケージは、[Elastic-2.0 License](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) の下でライセンスされています。