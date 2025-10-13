# @aigne/anthropic

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE ロゴ" width="400" />
  </picture>
</p>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/anthropic)](https://www.npmjs.com/package/@aigne/anthropic)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/anthropic)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

[AIGNE Framework](https://github.com/AIGNE-io/aigne-framework)内で Claude AI モデルと統合するための AIGNE Anthropic SDK です。

## はじめに

`@aigne/anthropic` は、AIGNE Framework と Anthropic の Claude 言語モデル間のシームレスな統合を提供します。このパッケージにより、開発者は AIGNE アプリケーションで Anthropic の強力なモデルを簡単に活用でき、Claude の高度な AI 機能を利用しながら一貫したインターフェースを提供します。

この図は、`@aigne/anthropic` パッケージが AIGNE アプリケーションを Anthropic API およびその基盤となる Claude モデルに接続する方法を示しています。

```d2
direction: down

AIGNE-Application: {
  label: "AIGNE アプリケーション"
  shape: rectangle

  AIGNE-Framework: {
    label: "AIGNE Framework"
    icon: "https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg"
    shape: rectangle

    aigne-anthropic: {
      label: "@aigne/anthropic"
      shape: rectangle
    }
  }
}

Anthropic-Service: {
  label: "Anthropic サービス"
  shape: rectangle

  Anthropic-API: {
    label: "Anthropic API"
  }

  Claude-Models: {
    label: "Claude モデル"
    claude-3-haiku: "claude-3-haiku"
    claude-3-sonnet: "claude-3-sonnet"
  }
}

AIGNE-Application.AIGNE-Framework.aigne-anthropic -> Anthropic-Service.Anthropic-API: "SDK経由で統合"
Anthropic-Service.Anthropic-API -> Anthropic-Service.Claude-Models: "アクセス"
```

## 機能

*   **Anthropic API 統合**: 公式 SDK を使用した Anthropic の API サービスへの直接接続。
*   **チャット補完**: 利用可能なすべてのモデルで Claude のチャット補完 API を完全にサポート。
*   **ツール呼び出し**: Claude の強力なツール呼び出し機能の組み込みサポート。
*   **ストリーミング応答**: より応答性の高いリアルタイムアプリケーションのためのストリーミングを有効化。
*   **型安全**: すべての API、モデル、オプションに対する包括的な TypeScript 型定義。
*   **一貫したインターフェース**: プロバイダー間の互換性のために AIGNE Framework の統一されたモデルインターフェースに準拠。
*   **堅牢なエラー処理**: 組み込みのエラー処理と再試行メカニズムを搭載。
*   **完全な設定**: モデルの動作とクライアント設定を微調整するための豊富なオプション。

## インストール

開始するには、お好みのパッケージマネージャーを使用して `@aigne/anthropic` と `@aigne/core` パッケージをインストールします。

### npm

```bash
npm install @aigne/anthropic @aigne/core
```

### yarn

```bash
yarn add @aigne/anthropic @aigne/core
```

### pnpm

```bash
pnpm add @aigne/anthropic @aigne/core
```

## 設定

`AnthropicChatModel` はインスタンス化時に設定できます。

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // ANTHROPIC_API_KEY または CLAUDE_API_KEY が環境に設定されている場合、API キーはオプションです
  apiKey: "your-anthropic-api-key",

  // モデル ID を指定します。デフォルトは 'claude-3-7-sonnet-latest' です
  model: "claude-3-haiku-20240307",

  // デフォルトのモデルパラメータを設定します
  modelOptions: {
    temperature: 0.7,
    topP: 1.0,
  },
  
  // 基盤となる Anthropic SDK クライアントにカスタムオプションを渡します
  clientOptions: {
    timeout: 600000, // 10分
  }
});
```

### 設定オプション

<x-field-group>
    <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="Anthropic API キー。指定しない場合、SDK は `ANTHROPIC_API_KEY` または `CLAUDE_API_KEY` 環境変数をチェックします。"></x-field>
    <x-field data-name="model" data-type="string" data-required="false" data-desc="リクエストに使用するデフォルトのモデル ID。デフォルトは `claude-3-7-sonnet-latest` です。"></x-field>
    <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="モデルのデフォルトパラメータ。">
        <x-field data-name="temperature" data-type="number" data-required="false" data-desc="ランダム性を制御します。値を低くすると、モデルの決定性が高まります。"></x-field>
        <x-field data-name="topP" data-type="number" data-required="false" data-desc="ニュークリアスサンプリングのしきい値。"></x-field>
        <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="モデルが複数のツールを並行して呼び出すことを許可するかどうか。"></x-field>
    </x-field>
    <x-field data-name="clientOptions" data-type="object" data-required="false" data-desc="`timeout` や `baseURL` など、Anthropic SDK クライアントに直接渡す高度なオプション。"></x-field>
</x-field-group>

## 基本的な使用方法

モデルを呼び出してチャット補完を取得する基本的な例を次に示します。

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: "your-api-key", // または環境変数で ANTHROPIC_API_KEY を設定
  model: "claude-3-haiku-20240307",
});

async function getGreeting() {
  const result = await model.invoke({
    messages: [{ role: "user", content: "Write a short, friendly greeting." }],
  });

  console.log(result.text);
}

getGreeting();
/* 出力:
こんにちは！お会いできて光栄です。今日はどのようなご用件でしょうか？
*/
```

## ストリーミング応答

リアルタイム出力が必要なアプリケーションでは、モデルの応答をストリーミングできます。`streaming: true` が設定されている場合、`invoke` メソッドは `AsyncGenerator` を返します。

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AnthropicChatModel({
  apiKey: "your-api-key",
  model: "claude-3-haiku-20240307",
});

async function streamStory() {
  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Tell me a short story about a robot." }],
    },
    { streaming: true },
  );

  let fullText = "";
  process.stdout.write("ストーリー: ");
  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.text;
      if (text) {
        fullText += text;
        process.stdout.write(text);
      }
    }
  }
  console.log("\n\nすべてのストーリーを受信しました。");
}

streamStory();
```

## ツール呼び出し

`AnthropicChatModel` はツール呼び出しをサポートしており、モデルが定義した関数の実行を要求できます。

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { z } from "zod";

const model = new AnthropicChatModel({
  apiKey: "your-api-key",
  model: "claude-3-opus-20240229", // 複雑なツール使用には Opus が推奨されます
});

async function callWeatherTool() {
  const result = await model.invoke({
    messages: [{ role: "user", content: "What's the weather like in San Francisco?" }],
    tools: [
      {
        type: "function",
        function: {
          name: "getCurrentWeather",
          description: "Get the current weather for a specific location",
          parameters: z.object({
            location: z.string().describe("市と州、例：San Francisco, CA"),
          }),
        },
      },
    ],
    toolChoice: "auto", // "auto"、"required"、"none"、または特定のツールを指定できます
  });

  if (result.toolCalls && result.toolCalls.length > 0) {
    const toolCall = result.toolCalls[0];
    console.log("ツール呼び出しが要求されました:", toolCall.function.name);
    console.log("引数:", toolCall.function.arguments);
    // 実際のアプリケーションでは、ここでツールを実行します
  } else {
    console.log("ツール呼び出しは行われませんでした。");
    console.log("応答:", result.text);
  }
}

callWeatherTool();
/* 出力:
ツール呼び出しが要求されました: getCurrentWeather
引数: { location: 'San Francisco, CA' }
*/
```

## ライセンス

このプロジェクトは [Elastic-2.0 ライセンス](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) の下でライセンスされています。