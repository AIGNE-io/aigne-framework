# Agent

AIGNE フレームワークにおいて、**`Agent`** は作業の基本単位です。これは、すべての特殊な Agent タイプに対して標準的な契約を確立する抽象クラスです。Agent は、特定のタスクを実行し、情報を処理し、システム内の他の Agent と対話できる個別のワーカーとして概念化できます。

AI モデルとの対話、データの変換、または他の Agent のチームの調整のために設計されたものであっても、すべての特殊な Agent は、この基本の `Agent` クラスからそのコア構造と動作を継承します。このアーキテクチャ原則により、フレームワーク全体の一貫性と予測可能性が保証されます。

特殊な Agent タイプに関する詳細は、[Agent のタイプ](./developer-guide-agents.md)のセクションで確認できます。

## コアコンセプト

`Agent` クラスは、そのアイデンティティ、データコントラクト、および運用動作を定義するいくつかのコアコンセプトを中心に設計されています。これらは、Agent のインスタンス化中に `AgentOptions` オブジェクトを介して設定されます。

### 主要なプロパティ

以下のプロパティは、Agent の設定を定義します。

| プロパティ | タイプ | 説明 |
| :--- | :--- | :--- |
| `name` | `string` | Agent の一意の識別子で、ロギングと参照に使用されます。指定されない場合、デフォルトでコンストラクタのクラス名が使用されます。 |
| `description` | `string` | Agent の目的と能力を人間が読める形式でまとめたもので、ドキュメント作成やデバッグに役立ちます。 |
| `inputSchema` | `ZodType` | Agent の入力データの構造と検証ルールを定義する Zod スキーマ。これにより、データの整合性が保証されます。 |
| `outputSchema` | `ZodType` | Agent の出力データの構造と検証ルールを定義する Zod スキーマ。 |
| `skills` | `Agent[]` | この Agent が委任されたサブタスクを実行するために呼び出すことができる他の Agent のリスト。これにより、構成的な動作が可能になります。 |
| `memory` | `MemoryAgent` | Agent が複数の対話にわたって状態を永続化し、呼び出すことを可能にするオプションのメモリユニット。 |
| `hooks` | `AgentHooks[]` | 実行時に Agent の動作を監視または変更するためのライフサイクルフック（例：`onStart`、`onEnd`）のセット。 |
| `guideRails` | `GuideRailAgent[]` | Agent の入力と出力にルール、ポリシー、または制約を適用する特殊な Agent のリスト。 |

### `process` メソッド

`process` メソッドは、すべての Agent の中心的なコンポーネントです。これは基本の `Agent` クラスで `abstract` メソッドとして定義されており、具象 Agent クラスは実装を提供する必要があります。このメソッドには、Agent が何を行うかを定義するコアロジックが含まれています。

このメソッドは、検証済みの入力メッセージと実行 `Context` を含む呼び出しオプションを受け取り、出力を生成する責任を負います。

```typescript Agent.ts icon=logos:typescript
export abstract class Agent<I extends Message = any, O extends Message = any> {
  // ... コンストラクタおよびその他のプロパティ

  /**
   * Agent のコア処理メソッド。サブクラスで実装する必要があります
   *
   * @param input 入力メッセージ
   * @param options Agent 呼び出しのオプション
   * @returns 処理結果
   */
  abstract process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>>;

  // ... その他のメソッド
}
```

戻り値である `AgentProcessResult` は、直接的なオブジェクト、ストリーミングレスポンス、非同期ジェネレータ、またはタスク転送のための別の Agent インスタンスにすることができます。

## Agent のライフサイクル

Agent の実行は構造化されたライフサイクルに従い、フックを介した拡張のための明確なポイントを提供します。

```d2
direction: down

Agent-Lifecycle: {
  label: "Agent 実行ライフサイクル"
  style: {
    stroke-dash: 4
  }

  invoke: {
    label: "1. invoke(input)"
    shape: oval
  }

  on-start: {
    label: "2. onStart フック"
    shape: rectangle
  }

  input-validation: {
    label: "3. 入力は有効か？"
    shape: diamond
  }

  process: {
    label: "4. process(input)"
    shape: rectangle
    style.fill: "#e6f7ff"
  }

  output-validation: {
    label: "5. 出力は有効か？"
    shape: diamond
  }

  on-end: {
    label: "6. onEnd フック\n(成功またはエラーを処理)"
    shape: rectangle
  }

  return-value: {
    label: "7. 出力を返すかエラーをスロー"
    shape: oval
  }
}

Agent-Lifecycle.invoke -> Agent-Lifecycle.on-start
Agent-Lifecycle.on-start -> Agent-Lifecycle.input-validation
Agent-Lifecycle.input-validation -> Agent-Lifecycle.process: "はい"
Agent-Lifecycle.process -> Agent-Lifecycle.output-validation
Agent-Lifecycle.output-validation -> Agent-Lifecycle.on-end: "はい"
Agent-Lifecycle.on-end -> Agent-Lifecycle.return-value
Agent-Lifecycle.input-validation -> Agent-Lifecycle.on-end: "いいえ"
Agent-Lifecycle.output-validation -> Agent-Lifecycle.on-end: "いいえ"
```

1.  **呼び出し**: Agent の実行は、その `invoke()` メソッドを入力ペイロードで呼び出すことによって開始されます。
2.  **`onStart` フック**: `onStart` フックがトリガーされ、ロギングや入力変換などの前処理ロジックの機会が提供されます。
3.  **入力検証**: 入力データは Agent の `inputSchema` に対して自動的に検証されます。検証に失敗した場合、プロセスは中止されます。
4.  **`process()` の実行**: Agent の `process()` メソッドで定義されたコアロジックが実行されます。
5.  **出力検証**: `process()` メソッドからの結果は、Agent の `outputSchema` に対して検証されます。
6.  **`onEnd` フック**: `onEnd` フックは、最終的な出力または発生したエラーと共にトリガーされます。これは、後処理、結果のロギング、またはカスタムの失敗処理を実装するための指定されたポイントです。
7.  **戻り値**: 最終的に検証された出力が元の呼び出し元に返されます。

この体系的なライフサイクルにより、データが一貫して検証され、カスタムロジックのための明確で非侵入的な拡張ポイントが提供されます。

## 実装例

機能的な Agent を作成するには、基本の `Agent` クラスを拡張し、`process` メソッドを実装します。次の例では、2つの数値を受け取り、その合計を返す Agent を定義します。

```typescript title="adder-agent.ts" icon=logos:typescript
import { Agent, type AgentInvokeOptions, type Message } from "@aigne/core";
import { z } from "zod";

// 1. Zod を使用して入力および出力スキーマを定義し、検証を行います。
const inputSchema = z.object({
  a: z.number(),
  b: z.number(),
});

const outputSchema = z.object({
  sum: z.number(),
});

// 2. Zod スキーマから TypeScript の型を推論します。
type AddAgentInput = z.infer<typeof inputSchema>;
type AddAgentOutput = z.infer<typeof outputSchema>;

// 3. Agent を拡張してカスタム Agent クラスを作成します。
export class AddAgent extends Agent<AddAgentInput, AddAgentOutput> {
  constructor() {
    super({
      name: "AddAgent",
      description: "An agent that adds two numbers.",
      inputSchema,
      outputSchema,
    });
  }

  // 4. process メソッドにコアロジックを実装します。
  async process(input: AddAgentInput, options: AgentInvokeOptions): Promise<AddAgentOutput> {
    const { a, b } = input;
    const sum = a + b;
    return { sum };
  }
}
```

この例は、標準的な実装パターンを示しています。
1.  入力および出力データ構造のために Zod スキーマを定義します。
2.  対応する入力および出力タイプで `Agent` クラスを拡張します。
3.  スキーマやその他のメタデータを `super()` コンストラクタに提供します。
4.  Agent 固有のロジックを `process` メソッド内に実装します。

## まとめ

`Agent` クラスは、AIGNE フレームワークにおける基本的な抽象化です。これは、すべての運用ユニットに対して一貫性のある堅牢な契約を提供し、それらが識別可能であり、明確なデータスキーマに従い、予測可能な実行ライフサイクルをたどることを保証します。この共通の仕組みを抽象化することにより、フレームワークは開発者が `process` メソッド内でタスクに必要な独自のロジックの実装に専念できるようにします。

Agent が中央エンジンによってどのように実行および管理されるかの詳細については、[AIGNE](./developer-guide-core-concepts-aigne-engine.md) のドキュメントを参照してください。利用可能なさまざまな特殊な Agent の実装については、[Agent のタイプ](./developer-guide-agents.md)のセクションを参照してください。