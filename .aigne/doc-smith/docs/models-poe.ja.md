# @aigne/poe

[AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) 内で Poe 言語モデルおよび API サービスと統合するための AIGNE Poe SDK。

## 概要

`@aigne/poe` は、AIGNE Framework と Poe の言語モデルおよび API サービス間のシームレスな統合を提供します。このパッケージにより、開発者は AIGNE アプリケーションで Poe のモデルを簡単に活用でき、Poe の高度な AI 機能を利用しながら、フレームワーク全体で一貫したインターフェースを提供できます。

```d2
direction: down

Developer: {
  shape: c4-person
  label: "開発者"
}

AIGNE-Application: {
  label: "AIGNE アプリケーション"
  shape: rectangle

  App-Code: {
    label: "アプリケーションコード\n(例: `model.invoke()`)"
    shape: rectangle
  }

  Dependencies: {
    label: "依存関係"
    shape: rectangle

    aigne-core: {
      label: "@aigne/core"
      shape: rectangle
    }

    aigne-poe: {
      label: "@aigne/poe\n(PoeChatModel)"
      shape: rectangle
    }
  }
}

Poe-API: {
  label: "Poe API サービス"
  shape: cylinder

  Poe-Models: {
    label: "Poe 言語モデル\n(例: claude-3-opus)"
    shape: rectangle
  }
}

Developer -> AIGNE-Application.App-Code: "コードを記述・実行"
AIGNE-Application.Dependencies.aigne-poe -> AIGNE-Application.Dependencies.aigne-core: "コアインターフェースに依存し\n実装する"
AIGNE-Application.App-Code -> AIGNE-Application.Dependencies.aigne-poe: "1. 'invoke()' を呼び出す"
AIGNE-Application.Dependencies.aigne-poe -> Poe-API: "2. API リクエストを送信"
Poe-API -> AIGNE-Application.Dependencies.aigne-poe: "3. レスポンスを返す\n(単一オブジェクトまたはストリーム)"
AIGNE-Application.Dependencies.aigne-poe -> AIGNE-Application.App-Code: "4. アプリに結果を渡す"
```

## 機能

*   **Poe API 統合**: Poe の API サービスへの直接接続。
*   **チャット補完**: 利用可能なすべてのモデルでの Poe のチャット補完 API のサポート。
*   **関数呼び出し**: 関数呼び出し機能の組み込みサポート。
*   **ストリーミング応答**: より応答性の高いアプリケーションのためのストリーミング応答のサポート。
*   **型安全**: すべての API とモデルに対する包括的な TypeScript の型定義。
*   **一貫したインターフェース**: AIGNE Framework のモデルインターフェースとの互換性。
*   **エラーハンドリング**: 堅牢なエラーハンドリングとリトライメカニズム。
*   **完全な設定**: 動作を微調整するための広範な設定オプション。

## インストール

お好みのパッケージマネージャーを使用してパッケージをインストールしてください。

### npm

```bash
npm install @aigne/poe @aigne/core
```

### yarn

```bash
yarn add @aigne/poe @aigne/core
```

### pnpm

```bash
pnpm add @aigne/poe @aigne/core
```

## 設定

開始するには、`PoeChatModel` をインスタンス化します。コンストラクターは設定用の `options` オブジェクトを受け入れます。

```typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // Options
});
```

**コンストラクターのオプション**

<x-field-group>
    <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="あなたの Poe API キー。指定しない場合、SDK は環境変数 `POE_API_KEY` を使用します。"></x-field>
    <x-field data-name="model" data-type="string" data-required="false" data-default="'gpt-5-mini'" data-desc="補完に使用する特定の Poe モデル (例: 'claude-3-opus')。"></x-field>
    <x-field data-name="baseURL" data-type="string" data-required="false" data-default="'https://api.poe.com/v1'" data-desc="Poe API のベース URL。"></x-field>
    <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="モデル API に渡す追加のオプション。`temperature` や `top_p` など。"></x-field>
</x-field-group>

API キーは 2 つの方法で設定できます。
1.  コンストラクターで直接指定: `new PoeChatModel({ apiKey: "your-api-key" })`
2.  `POE_API_KEY` という名前の環境変数として設定。

## 使用方法

### 基本的な呼び出し

Poe API にリクエストを送信するには、`invoke` メソッドを使用します。このメソッドは `messages` 配列を持つオブジェクトを受け取り、モデルのレスポンスで解決される Promise を返します。

```typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // API キーを直接指定するか、環境変数 POE_API_KEY を使用します
  apiKey: "your-api-key", // 環境変数で設定されている場合はオプション
  // モデルを指定 (デフォルトは 'gpt-5-mini')
  model: "claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
/* 出力:
  {
    text: "I'm powered by Poe, using the Claude 3 Opus model from Anthropic.",
    model: "claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14
    }
  }
  */
```

### ストリーミング応答

リアルタイムアプリケーション向けに、モデルからのレスポンスをストリーミングできます。`invoke` メソッドの第 2 引数で `streaming: true` オプションを設定します。これにより、レスポンスのチャンクが利用可能になるたびにそれらを生成する非同期イテレータが返されます。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  apiKey: "your-api-key",
  model: "claude-3-opus",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Which model are you using?" }],
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

console.log(fullText); // 出力: "I'm powered by Poe, using the Claude 3 Opus model from Anthropic."
console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## ライセンス

このパッケージは [Elastic-2.0 License](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) の下でライセンスされています。