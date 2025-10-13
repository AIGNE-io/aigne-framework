# @aigne/deepseek

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/deepseek)](https://www.npmjs.com/package/@aigne/deepseek)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/deepseek)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

[AIGNE フレームワーク](https://github.com/AIGNE-io/aigne-framework)内で Deepseek AI モデルと統合するための AIGNE Deepseek SDK。

## はじめに

`@aigne/deepseek` は、AIGNE フレームワークと Deepseek の強力な言語モデルとのシームレスな統合を提供します。このパッケージにより、開発者は AIGNE アプリケーションで Deepseek の AI モデルを簡単に活用でき、Deepseek の高度な AI 機能を利用しながら、フレームワーク全体で一貫したインターフェースを提供します。

```d2
direction: down

Your-Application: {
  label: "あなたのアプリケーション"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE フレームワーク"
  shape: rectangle
  grid-columns: 2
  grid-gap: 100

  aigne-core: {
    label: "@aigne/core"
    shape: rectangle
    AIGNE-Model-Interface: {
      label: "AIGNE モデル\nインターフェース"
      shape: rectangle
    }
  }

  aigne-deepseek: {
    label: "@aigne/deepseek"
    shape: rectangle
    DeepSeekChatModel: {
      label: "DeepSeekChatModel"
      shape: rectangle
    }
  }
}

Deepseek-API: {
  label: "Deepseek API"
  shape: rectangle
}

Your-Application -> AIGNE-Framework.aigne-deepseek.DeepSeekChatModel: "呼び出す"
AIGNE-Framework.aigne-deepseek.DeepSeekChatModel -> AIGNE-Framework.aigne-core.AIGNE-Model-Interface: "実装する" {
  style.stroke-dash: 2
}
AIGNE-Framework.aigne-deepseek.DeepSeekChatModel -> Deepseek-API: "APIコールを行う"
```

## 特徴

*   **Deepseek API との統合**: Deepseek の API サービスへの直接接続。
*   **チャット補完**: 利用可能なすべてのモデルで Deepseek のチャット補完 API をサポート。
*   **関数呼び出し**: 関数呼び出し機能の組み込みサポート。
*   **ストリーミング応答**: より応答性の高いアプリケーションのためのストリーミング応答のサポート。
*   **タイプセーフ**: すべての API とモデルに対する包括的な TypeScript 型定義。
*   **一貫したインターフェース**: AIGNE フレームワークのモデルインターフェースとの互換性。
*   **エラーハンドリング**: 堅牢なエラーハンドリングとリトライメカニズム。
*   **完全な設定オプション**: 動作を微調整するための広範な設定オプション。

## インストール

お好きなパッケージマネージャーでパッケージをインストールしてください：

### npm

```bash
npm install @aigne/deepseek @aigne/core
```

### yarn

```bash
yarn add @aigne/deepseek @aigne/core
```

### pnpm

```bash
pnpm add @aigne/deepseek @aigne/core
```

## API リファレンス

### `DeepSeekChatModel`

`DeepSeekChatModel` クラスは、Deepseek Chat API と対話するための主要なインターフェースです。これは `@aigne/openai` の `OpenAIChatModel` を拡張し、使い慣れた OpenAI 互換の API 形式を提供します。

#### コンストラクタ

まず、`DeepSeekChatModel` の新しいインスタンスを作成します。

```typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  apiKey: "your-api-key", // または DEEPSEEK_API_KEY 環境変数を設定
  model: "deepseek-chat",
  modelOptions: {
    temperature: 0.7,
  },
});
```

**パラメータ**

<x-field-group>
    <x-field data-name="options" data-type="OpenAIChatModelOptions" data-required="false" data-desc="モデルの設定オプション。">
        <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="あなたの Deepseek API キー。指定しない場合、`DEEPSEEK_API_KEY` 環境変数から読み込まれます。"></x-field>
        <x-field data-name="model" data-type="string" data-default="deepseek-chat" data-required="false" data-desc="チャット補完に使用するモデル（例：'deepseek-chat', 'deepseek-coder'）。"></x-field>
        <x-field data-name="baseURL" data-type="string" data-default="https://api.deepseek.com" data-required="false" data-desc="Deepseek API のベース URL。"></x-field>
        <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="`temperature`、`top_p` など、モデル API に渡す追加オプション。"></x-field>
    </x-field>
</x-field-group>

## 基本的な使用方法

モデルに簡単なリクエストを送信するには、`invoke` メソッドを使用します。

```typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // APIキーを直接提供するか、環境変数 DEEPSEEK_API_KEY を使用します
  apiKey: "your-api-key", // 環境変数に設定されている場合はオプション
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
/* 出力:
  {
    text: "Hello! I'm an AI assistant powered by DeepSeek's language model.",
    model: "deepseek-chat",
    usage: {
      inputTokens: 7,
      outputTokens: 12
    }
  }
*/
```

## ストリーミング応答

リアルタイムアプリケーションの場合、モデルからの応答をストリーミングできます。`invoke` 呼び出しで `streaming: true` オプションを設定すると、データが利用可能になり次第、チャンクで受信できます。

```typescript
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

console.log(fullText); // 出力: "Hello! I'm an AI assistant powered by DeepSeek's language model."
console.log(json); // { model: "deepseek-chat", usage: { inputTokens: 7, outputTokens: 12 } }
```

## ライセンス

このパッケージは [Elastic-2.0 License](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) の下でライセンスされています。