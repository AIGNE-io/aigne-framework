# モデル

モデルは AIGNE プラットフォームの中核をなすコンポーネントであり、さまざまなサードパーティの AI モデルと対話するための標準化されたインターフェースを提供します。このドキュメントでは、基本的なモデルアーキテクチャについて説明し、利用可能なモデルをリストアップし、その使用方法の例を示します。

## 概要

AIGNE モデルシステムは階層構造で設計されています。ベースには、あらゆる処理ユニットの基本的なインターフェースを定義する `Agent` があります。これを拡張するのが汎用的な `Model` クラスで、これはさまざまなデータ型、特にファイルコンテンツの専門的な処理を導入する抽象クラスです。

OpenAI や Anthropic などの各サードパーティ AI プロバイダーは、`Model` クラスの具象実装を持っています。例えば、`OpenAIChatModel` や `AnthropicChatModel` は、それぞれのサービスの固有の API や要件を処理する特定のクラスです。このアーキテクチャにより、さまざまなモデルを一貫した方法で使用できます。

```d2
direction: down

Agent: {
  label: "Agent\n(ベースインターフェース)"
  shape: rectangle
}

Model: {
  label: "Model\n(抽象クラス)\nファイルコンテンツを処理"
  shape: rectangle
  style: {
    stroke-dash: 4
  }
}

Concrete-Models: {
  label: "具象モデル実装"
  grid-columns: 2
  grid-gap: 100

  Chat-Models: {
    label: "チャットモデル"
    shape: rectangle
    grid-columns: 3

    OpenAIChatModel
    AnthropicChatModel
    BedrockChatModel
    DeepSeekChatModel
    GeminiChatModel
    OllamaChatModel
    OpenRouterChatModel
    XAIChatModel
    DoubaoChatModel
    PoeChatModel
    AIGNEHubChatModel
  }

  Image-Models: {
    label: "画像モデル"
    shape: rectangle
    grid-columns: 2

    OpenAIImageModel
    GeminiImageModel
    IdeogramImageModel
    DoubaoImageModel
    AIGNEHubImageModel
  }
}

Model -> Agent: "extends"
Concrete-Models.Chat-Models -> Model: "implements"
Concrete-Models.Image-Models -> Model: "implements"

```

## コアコンセプト

### 汎用モデルクラス

`packages/core/src/agents/model.ts` で定義されている抽象クラス `Model` は、すべての特定のモデル実装の基盤として機能します。その主な責務は次のとおりです:

-   **インタラクションの標準化**: 基盤となるプロバイダーに関係なく、モデルを呼び出すための一貫した API を提供します。
-   **ファイルハンドリング**: ファイルコンテンツを異なるフォーマット間で自動的に変換します。これはデータハンドリングを簡素化する主要な機能です。`Model` クラスは、ファイルデータを以下の形式で受け取ることができます:
    -   **URL**: ファイルへの公開 URL。モデルはこれをダウンロードして処理します。
    -   **ローカルファイル**: ローカルファイルシステム上のファイルへのパス。
    -   **Base64エンコード**: Base64 文字列としてエンコードされたファイルコンテンツ。

このクラスはこれらのフォーマット間の変換を管理し、データが使用されている特定のモデルに適したフォーマットであることを保証します。

## 利用可能なモデル

AIGNE は、さまざまなプロバイダーの幅広いチャットモデルおよび画像生成モデルをサポートしています。

### チャットモデル

以下の表は、テキストベースの対話のためにインスタンス化して使用できる、利用可能なチャットモデルをリストアップしたものです。

| プロバイダー / クラス名 | エイリアス | API キー環境変数 |
| :--- | :--- | :--- |
| `OpenAIChatModel` | | `OPENAI_API_KEY` |
| `AnthropicChatModel` | | `ANTHROPIC_API_KEY` |
| `BedrockChatModel` | | `AWS_ACCESS_KEY_ID` |
| `DeepSeekChatModel` | | `DEEPSEEK_API_KEY` |
| `GeminiChatModel` | `google` | `GEMINI_API_KEY`, `GOOGLE_API_KEY` |
| `OllamaChatModel` | | `OLLAMA_API_KEY` |
| `OpenRouterChatModel`| | `OPEN_ROUTER_API_KEY` |
| `XAIChatModel` | | `XAI_API_KEY` |
| `DoubaoChatModel` | | `DOUBAO_API_KEY` |
| `PoeChatModel` | | `POE_API_KEY` |
| `AIGNEHubChatModel` | | `AIGNE_HUB_API_KEY` |

### 画像モデル

以下の表は、ビジュアルコンテンツを生成するために利用可能な画像モデルをリストアップしたものです。

| プロバイダー / クラス名 | エイリアス | API キー環境変数 |
| :--- | :--- | :--- |
| `OpenAIImageModel` | | `OPENAI_API_KEY` |
| `GeminiImageModel` | `google` | `GEMINI_API_KEY` |
| `IdeogramImageModel` | | `IDEOGRAM_API_KEY` |
| `DoubaoImageModel` | | `DOUBAO_API_KEY` |
| `AIGNEHubImageModel` | | `AIGNE_HUB_API_KEY` |

## 使用方法

サポートされているモデルのいずれかを簡単にインスタンス化して使用できます。システムは、プロバイダー文字列に基づいて正しいモデルを見つけてロードするためのヘルパー関数を提供します。

### モデル識別子の解析

モデルは通常、`provider/model_name` の形式の文字列で識別されます。例えば、`openai/gpt-4o` です。`parseModel` ユーティリティを使用して、この文字列を構成要素に分割できます。

```typescript
import { parseModel } from "models/aigne-hub/src/utils/model.ts";

const { provider, model } = parseModel("openai/gpt-4o");

console.log(provider); // "openai"
console.log(model);    // "gpt-4o"
```

### モデルの検索と作成

`findModel` 関数を使用すると、利用可能なモデルのリストから正しいモデルクラスを見つけることができます。その後、一致したモデルの `create` メソッドを使用してインスタンス化できます。

この例では、プロバイダー名でモデルを検索し、そのインスタンスを作成する方法を示します。

```typescript
import { findModel, parseModel } from "models/aigne-hub/src/utils/model.ts";

// 完全なモデル識別子文字列
const modelIdentifier = "openai/gpt-4o";

// 1. 識別子を解析してプロバイダーとモデル名を取得
const { provider, model: modelName } = parseModel(modelIdentifier);

// 2. 対応する読み込み可能なモデル設定を検索
const { match } = findModel(provider);

if (match) {
  // 3. モデルのインスタンスを作成
  const chatModel = match.create({
    model: modelName,
    // modelOptions を使用して追加のパラメータを渡すことができます
    modelOptions: {
      temperature: 0.7,
    },
    // API キーを直接渡すことも可能ですが、
    // 環境変数を使用することが推奨されます。
    // apiKey: "sk-...",
  });

  // これで chatModel インスタンスを使用して API コールを行うことができます
  console.log(`Successfully created model: ${chatModel.constructor.name}`);
} else {
  console.error(`Model provider "${provider}" not found.`);
}
```

このモジュール式のアプローチにより、最小限のコード変更で異なる AI モデル間を簡単に切り替えることができ、アプリケーションの柔軟性と再利用性が向上します。