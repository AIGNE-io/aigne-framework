このドキュメントは、AIGNE フレームワークのコアコンセプトに関する開発者向けガイドです。基本的な構成要素、それらの相互作用、そして全体的なアーキテクチャについて説明し、エンジニアがこのシステムを効果的に構築し、統合できるようにします。

### AIGNE フレームワークのコアコンセプト

AIGNE フレームワークは、中心的なコンポーネントである **Agent** を中心に設計されています。Agent とその関連コンセプトを理解することが、このプラットフォームの全能力を最大限に活用する鍵となります。このガイドでは、Agent のライフサイクルから、スキルやメモリといった強力な合成機能まで、不可欠な構成要素を順を追って説明します。

### Agent とは何か？

Agent は、AIGNE エコシステムにおける基本的なアクタです。入力を処理し、意思決定を行い、構造化された出力を生成することによって特定のタスクを実行するように設計された自律的なエンティティです。各 Agent は、独自のロジック、設定、および能力をカプセル化します。

すべての Agent の基盤となるのは、`packages/core/src/agents/agent.ts` で定義されている `Agent` クラスです。これは、以下のためのコア構造を提供します：

-   **入力および出力スキーマ**：Zod スキーマ（`inputSchema`、`outputSchema`）を使用してデータの整合性を保証します。
-   **コア処理ロジック**：抽象メソッド `process` は、Agent の固有の振る舞いを定義するためにサブクラスで実装する必要があります。
-   **ライフサイクルフック**：Agent の実行のさまざまな段階（例：`onStart`、`onEnd`）で機能をインターセプトして追加するメカニズム。
-   **スキルとメモリ**：複雑な振る舞いを構成し、状態を維持するための機能。

```typescript
// packages/core/src/agents/agent.ts

export abstract class Agent<I extends Message = any, O extends Message = any> {
  // ...
  abstract process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>>;
  // ...
}
```

### Agent のライフサイクル

すべての Agent は、呼び出されると明確に定義されたライフサイクルに従います。このライフサイクルは、一貫した実行、検証、および可観測性を保証します。`invoke` メソッドは、このプロセスを開始するエントリーポイントです。

以下は、Agent ライフサイクルの主要な段階を示す図です：

```d2
direction: down

invoke: {
  label: "invoke()"
  shape: oval
}

onStart: {
  label: "onStart フック"
  shape: rectangle
}

validateInput: {
  label: "入力の検証\n(inputSchema)"
  shape: diamond
}

process: {
  label: "process() メソッド\n(コアロジック)"
  shape: rectangle
}

validateOutput: {
  label: "出力の検証\n(outputSchema)"
  shape: diamond
}

onEnd: {
  label: "onEnd フック"
  shape: rectangle
}

returnResult: {
  label: "結果を返す"
  shape: oval
}

returnError: {
  label: "エラーを返す"
  shape: oval
}

invoke -> onStart
onStart -> validateInput
validateInput -> process: "有効"
validateInput -> returnError: "無効"
process -> validateOutput
validateOutput -> onEnd: "有効"
validateOutput -> returnError: "無効"
onEnd -> returnResult
```

### Agent の特化

AIGNE フレームワークは、それぞれが特定の目的に合わせて調整された、いくつかの特化された Agent タイプを提供します。これらは `packages/core/src/loader/agent-yaml.ts` で定義されており、通常は YAML 設定ファイルの `type` プロパティで指定されます。

-   **AI Agent (`type: "ai"`)**: 最も一般的なタイプで、大規模言語モデル（LLM）と対話するように設計されています。`PromptBuilder` を使用して、指示、入力、メモリ、および利用可能なスキル（ツール）から詳細なプロンプトを構築し、モデルの応答を処理します。
-   **Team Agent (`type: "team"`)**: 他の Agent（スキル）のグループのオーケストレーターまたはマネージャーとして機能します。入力を順次、並行して、またはリフレクション（ある Agent が別の Agent の作業をレビューする）のようなより複雑なワークフローで処理できます。
-   **Function Agent (`type: "function"`)**: 任意の JavaScript/TypeScript 関数を Agent に変換する軽量ラッパーです。カスタムビジネスロジック、計算、またはサードパーティ API 呼び出しを Agent エコシステムに直接統合するのに最適です。
-   **Transform Agent (`type: "transform"`)**: JSONata クエリを使用して JSON データをある形式から別の形式に再構築または変換するユーティリティ Agent です。ある Agent の出力を別の Agent の入力要件に適合させるのに最適です。
-   **Image Agent (`type: "image"`)**: 画像生成モデルとの対話に特化しています。指示を受け取り、画像を生成します。
-   **MCP Agent (`type: "mcp"`)**: 外部システムやコマンドラインツールとの相互作用を容易にします。

### 合成：複雑なシステムの構築

AIGNE の真の力は、シンプルで特化された Agent を組み合わせて、複雑で洗練されたシステムを構築することにあります。これは、スキル、フック、メモリという 3 つの主要なメカニズムを通じて達成されます。

#### スキル

Agent は、呼び出すことができる他の Agent である**スキル**のリストを備えることができます。これにより、モジュール式で階層的な設計が可能になります。たとえば、「旅行プランナー」`TeamAgent` は、スキルとして「フライト予約」`AIAgent`、「ホテル検索」`FunctionAgent`、および「通貨換算」`TransformAgent` を使用するかもしれません。親 Agent は、適切なスキルにタスクを委任し、それらの結合された出力をオーケストレーションして複雑な目標を達成します。

```typescript
// packages/core/src/agents/agent.ts
export interface AgentOptions<I extends Message = Message, O extends Message = Message>
  extends Partial<Pick<Agent, "guideRails">> {
  // ...
  skills?: (Agent | FunctionAgentFn)[];
  // ...
}
```

#### フック

**フック**は、Agent のコアロジックを変更することなく、可観測性を確保し、Agent の振る舞いを拡張するための強力なメカニズムを提供します。これにより、Agent ライフサイクルのさまざまな段階（`onStart`、`onEnd`、`onError`、`onSkillStart` など）にカスタム機能をアタッチできます。これは、以下のような場合に役立ちます：

-   Agent 実行のロギングとトレース。
-   カスタムエラーハンドリングと再試行ロジックの実装。
-   入力または出力を動的に変更する。
-   パフォーマンスとコストの監視。

#### メモリ

Agent は、複数の呼び出しにわたって状態とコンテキストを維持するために**メモリ**を設定できます。`MemoryAgent` は、Agent の対話の入力と出力を記録できます。その後の呼び出し中に、Agent はこの履歴を取得して、過去の会話や結果を「記憶」することができます。これは、対話型 AI、マルチステップのワークフロー、および経験から学習する Agent を構築するために不可欠です。

### YAML による設定

Agent は TypeScript でプログラムによって定義および設定できますが、最も一般的なアプローチは `.yaml` ファイルで定義することです。`packages/core/src/loader/agent-yaml.ts` の `loadAgentFromYamlFile` 関数は、これらのファイルを解析し、対応する Agent オブジェクトを構築します。このように設定をロジックから分離することで、Agent の管理、共有、およびコードを変更しない修正が容易になります。

以下は、YAML で定義された `AIAgent` の簡単な例です：

```yaml
type: ai
name: Greeter
description: ユーザーに挨拶するシンプルな Agent。

instructions: "あなたはフレンドリーなアシスタントです。ユーザーの名前に基づいて挨拶し、良い一日を願ってください。"

inputSchema:
  type: object
  properties:
    name:
      type: string
      description: "挨拶する相手の名前。"
  required:
    - name

outputSchema:
  type: object
  properties:
    greeting:
      type: string
      description: "パーソナライズされた挨拶メッセージ。"
  required:
    - greeting
```

### `PromptBuilder` によるプロンプトエンジニアリング

`AIAgent` にとって、`PromptBuilder` クラス（`packages/core/src/prompt/prompt-builder.ts`）は重要なコンポーネントです。言語モデルに送信される最終的なプロンプトを動的に構築する責任を負います。以下のさまざまなコンテキストの断片をインテリジェントに組み立てます：

-   **システム指示**：Agent の設定で定義された基本指示。
-   **ユーザー入力**：現在の呼び出しに対して提供された特定の入力。
-   **メモリ**：`MemoryAgent` から取得された過去の対話。
-   **ツール/スキル**：モデルが使用を選択できる、利用可能なスキルの定義。

この洗練された組み立てにより、基盤となる AI モデルとの非常に文脈的で強力な対話が可能になります。

### 結論

AIGNE フレームワークは、**Agent** を中心に据えた堅牢で柔軟なアーキテクチャを提供します。Agent ライフサイクルを理解し、特定のタスクに合わせて Agent を特化させ、スキル、フック、メモリを使用してそれらを合成することにより、開発者は強力で複雑な自律システムを構築できます。設定に YAML を使用することで、モジュール性と管理の容易さがさらに高まります。