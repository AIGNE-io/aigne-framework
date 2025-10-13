このドキュメントは、`@aigne/open-router` パッケージを統合する開発者向けの包括的なガイドです。このパッケージをインストール、設定、使用して、統一されたインターフェースを通じて多種多様な AI モデルを活用する方法を学びます。

# @aigne/open-router

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)"/>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)"/>
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE ロゴ" width="400" />
  </picture>
</p>

`@aigne/open-router` は、AIGNE フレームワークと OpenRouter の統一 API とのシームレスな統合を提供します。これにより、開発者は OpenAI、Anthropic、Google のようなプロバイダーからの広範な AI モデルに、単一で一貫したインターフェースを通じてアクセスでき、モデル選択を簡素化し、堅牢なフォールバック設定を可能にします。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter-dark.png" media="(prefers-color-scheme: dark)"/>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter.png" media="(prefers-color-scheme: light)"/>
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-openrouter.png" alt="AIGNE OpenRouter アーキテクチャ図" />
</picture>

## 特徴

*   **統一 API**: 数十のプロバイダーのモデルに、単一で一貫したインターフェースでアクセスします。
*   **モデルフォールバック**: プライマリモデルが失敗した場合、自動的にバックアップモデルに切り替えます。
*   **ストリーミングサポート**: ストリーミングレスポンスにより、リアルタイムで応答性の高いアプリケーションを実現します。
*   **AIGNE フレームワーク互換性**: `@aigne/core` のモデルインターフェースと完全に統合します。
*   **広範な設定**: 幅広いオプションでモデルの動作を微調整します。
*   **タイプセーフ**: すべての API とモデルに対する包括的な TypeScript の型付けの恩恵を受けられます。

## インストール

始めるには、お好みのパッケージマネージャーを使用して必要なパッケージをインストールしてください。

### npm

```bash
npm install @aigne/open-router @aigne/core
```

### yarn

```bash
yarn add @aigne/open-router @aigne/core
```

### pnpm

```bash
pnpm add @aigne/open-router @aigne/core
```

## 設定と基本的な使用法

このパッケージのプライマリエクスポートは `OpenRouterChatModel` です。これは `@aigne/openai` パッケージの `OpenAIChatModel` を拡張しているため、同じオプションを受け入れます。

モデルを設定するには、OpenRouter API キーを提供する必要があります。コンストラクタに直接渡すか、`OPEN_ROUTER_API_KEY` 環境変数を設定することで行えます。

以下は、モデルをインスタンス化して使用する基本的な例です。

```typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  // API キーを直接提供するか、環境変数 OPEN_ROUTER_API_KEY を使用します
  apiKey: "your-api-key", // 環境変数に設定されている場合はオプションです
  // モデルを指定します (デフォルトは 'openai/gpt-4o')
  model: "anthropic/claude-3-opus",
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
    text: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic.",
    model: "anthropic/claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14
    }
  }
*/
```

## ストリーミングレスポンス

リアルタイムのインタラクションが必要なアプリケーションでは、ストリーミングを有効にして、生成されるレスポンスチャンクを受け取ることができます。`invoke` メソッドで `streaming: true` オプションを設定してください。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "anthropic/claude-3-opus",
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

console.log(fullText); // 出力: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic."
console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## 複数のモデルとフォールバックの使用

`@aigne/open-router` の主要な機能の1つは、フォールバックモデルを設定する機能です。プライマリモデルが何らかの理由（例：API エラー、レート制限）で失敗した場合、システムは指定されたリスト内の次のモデルを自動的に試行します。

`fallbackModels` オプションを使用してフォールバック順序を定義できます。

```typescript
const modelWithFallbacks = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "openai/gpt-4o",
  fallbackModels: ["anthropic/claude-3-opus", "google/gemini-1.5-pro"], // フォールバック順序
  modelOptions: {
    temperature: 0.7,
  },
});

// まず gpt-4o を試行し、失敗した場合は claude-3-opus、次に gemini-1.5-pro を試行します
const fallbackResult = await modelWithFallbacks.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});
```

次の図は、フォールバックロジックを示しています。

```d2
direction: down

Your-App: {
  label: "あなたのアプリ"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE フレームワーク"
  shape: rectangle

  aigne-open-router: {
    label: "@aigne/open-router"
  }
}

OpenRouter-API: {
  label: "OpenRouter API"
  shape: rectangle
}

Model-Providers: {
  label: "モデルプロバイダー"
  shape: rectangle
  grid-columns: 3

  OpenAI: {
    label: "OpenAI\n(gpt-4o)"
    shape: cylinder
  }
  Anthropic: {
    label: "Anthropic\n(claude-3-opus)"
    shape: cylinder
  }
  Google: {
    label: "Google\n(gemini-1.5-pro)"
    shape: cylinder
  }
}

Your-App -> AIGNE-Framework.aigne-open-router: "1. invoke()"

AIGNE-Framework.aigne-open-router -> OpenRouter-API: "2. プライマリモデルを試行"
OpenRouter-API -> Model-Providers.OpenAI

Model-Providers.OpenAI -> AIGNE-Framework.aigne-open-router: {
  label: "3. 失敗"
  style: {
    stroke-dash: 2
  }
}
AIGNE-Framework.aigne-open-router -> OpenRouter-API: {
  label: "4. フォールバック1を試行"
  style: {
    stroke-dash: 2
  }
}
OpenRouter-API -> Model-Providers.Anthropic

Model-Providers.Anthropic -> AIGNE-Framework.aigne-open-router: {
  label: "5. 失敗"
  style: {
    stroke-dash: 2
  }
}
AIGNE-Framework.aigne-open-router -> OpenRouter-API: {
  label: "6. フォールバック2を試行"
  style: {
    stroke-dash: 2
  }
}
OpenRouter-API -> Model-Providers.Google

Model-Providers.Google -> AIGNE-Framework.aigne-open-router: "7. 成功"
AIGNE-Framework.aigne-open-router -> Your-App: "8. レスポンスを返す"
```