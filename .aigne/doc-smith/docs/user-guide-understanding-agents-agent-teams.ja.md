# チーム Agent

`TeamAgent` は、他の Agent のグループ（「スキル」と呼ばれる）を組織化して複雑なタスクを実行する、特殊な Agent です。これらの Agent がどのように連携するかを管理し、それらの間の情報の流れを処理します。

`TeamAgent` は、スキルを実行するために主に 2 つの方法で設定できます。
- **シーケンシャルモード**: Agent は次々と実行され、ある Agent の出力が次の Agent への入力となります。これは、複数ステップのワークフローを作成するのに最適です。
- **パラレルモード**: すべての Agent が同じ入力で同時に実行され、その出力は結合されます。これは、複数の独立した情報を一度に生成する必要があるタスクに役立ちます。

基本的なオーケストレーションに加えて、`TeamAgent` は次のような高度な機能を提供します。
- **反復**: 入力配列の各項目を自動的に処理します。これはバッチ処理に役立ちます。
- **リフレクション**: 「レビュー担当者」 Agent を使用して、チームの出力が特定の基準を満たすまで検証し、反復的に改良することで、自己修正ワークフローを可能にします。

これらの機能の組み合わせにより、`TeamAgent` は、複雑で、複数ステップにわたり、データ集約的な操作を処理できる、洗練されたマルチ Agent システムを構築するための強力なツールとなります。

## 仕組み

`TeamAgent` は入力を受け取り、設定されたモードに従ってスキル Agent のチームにそれを渡し、そして結果を最終出力に集約します。以下の図は、さまざまな処理フローを示しています。

```d2
direction: down

Input

TeamAgent: {
  label: "チーム Agent のオーケストレーション"
  shape: rectangle
  style.stroke-dash: 2

  Sequential-Mode: {
    label: "シーケンシャルモード"
    shape: rectangle
    style.fill: "#f0f8ff"
    Skill-A: "スキル A"
    Skill-B: "スキル B"
    Skill-C: "スキル C"
    Skill-A -> Skill-B -> Skill-C
  }

  Parallel-Mode: {
    label: "パラレルモード"
    shape: rectangle
    style.fill: "#f0fff0"
    Skill-X: "スキル X"
    Skill-Y: "スキル Y"
    Skill-Z: "スキル Z"
    Combine-Results: "結果を結合"
    Skill-X -> Combine-Results
    Skill-Y -> Combine-Results
    Skill-Z -> Combine-Results
  }

  Advanced-Workflow: {
    label: "高度なワークフロー（リフレクションと反復）"
    shape: rectangle
    style.fill: "#fff8f0"
    Process-Item: {
      label: "入力配列の各項目について..."
      shape: rectangle
      style.stroke-dash: 2
      Team-Execution: "チームの実行\n（シーケンシャルまたはパラレル）"
      Initial-Output: "初期出力"
      Reviewer-Agent: "レビュー担当 Agent"
      Meets-Criteria: {
        label: "基準を満たすか？"
        shape: diamond
      }
      Team-Execution -> Initial-Output
      Initial-Output -> Reviewer-Agent
      Reviewer-Agent -> Meets-Criteria
      Meets-Criteria -> Team-Execution: "いいえ、改良"
    }
  }
}

Final-Output

Input -> TeamAgent.Sequential-Mode.Skill-A: "単一入力"
TeamAgent.Sequential-Mode.Skill-C -> Final-Output

Input -> TeamAgent.Parallel-Mode.Skill-X
Input -> TeamAgent.Parallel-Mode.Skill-Y
Input -> TeamAgent.Parallel-Mode.Skill-Z
TeamAgent.Parallel-Mode.Combine-Results -> Final-Output

Input -> TeamAgent.Advanced-Workflow.Process-Item.Team-Execution: "入力配列"
TeamAgent.Advanced-Workflow.Process-Item.Meets-Criteria -> Final-Output: "はい"

```

## 設定

`TeamAgent` は、以下のオプションを使用して設定できます。

### 基本設定

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="Agent の一意の識別子。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="Agent の目的の簡単な説明。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="このチームがオーケストレーションする Agent インスタンスの配列。"></x-field>
  <x-field data-name="mode" data-type="ProcessMode" data-default="sequential" data-desc="処理モード。ステップバイステップ実行の場合は `sequential`、同時実行の場合は `parallel` になります。"></x-field>
  <x-field data-name="input_schema" data-type="object" data-required="false" data-desc="期待される入力形式を定義する JSON スキーマ。"></x-field>
  <x-field data-name="output_schema" data-type="object" data-required="false" data-desc="期待される出力形式を定義する JSON スキーマ。"></x-field>
</x-field-group>

### 高度な機能

<x-field-group>
    <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="出力品質を向上させるための反復的なレビューと改良のプロセスを有効にします。詳細はリフレクションのセクションを参照してください。"></x-field>
    <x-field data-name="iterateOn" data-type="string" data-required="false" data-desc="反復処理する入力フィールドの名前（配列である必要があります）。配列の各項目はチームによって個別に処理されます。"></x-field>
    <x-field data-name="concurrency" data-type="number" data-default="1" data-desc="`iterateOn` を使用する場合、並列処理する項目の最大数を設定します。"></x-field>
    <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-desc="`true` の場合、`iterateOn` 配列のある項目の処理からの出力がマージされ、次の項目の処理で利用可能になります。`concurrency` が 1 である必要があります。"></x-field>
    <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-desc="`sequential` モードで `true` の場合、最後のエージェントだけでなく、すべての中間 Agent からの出力が最終結果に含まれます。デバッグに役立ちます。"></x-field>
</x-field-group>

---

## コアコンセプト

### 処理モード

`mode` プロパティは、チーム内の Agent（スキル）の実行フローを決定します。

#### シーケンシャルモード

`sequential` モードでは、Agent は `skills` 配列で定義された順序で次々と実行されます。各 Agent からの出力は、元の入力および以前のすべての Agent の出力とマージされ、チェーン内の次の Agent の入力を形成します。

このモードは、データ処理、分析、レポート作成のパイプラインなど、各ステップが前のステップに基づいて構築されるワークフローを構築するのに最適です。

**フローの例（`sequential`）：**
1.  **Agent 1** が初期入力 `{ "topic": "AI" }` を受け取ります。
2.  **Agent 1** が出力 `{ "research": "..." }` を生成します。
3.  **Agent 2** がマージされた入力 `{ "topic": "AI", "research": "..." }` を受け取ります。
4.  **Agent 2** が出力 `{ "summary": "..." }` を生成します。
5.  最終的な出力は `{ "topic": "AI", "research": "...", "summary": "..." }` です。

#### パラレルモード

`parallel` モードでは、`skills` 配列内のすべての Agent が同時に実行されます。各 Agent はまったく同じ初期入力を受け取ります。その後、それらの出力が結合されて最終結果が形成されます。複数の Agent が同じキーを持つ出力を生成した場合、システムはどの Agent がそのキーを「所有」するかを決定して競合を回避します。

このモードは、異なるソースからの情報収集や同じデータセットに対する異なる分析の実行など、複数の独立した作業を同時に行えるタスクに効率的です。

**フローの例（`parallel`）：**
1.  **Agent A** と **Agent B** の両方が初期入力 `{ "company": "Initech" }` を受け取ります。
2.  **Agent A** が `{ "financials": "..." }` を生成します。
3.  **Agent B** が `{ "news": "..." }` を生成します。
4.  最終的な出力は両方の組み合わせです：`{ "financials": "...", "news": "..." }`。

### 反復

`iterateOn` 機能はバッチ処理を可能にします。配列を含む入力フィールドを指定することで、`TeamAgent` にその配列の各項目に対してワークフロー全体（シーケンシャルまたはパラレル）を実行するように指示できます。

-   **`concurrency`**: 一度に処理する項目の数を制御できます。たとえば、`concurrency: 5` は配列から 5 つの項目を並列で処理します。
-   **`iterateWithPreviousOutput`**: `true` に設定されている場合（かつ `concurrency` が 1 の場合）、項目 `N` の処理からの出力は項目 `N+1` のデータにマージされます。これにより、物語の構築や一連のイベントの要約など、各ステップが最後のステップに依存するタスクに役立つ累積効果が生まれます。

**YAML の例（`iterateOn`）**
この設定では、`sections` 入力フィールドからの配列を、同時実行数 2 で処理します。

```yaml
# sourceId: packages/core/test-agents/team.yaml
type: team
name: test-team-agent
description: テストチーム Agent
skills:
  - sandbox.js
  - chat.yaml
mode: parallel
input_schema:
  type: object
  properties:
    sections:
      type: array
      description: 反復処理するセクション
      items:
        type: object
        properties:
          title:
            type: string
          description:
            type: string
output_schema:
  type: object
  properties:
    sections:
      type: array
      description: 各セクションからの結果
      items:
        type: object
        properties:
          title:
            type: string
          description:
            type: string
iterate_on: sections
concurrency: 2
iterate-with-previous-output: false
include-all-steps-output: true
```

### リフレクション

リフレクションは、自己修正と品質管理のメカニズムを提供します。有効にすると、`TeamAgent` の初期出力が指定された `reviewer` Agent に渡されます。このレビュー担当者は、一連の基準に対して出力を評価します。

-   出力が承認されると、プロセスは終了します。
-   出力が承認されない場合、レビュー担当者のフィードバックがコンテキストに追加され、元の Agent のチームが再度実行されて修正された出力が生成されます。

このループは、出力が承認されるか、`maxIterations` の制限に達するまで続きます。

`reflection` の設定には以下が必要です。
<x-field-group>
    <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="チームの出力を評価する責任を持つ Agent。"></x-field>
    <x-field data-name="isApproved" data-type="string | (output: Message) => boolean" data-required="true" data-desc="出力が承認されたかどうかを判断するための条件。レビュー担当者の出力のフィールド名（例：`is_complete`）または承認時に `true` を返す関数にすることができます。"></x-field>
    <x-field data-name="maxIterations" data-type="number" data-default="3" data-desc="停止するまでのレビューと改良のサイクルの最大数。"></x-field>
    <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-desc="`true` の場合、`maxIterations` に達しても承認されなかった場合でも、Agent は最後に生成された出力を返します。`false` の場合、エラーがスローされます。"></x-field>
</x-field-group>

この機能は、高い精度、特定の形式への準拠、または別の Agent によって自動化できる複雑な検証を必要とするタスクに強力です。