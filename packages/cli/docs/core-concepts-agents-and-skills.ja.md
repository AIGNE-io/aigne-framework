---
labels: ["Reference"]
---

# Agent とスキル

AIGNE エコシステムにおいて、Agent とスキルは、AI アプリケーションに命を吹き込む基本的な構成要素です。これらは連携して、ツールで拡張された高度な AI システムを作成します。Agent は推論と会話を担当する脳、スキルはアクションを実行し、外部世界と対話するために使用するツールだと考えてください。

このセクションでは、これらの中核となるコンポーネントの定義と構造について説明します。プロジェクトでこれらを連携させる方法の詳細については、[プロジェクト設定 (aigne.yaml)](./core-concepts-project-configuration.md) のドキュメントを参照してください。

## Agent

Agent は、ユーザーの入力を処理し、コンテキストを維持し、どのアクションを実行するかを決定する中心的なコンポーネントです。その動作は、一連の指示（コアプロンプト）と、アクセスできるスキルのコレクションによって定義されます。

Agent は通常、`.yaml` ファイルで定義されます。

### Agent の定義例

以下は、コード実行スキルを備えたチャット Agent の基本的な例です。

```yaml chat.yaml icon=mdi:robot-outline
name: chat
description: チャット Agent
instructions: |
  あなたは、幅広いトピックに関する質問に答え、情報を提供できる役立つアシスタントです。
  あなたの目標は、ユーザーが必要な情報を見つけるのを手助けし、フレンドリーな会話をすることです。
input_key: message
memory: true
skills:
  - sandbox.js
```

### Agent のプロパティ

Agent の動作は、その YAML 定義ファイル内のいくつかの主要なプロパティによって設定されます。

| プロパティ | 型 | 説明 |
|----------------|-----------|---------------------------------------------------------------------------------------------------------|
| `name` | `string` | Agent の短く、説明的な名前。 |
| `description` | `string` | Agent の目的についてのより詳細な説明。 |
| `instructions` | `string` | Agent の個性、目標、制約を定義するシステムプロンプト。これがその中核ロジックです。 |
| `input_key` | `string` | 主要なユーザーメッセージを含む入力オブジェクト内のプロパティ名（例：`message`）。 |
| `memory` | `boolean` | `true` の場合、Agent は会話履歴を保持し、フォローアップの質問やコンテキストを可能にします。 |
| `skills` | `array` | Agent が使用を許可されているスキルファイルのリスト（例：`sandbox.js`）。 |

## スキル

スキルは、通常 JavaScript で書かれた実行可能な関数で、Agent に特定の機能を提供します。これには、コードの実行、API からのデータ取得、ファイルシステムとの対話など、あらゆるものが含まれます。スキルは、大規模言語モデルの推論と具体的なタスクの実行との間の架け橋です。

### スキルの定義例

スキルは、デフォルトの非同期関数をエクスポートする標準的な Node.js モジュールです。重要なのは、その目的を説明し、入出力構造を定義するメタデータもエクスポートすることです。これにより、Agent はそれをいつ、どのように使用するかを理解できます。

```javascript sandbox.js icon=logos:javascript
import vm from "node:vm";

export default async function evaluateJs({ code }) {
  const sandbox = {};
  const context = vm.createContext(sandbox);
  const result = vm.runInContext(code, context, { displayErrors: true });
  return { result };
}

evaluateJs.description = "この Agent は JavaScript コードを評価します。";

evaluateJs.input_schema = {
  type: "object",
  properties: {
    code: { type: "string", description: "評価する JavaScript コード" },
  },
  required: ["code"],
};

evaluateJs.output_schema = {
  type: "object",
  properties: {
    result: { type: "any", description: "評価されたコードの結果" },
  },
  required: ["result"],
};
```

### スキルの構造

スキルファイルは、主に 3 つの部分で構成されます。

1.  **デフォルトでエクスポートされる関数**: スキルの中核ロジックです。これは引数のオブジェクトを受け取り、結果を返す `async` 関数です。
2.  **`description`**: 関数に添付された文字列プロパティで、スキルが何をするかを自然言語で説明します。Agent の基盤となる LLM は、この説明を使用して、このスキルを呼び出すのが適切かどうかを判断します。
3.  **`input_schema` / `output_schema`**: 関数の入出力に期待される構造と型を定義する JSON スキーマオブジェクト。これにより、Agent が有効な引数を提供し、結果を正しく解釈できることが保証されます。

## 連携の仕組み

ユーザー、Agent、スキルの間の相互作用は、明確なパターンに従います。Agent は知的なオーケストレーターとして機能し、ユーザーの要求を解釈して、それを満たすために適切なスキルを呼び出します。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Runtime: {
  label: "AIGNE ランタイム"
  shape: rectangle

  Chat-Agent: {
    label: "チャット Agent"
  }

  Sandbox-Skill: {
    label: "サンドボックススキル (sandbox.js)"
  }
}

User -> AIGNE-Runtime.Chat-Agent: "1. 入力: '5 + 7 は？'"
AIGNE-Runtime.Chat-Agent -> AIGNE-Runtime.Chat-Agent: "2. LLM が計算が必要だと判断"
AIGNE-Runtime.Chat-Agent -> AIGNE-Runtime.Sandbox-Skill: "3. { code: '5 + 7' } でスキルを呼び出す"
AIGNE-Runtime.Sandbox-Skill -> AIGNE-Runtime.Sandbox-Skill: "4. サンドボックス内でコードを実行"
AIGNE-Runtime.Sandbox-Skill -> AIGNE-Runtime.Chat-Agent: "5. { result: 12 } を返す"
AIGNE-Runtime.Chat-Agent -> User: "6. 応答を生成: '結果は 12 です。'"
```

推論（Agent）と実行（スキル）を分離することで、保守とアップグレードが容易な、強力で拡張性のある AI システムを構築できます。

### 次のステップ

Agent とスキルのコアコンセプトを理解したところで、次のセクションに進むことができます。

<x-cards>
  <x-card data-title="プロジェクト設定 (aigne.yaml)" data-icon="lucide:file-cog" data-href="/core-concepts/project-configuration">
    メインのプロジェクト設定ファイルで Agent、スキル、モデルを設定する方法を学びます。
  </x-card>
  <x-card data-title="カスタム Agent の作成" data-icon="lucide:wand-sparkles" data-href="/guides/creating-a-custom-agent">
    ステップバイステップのガイドに従って、独自のカスタム Agent を構築し、スキルとして統合します。
  </x-card>
</x-cards>