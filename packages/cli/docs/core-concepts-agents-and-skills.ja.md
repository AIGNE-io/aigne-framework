---
labels: ["Reference"]
---

---
labels: ["リファレンス"]
---

# Agentとスキル

AIGNEエコシステムにおいて、AgentとスキルはAIアプリケーションを具現化するための基本的な構成要素です。これらは連携して、洗練されたツール拡張型AIシステムを構築します。Agentを推論と会話を担当する「脳」と考えるなら、スキルはアクションを実行し、外部世界と対話するための「ツール」と考えることができます。

このセクションでは、これらのコアコンポーネントの定義と構造について説明します。プロジェクトでこれらを連携させる方法の詳細については、[プロジェクト設定 (aigne.yaml)](./core-concepts-project-configuration.md) のドキュメントを参照してください。

## Agent

Agentは、ユーザー入力を処理し、コンテキストを維持し、実行するアクションを決定する中心的なコンポーネントです。その振る舞いは、一連の指示（コアプロンプト）と、アクセス可能なスキルの集合によって定義されます。

Agentは通常、`.yaml`ファイルで定義されます。

### Agent定義の例

これは、コード実行スキルを備えたチャットAgentの基本的な例です。

```yaml chat.yaml icon=mdi:robot-outline
name: chat
description: チャットAgent
instructions: |
  あなたは、質問に答えたり、幅広いトピックに関する情報を提供したりできる、役立つアシスタントです。
  あなたの目標は、ユーザーが必要な情報を見つけるのを助け、フレンドリーな会話をすることです。
input_key: message
memory: true
skills:
  - sandbox.js
```

### Agentのプロパティ

Agentの振る舞いは、そのYAML定義ファイル内のいくつかの主要なプロパティを通じて設定されます：

| Property       | Type      | Description                                                                                             |
|----------------|-----------|---------------------------------------------------------------------------------------------------------|
| `name`         | `string`  | Agentの短く、説明的な名前。                                                                              |
| `description`  | `string`  | Agentの目的についてのより詳細な説明。                                                                    |
| `instructions` | `string`  | Agentの性格、目標、制約を定義するシステムプロンプト。これがそのコアロジックです。                      |
| `input_key`    | `string`  | 入力オブジェクト内で、主要なユーザーメッセージを含むプロパティの名前（例：`message`）。                  |
| `memory`       | `boolean` | `true`の場合、Agentは会話履歴を保持し、フォローアップの質問や文脈を維持できます。                        |
| `skills`       | `array`   | Agentが使用を許可されているスキルファイルのリスト（例：`sandbox.js`）。                                  |

## スキル

スキルは、Agentに特定の能力を提供する実行可能な関数で、通常はJavaScriptで記述されます。これには、コードの実行、APIからのデータ取得、ファイルシステムとの対話など、あらゆるものが含まれます。スキルは、大規模言語モデルの推論と具体的なタスクの実行との間の架け橋となります。

### スキル定義の例

スキルは、デフォルトの非同期関数をエクスポートする標準的なNode.jsモジュールです。重要な点として、スキルはその目的を記述し、入出力構造を定義するメタデータもエクスポートします。これにより、Agentはスキルをいつ、どのように使用するかを理解できます。

```javascript sandbox.js icon=logos:javascript
import vm from "node:vm";

export default async function evaluateJs({ code }) {
  const sandbox = {};
  const context = vm.createContext(sandbox);
  const result = vm.runInContext(code, context, { displayErrors: true });
  return { result };
}

evaluateJs.description = "このスキルはJavaScriptコードを評価します。";

evaluateJs.input_schema = {
  type: "object",
  properties: {
    code: { type: "string", description: "評価するJavaScriptコード" },
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

スキルファイルは、主に3つの部分で構成されています：

1.  **デフォルトエクスポートされた関数**: スキルのコアロジック。引数のオブジェクトを受け取り、結果を返す`async`関数です。
2.  **`description`**: 関数に付加される文字列プロパティで、スキルが何をするかを自然言語で説明します。Agentの基盤となるLLMは、この説明を使用して、このスキルを呼び出すのが適切かどうかを判断します。
3.  **`input_schema` / `output_schema`**: 関数の入力と出力に期待される構造と型を定義するJSONスキーマオブジェクト。これにより、Agentが有効な引数を提供し、結果を正しく解釈できることが保証されます。

## 連携の仕組み

ユーザー、Agent、スキルの間の相互作用は、明確なパターンに従います。Agentはインテリジェントなオーケストレーターとして機能し、ユーザーのリクエストを解釈して、それを実行するために適切なスキルを呼び出します。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Runtime: {
  label: "AIGNEランタイム"
  shape: rectangle

  Chat-Agent: {
    label: "チャットAgent"
  }

  Sandbox-Skill: {
    label: "サンドボックススキル (sandbox.js)"
  }
}

User -> AIGNE-Runtime.Chat-Agent: "1. 入力: '5 + 7は？'"
AIGNE-Runtime.Chat-Agent -> AIGNE-Runtime.Chat-Agent: "2. LLMが計算が必要だと推論"
AIGNE-Runtime.Chat-Agent -> AIGNE-Runtime.Sandbox-Skill: "3. { code: '5 + 7' } でスキルを呼び出し"
AIGNE-Runtime.Sandbox-Skill -> AIGNE-Runtime.Sandbox-Skill: "4. サンドボックスでコードを実行"
AIGNE-Runtime.Sandbox-Skill -> AIGNE-Runtime.Chat-Agent: "5. { result: 12 } を返す"
AIGNE-Runtime.Chat-Agent -> User: "6. 応答を生成: '結果は12です。'"
```

推論（Agent）と実行（スキル）を分離することで、保守やアップグレードが容易で、強力かつ拡張可能なAIシステムを構築できます。

### 次のステップ

Agentとスキルのコアコンセプトを理解したところで、次のセクションに進むことができます：

<x-cards>
  <x-card data-title="プロジェクト設定 (aigne.yaml)" data-icon="lucide:file-cog" data-href="/core-concepts/project-configuration">
    メインのプロジェクト設定ファイルでAgent、スキル、モデルを設定する方法を学びます。
  </x-card>
  <x-card data-title="カスタムAgentの作成" data-icon="lucide:wand-sparkles" data-href="/guides/creating-a-custom-agent">
    ステップバイステップのガイドに従って、独自のカスタムAgentを構築し、それをスキルとして統合します。
  </x-card>
</x-cards>
