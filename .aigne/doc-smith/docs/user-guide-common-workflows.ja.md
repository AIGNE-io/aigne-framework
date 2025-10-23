# 一般的なワークフロー

AIGNE フレームワークでは、単一の Agent が特定のタスクを実行できます。しかし、システムの真価は、複数の Agent が協力してより複雑な問題を解決するときに発揮されます。チームのメンバーのように、Agent は構造化された方法で連携するように組織化できます。これらの協力のパターンは「ワークフロー」と呼ばれます。

ワークフローは、より大きな目標を達成するために、異なる Agent 間でタスクと情報がどのように流れるかを定義します。Agent をさまざまなパターンで配置することで、さまざまなビジネスニーズに対応する高度な自動化プロセスを作成できます。

以下の図は、3つの基本的なワークフローパターンを示しています。

```d2
direction: down

Sequential-Tasks: {
  label: "シーケンシャルタスク"
  shape: rectangle
  Agent-A: { label: "Agent A" }
  Agent-B: { label: "Agent B" }
  Agent-C: { label: "Agent C" }
}

Parallel-Tasks: {
  label: "パラレルタスク"
  shape: rectangle
  Initial-Task: { label: "初期タスク" }
  Parallel-Agents: {
    shape: rectangle
    grid-columns: 3
    Agent-A: { label: "Agent A" }
    Agent-B: { label: "Agent B" }
    Agent-C: { label: "Agent C" }
  }
  Combined-Result: { label: "結合された結果" }
}

Decision-Making: {
  label: "意思決定"
  shape: rectangle
  Request: { label: "リクエスト" }
  Manager-Agent: {
    label: "Manager Agent"
    shape: diamond
  }
  Specialized-Agents: {
    shape: rectangle
    grid-columns: 2
    Agent-A: { label: "専門Agent A" }
    Agent-B: { label: "専門Agent B" }
  }
}

Sequential-Tasks.Agent-A -> Sequential-Tasks.Agent-B: "結果"
Sequential-Tasks.Agent-B -> Sequential-Tasks.Agent-C: "結果"

Parallel-Tasks.Initial-Task -> Parallel-Tasks.Parallel-Agents.Agent-A
Parallel-Tasks.Initial-Task -> Parallel-Tasks.Parallel-Agents.Agent-B
Parallel-Tasks.Initial-Task -> Parallel-Tasks.Parallel-Agents.Agent-C

Parallel-Tasks.Parallel-Agents.Agent-A -> Parallel-Tasks.Combined-Result
Parallel-Tasks.Parallel-Agents.Agent-B -> Parallel-Tasks.Combined-Result
Parallel-Tasks.Parallel-Agents.Agent-C -> Parallel-Tasks.Combined-Result

Decision-Making.Request -> Decision-Making.Manager-Agent
Decision-Making.Manager-Agent -> Decision-Making.Specialized-Agents.Agent-A: "タスクA"
Decision-Making.Manager-Agent -> Decision-Making.Specialized-Agents.Agent-B: "タスクB"
```

このガイドでは、最も一般的なワークフローを紹介します。これらのパターンを理解することで、Agent が複雑な多段階のプロセスをどのように自動化できるかを視覚化するのに役立ちます。

各ワークフローの詳細な説明を参照して、その特定のユースケースと利点についてさらに学んでください。

<x-cards data-columns="3">
  <x-card data-title="シーケンシャルタスク" data-icon="lucide:list-ordered" data-href="/user-guide/common-workflows/sequential-tasks">
    組み立てラインのように、Agent はタスクを次々と完了させ、その作業を次の Agent に渡します。これは、特定の順序で実行する必要があるプロセスに最適です。
  </x-card>
  <x-card data-title="パラレルタスク" data-icon="lucide:git-fork" data-href="/user-guide/common-workflows/parallel-tasks">
    物事をより速く進めるために、複数の Agent が同時にジョブの異なる部分で作業できます。その後、個々の結果が結合され、完全なソリューションが形成されます。
  </x-card>
  <x-card data-title="意思決定" data-icon="lucide:git-merge" data-href="/user-guide/common-workflows/decision-making">
    マネージャーのように、1つの Agent が受信リクエストを分析し、そのジョブを処理するのに最も適した専門 Agent にインテリジェントにルーティングできます。
  </x-card>
</x-cards>

これらの基本的なパターンを組み合わせることで、特定のニーズに合わせた強力で自律的なシステムを構築できます。いずれかのカードをクリックして、各ワークフローがどのように機能するかを詳しく見てみましょう。