このドキュメントでは、AIGNE フレームワークで AI 搭載の Agent を作成するためのコアコンポーネントである `AIAgent` クラスについて詳しく説明します。`AIAgent` は、大規模言語モデル (LLM) を活用して入力を処理し、複雑なタスクを実行し、インテリジェントな応答を生成します。

## 概要

`AIAgent` は、指定された言語モデルに接続してユーザーの入力を解釈し、アクションを実行する多機能な Agent です。カスタマイズ可能な指示、ツール使用（関数呼び出し）、レスポンスのストリーミングを標準でサポートしており、高度な AI アプリケーションを構築するための基盤として機能します。

主な機能は次のとおりです。
- **言語モデルとの統合**: サポートされているチャットモデル（例：OpenAI、Gemini、Claude）にシームレスに接続します。
- **カスタマイズ可能な振る舞い**: 強力なプロンプト指示を使用して、Agent の個性、目標、制約を定義します。
- **ツール使用と関数呼び出し**: API やデータベースとの対話など、特定のアクションを実行するために呼び出せるツール（スキル）を Agent に提供することで、その能力を拡張します。
- **柔軟なワークフローパターン**: 自動的なツール選択、必須のツール使用、タスクを他の Agent に指示するための特殊な「ルーター」モードなど、さまざまな実行モードをサポートします。
- **ストリーミングのサポート**: モデルによって生成されるレスポンスをストリーミングすることができ、リアルタイムアプリケーションを実現します。
- **構造化データの抽出**: モデルのストリーミング出力から構造化データ（例：JSON、YAML）を解析・抽出するように設定できます。

## コアコンセプト

これらのコアコンセプトを理解することは、`AIAgent` を効果的に使用するための鍵となります。

### 指示

`instructions` プロパティは、Agent の振る舞いをガイドする主要な方法です。単純な文字列、またはより複雑なシナリオのための `PromptBuilder` インスタンスを指定できます。これらの指示は通常、言語モデルに送信されるシステムプロンプトを構築するために使用され、会話全体のコンテキストを設定します。

**例:**
```typescript
const agent = AIAgent.from({
  name: "HaikuBot",
  instructions: "You are a poetic assistant who only responds in haikus.",
});
```

### 入力キーと出力キー

`AIAgent` は、キーを使用して入力メッセージ、モデル、出力メッセージ間でデータをマッピングします。
- `inputKey`: 入力メッセージのどのプロパティを主要なユーザーテキストとして扱うかを指定します。
- `outputKey`: モデルの最終的なテキストレスポンスが配置される出力メッセージのプロパティを定義します。デフォルトは `message` です。

**例:**
```typescript
const agent = AIAgent.from({
  inputKey: "question", // { question: "..." } のような入力を期待
  outputKey: "answer",  // { answer: "..." } のような出力を生成
  instructions: "Answer the user's question.",
});
```

### ツールの選択

`toolChoice` オプションは、Agent がスキル（ツール）をどのように利用するかを制御します。これは、アクション指向の Agent を構築するための強力な機能です。

- `AIAgentToolChoice.auto` (デフォルト): モデルがユーザーの入力に基づいてツールを呼び出すかどうかを決定します。
- `AIAgentToolChoice.none`: モデルはツールを一切呼び出しません。
- `AIAgentToolChoice.required`: モデルは利用可能なツールのいずれかを強制的に呼び出します。
- `AIAgentToolChoice.router`: Agent の唯一の目的が、リクエストを処理するための最適な単一のツール（または他の Agent）を選択し、その入力を直接ルーティングすることである特殊なモードです。

## AIAgent の作成

`AIAgent` を作成する最も簡単な方法は、静的メソッド `AIAgent.from()` を使用することです。

### 基本的な例

以下は、OpenAI モデルを使用してメッセージに応答する `AIAgent` の最小限の例です。

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 1. モデルを初期化
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. AIAgent インスタンスを作成
const assistantAgent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful and friendly assistant.",
});

// 3. AIGNE ランタイムを初期化
const aigne = new AIGNE({ model });

// 4. Agent を呼び出し
const userAgent = aigne.invoke(assistantAgent);
const result = await userAgent.invoke({ message: "Hello, who are you?" });

console.log(result);
// 出力: { message: "I am a helpful and friendly assistant. How can I assist you today?" }
```

### ツールを持つ Agent

Agent をより強力にするために、`skills` (ツール) を提供することができます。この例では、`Calculator` Agent を作成し、それを主要な `Assistant` Agent のスキルとして提供します。

```typescript
import { AIAgent, AIGNE, Skill } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o",
});

// 1. 計算用のスキル（ツール）を定義
const calculatorSkill = Skill.from({
  name: "calculator",
  description: "A simple calculator for basic arithmetic operations.",
  input: z.object({
    expression: z.string().describe("The mathematical expression to evaluate, e.g., '2+2'"),
  }),
  func: async ({ expression }) => {
    // 実際のシナリオでは、安全な評価ライブラリを使用
    return { result: eval(expression) };
  },
});

// 2. スキルを持つ Agent を作成
const assistantAgent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant. Use the calculator tool for any math questions.",
  skills: [calculatorSkill],
  toolChoice: "auto", // モデルが電卓をいつ使用するかを決定
});

const aigne = new AIGNE({ model });
const userAgent = aigne.invoke(assistantAgent);

// Agent は自動的に電卓ツールを使用
const result = await userAgent.invoke({ message: "What is 127 + 345?" });

console.log(result);
// 出力: { message: "127 + 345 is 472." }
```

## AIAgent のワークフロー

以下の図は、`AIAgent` がリクエストを処理する際の内部プロセスを示しており、言語モデルとの対話やツールの実行方法も含まれています。

```d2
direction: down

User: {
  shape: c4-person
}

AIAgent: {
  label: "AIAgent の内部ワークフロー"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Input-Message: {
    label: "入力メッセージ\n{ [inputKey]: '...' }"
    shape: rectangle
  }

  Prompt-Builder: {
    label: "プロンプトの構築\n(入力 + 指示 + スキル)"
    shape: rectangle
  }

  Tool-Executor: {
    label: "ツールの実行"
    shape: rectangle
  }

  Skill-Library: {
    label: "スキルライブラリ"
    shape: cylinder
  }

  Response-Formatter: {
    label: "最終レスポンスのフォーマット\n(outputKey へのマッピング)"
    shape: rectangle
  }

  Output-Message: {
    label: "出力メッセージ\n{ [outputKey]: '...' }"
    shape: rectangle
  }
}

LLM: {
  label: "LLM (チャットモデル)"
  shape: rectangle
}

Tool-Decision: {
  label: "ツールの呼び出しが必要か？"
  shape: diamond
}

User -> AIAgent.Input-Message: "1. Agent の呼び出し"
AIAgent.Input-Message -> AIAgent.Prompt-Builder
AIAgent.Prompt-Builder -> LLM: "2. リクエストの送信"
LLM -> Tool-Decision: "3. モデルの応答"
Tool-Decision -> AIAgent.Tool-Executor: "はい"
AIAgent.Tool-Executor -> AIAgent.Skill-Library: "4. スキルの検索と実行"
AIAgent.Skill-Library -> AIAgent.Tool-Executor: "結果の返却"
AIAgent.Tool-Executor -> LLM: "5. ツール結果の送信"
LLM -> AIAgent.Response-Formatter: "6. 最終レスポンスの生成"
Tool-Decision -> AIAgent.Response-Formatter: "いいえ"
AIAgent.Response-Formatter -> AIAgent.Output-Message: "7. 出力のフォーマット"
AIAgent.Output-Message -> User: "8. 結果の返却"

```