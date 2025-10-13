# @aigne/xai

`@aigne/xai` パッケージは、AIGNE フレームワークと XAI の言語モデル（Grokなど）とのシームレスな統合を提供します。AIGNE アプリケーション内で XAI の高度な AI 機能を活用するための標準化されたインターフェースを提供し、一貫した開発体験を保証します。

この SDK は、X.AI が提供する OpenAI 互換の API 形式を基盤に構築されており、`grok-2-latest` のようなモデルとの簡単な対話を可能にします。

## アーキテクチャ概要

`@aigne/xai` パッケージは、コアの AIGNE フレームワークと XAI API 間のコネクターとして機能し、一貫したインターフェースで XAI モデルをアプリケーションに組み込むことができます。

```d2
direction: down

AIGNE-Application: {
  label: "AIGNE アプリケーション"
  shape: rectangle

  aigne-xai: {
    label: "@aigne/xai SDK"
    shape: rectangle
  }
}

XAI-API: {
  label: "XAI API"
  shape: rectangle

  XAI-Models: {
    label: "XAI モデル\n(例: Grok)"
    shape: cylinder
  }
}

AIGNE-Application.aigne-xai -> XAI-API: "OpenAI互換API経由で通信"
XAI-API -> XAI-API.XAI-Models: "アクセスを提供"
```

## 機能

*   **XAI API 統合**: XAI の API サービスへの直接接続。
*   **チャット補完**: 利用可能なすべてのモデルで XAI のチャット補完 API をサポート。
*   **関数呼び出し**: 関数呼び出し機能の組み込みサポート。
*   **ストリーミング応答**: より応答性の高いアプリケーションのためのストリーミング応答の処理を可能にします。
*   **タイプセーフ**: すべての API とモデルに対応する包括的な TypeScript 型定義が付属。
*   **一貫したインターフェース**: AIGNE フレームワークのモデルインターフェースと完全に互換性があります。
*   **エラーハンドリング**: 堅牢なエラーハンドリングとリトライメカニズムを含みます。
*   **完全な設定オプション**: モデルの動作を微調整するための広範な設定オプションを提供します。

## インストール

npm、yarn、または pnpm を使用してパッケージをインストールできます。

### npm

```bash
npm install @aigne/xai @aigne/core
```

### yarn

```bash
yarn add @aigne/xai @aigne/core
```

### pnpm

```bash
pnpm add @aigne/xai @aigne/core
```

## 設定

まず、`XAIChatModel` を設定する必要があります。モデルは、その動作をカスタマイズするためにさまざまなオプションで初期化できます。

```typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // APIキーを直接提供するか、XAI_API_KEY環境変数を使用します
  apiKey: "your-xai-api-key", // 環境変数が設定されている場合はオプション

  // 使用するモデルを指定します。デフォルトは 'grok-2-latest'
  model: "grok-2-latest",

  // モデルに渡す追加オプション
  modelOptions: {
    temperature: 0.7,
    max_tokens: 1024,
  },
});
```

`apiKey` は、コンストラクタに直接渡すか、`XAI_API_KEY` という名前の環境変数として設定できます。SDK は自動的にそれを取得します。

## 基本的な使い方

次の例は、`invoke` メソッドを使用して簡単なリクエストを XAI モデルに送信し、レスポンスを受信する方法を示しています。

```typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // APIキーを直接提供するか、環境変数 XAI_API_KEY を使用します
  apiKey: "your-api-key", // 環境変数に設定されている場合はオプション
  // モデルを指定します (デフォルトは 'grok-2-latest')
  model: "grok-2-latest",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
/* 出力:
  {
    text: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!",
    model: "grok-2-latest",
    usage: {
      inputTokens: 6,
      outputTokens: 17
    }
  }
  */
```

## ストリーミング応答

リアルタイムの対話を必要とするアプリケーションでは、モデルからの応答をストリーミングできます。これは、ユーザーが応答が生成されるのを確認できる対話型インターフェースを作成するのに役立ちます。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  apiKey: "your-api-key",
  model: "grok-2-latest",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me about yourself" }],
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

console.log(fullText); // 出力: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!"
console.log(json); // { model: "grok-2-latest", usage: { inputTokens: 6, outputTokens: 17 } }
```

## ライセンス

このパッケージは、Elastic-2.0 ライセンスの下でリリースされています。