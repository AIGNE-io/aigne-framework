このドキュメントでは、複数のエージェントを連携させて動作させるための強力なコンポーネントである`TeamAgent`クラスについて詳しく解説します。設定、処理モード、リフレクションや反復処理などの特殊機能について説明します。

### 概要

`TeamAgent`は、エージェントのグループ（「スキル」と呼ばれる）を調整し、複雑なタスクを達成します。指定された処理モードに従ってこれらのエージェントの実行を管理し、シーケンシャル（逐次的）またはパラレル（並列）に動作させることができます。これは、あるエージェントの出力が別のエージェントの入力として機能するような洗練されたワークフローを構築する場合や、複数のタスクを同時に実行してその結果を結合する必要がある場合に特に役立ちます。

### 設定 (`TeamAgentOptions`)

`TeamAgent`を作成するには、そのコンストラクタに`TeamAgentOptions`オブジェクトを提供します。これらのオプションにより、チームの動作をカスタマイズできます。

| パラメータ | 型 | 説明 | デフォルト |
| --- | --- | --- | --- |
| `mode` | `ProcessMode` | チーム内のエージェントを処理する方法。`sequential`または`parallel`が指定できます。 | `sequential` |
| `reflection` | `ReflectionMode` | チームの出力に対する反復的なレビューと改良プロセスを有効にするための設定。 | `undefined` |
| `iterateOn` | `string` | 配列を含む入力フィールドのキー。チームは配列の各項目に対して反復処理を行います。 | `undefined` |
| `concurrency` | `number` | `iterateOn`を使用する場合の最大同時実行オペレーション数。 | `1` |
| `iterateWithPreviousOutput` | `boolean` | `true`の場合、ある反復処理の出力が次の反復処理の入力にマージされます。`concurrency`を`1`にする必要があります。 | `false` |
| `includeAllStepsOutput` | `boolean` | `true`でシーケンシャルモードの場合、すべての中間ステップの出力が最終結果に含まれます。 | `false` |

### 処理モード

`ProcessMode` enumは、チーム内のエージェントがどのように実行されるかを決定します。

#### `sequential`
このモードでは、エージェントは1つずつ処理されます。各エージェントの出力は、シーケンス内の次のエージェントへの追加の入力として渡されます。これはデフォルトのモードであり、線形ワークフローを作成するのに理想的です。

#### `parallel`
このモードでは、すべてのエージェントが同時に処理されます。各エージェントは同じ初期入力を受け取り、その出力はマージされます。このモードは、独立して実行し、その後に結合できるタスクに役立ちます。

### 主な機能

#### リフレクションモード
リフレクションモードは、チームの出力に対する反復的な自己修正と改良のメカニズムを提供します。有効にすると、指定された`reviewer`エージェントがチームの結果を評価します。出力が承認されない場合、前の出力とレビュアーのフィードバックを次の反復のコンテキストとして使用し、プロセスが繰り返されます。このサイクルは、出力が承認されるか、`maxIterations`の上限に達するまで続きます。

**設定 (`ReflectionMode`)**

| パラメータ | 型 | 説明 |
| --- | --- | --- |
| `reviewer` | `Agent` | チームの出力をレビューし、フィードバックを提供する責任を持つエージェント。 |
| `isApproved` | `((output: Message) => PromiseOrValue<boolean \| unknown>) \| string` | 結果が承認されたかどうかを判断する関数またはレビュアーの出力内のフィールド名。truthyな値は承認を示します。 |
| `maxIterations` | `number` | 停止するまでのレビュー反復の最大数。デフォルトは`3`です。 |
| `returnLastOnMaxIterations` | `boolean` | `true`の場合、`maxIterations`に達したときに、承認されていなくても最後に生成された出力を返します。`false`の場合、エラーをスローします。デフォルトは`false`です。 |

**例 (`team-agent-with-reflection.yaml`)**
```yaml
type: team
name: test-team-agent-with-reflection
description: Test team agent with reflection
skills:
  - chat.yaml
reflection:
  reviewer: team-agent-reviewer.yaml
  is_approved: approved
  max_iterations: 5
  return_last_on_max_iterations: true
```

#### 反復処理 (`iterateOn`)

`iterateOn`機能により、`TeamAgent`は入力メッセージ内の配列に対してバッチ処理を実行できます。`iterateOn`で入力フィールドキーを指定すると、エージェントはその配列の各要素に対して反復処理を行い、チームのワークフローを通じてそれぞれを個別に処理します。

これは、ドキュメントのセクションの処理、ユーザーコメントのリストの分析、データセットのエンリッチメントなど、複数のデータ項目に同じ一連の操作を適用する必要があるシナリオで非常に効果的です。

**例 (`team.yaml`)**
この例では、`sections`配列に対して反復処理を行うように設定されたチームエージェントを示します。

```yaml
type: team
name: test-team-agent
description: Test team agent
skills:
  - sandbox.js
  - chat.yaml
mode: parallel
input_schema:
  type: object
  properties:
    sections:
      type: array
      description: Sections to iterate over
      items:
        # ... 項目のプロパティ
iterate_on: sections
concurrency: 2
iterate-with-previous-output: false
include-all-steps-output: true
```

### メソッド

#### `constructor(options: TeamAgentOptions<I, O>)`
`TeamAgent`の新しいインスタンスを作成します。

-   **パラメータ:**
    -   `options`: チームエージェントの設定オプション。

#### `process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>>`
設定された`mode`に基づいて、チームのエージェントを通じて入力メッセージをルーティングして処理します。

-   **パラメータ:**
    -   `input`: 処理するメッセージ。
    -   `options`: 呼び出しオプション。
-   **戻り値:** 最終的な応答を構成するメッセージチャンクのストリーム。

### 例

`TeamAgent`を作成する方法の例を以下に示します。

**シーケンシャルTeamAgent**
```typescript
import { TeamAgent, ProcessMode } from "./team-agent";
import { Agent } from "./agent";

const agent1 = new Agent({ /* ... */ });
const agent2 = new Agent({ /* ... */ });

const sequentialTeam = TeamAgent.from({
  skills: [agent1, agent2],
  mode: ProcessMode.sequential,
});
```

**パラレルTeamAgent**
```typescript
import { TeamAgent, ProcessMode } from "./team-agent";
import { Agent } from "./agent";

const agentA = new Agent({ /* ... */ });
const agentB = new Agent({ /* ... */ });

const parallelTeam = TeamAgent.from({
  skills: [agentA, agentB],
  mode: ProcessMode.parallel,
});
```