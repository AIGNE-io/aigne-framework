# AIGNE とは？

AIGNE (発音は `[ˈei dʒən]`、「agent」から「t」を除いたような音) は、AI アプリケーションを開発するための関数型フレームワークです。関数型プログラミング、モジュール設計、そして強力な人工知能の能力を組み合わせることで、スケーラブルでモダンなアプリケーションの構築プロセスを簡素化し、加速させるように設計されています。

AIGNE の中核となるコンセプトは、**Agent** (専門的な AI アシスタント) を使用することです。これらの Agent はチームに編成され、複雑で複数ステップにわたるタスクを自動化できます。単一のモノリシックな AI に依存するのではなく、AIGNE は、さまざまな Agent が協力し、それぞれがより大きな問題の特定の部分を処理するデジタルワークフォースを作成するための構造を提供します。

このドキュメントでは、AIGNE フレームワークについて平易な言葉で紹介し、AI Agent とは何か、それらが解決する問題、そして高度なワークフローを自動化するためにそれらがどのように連携して動作するかを説明します。

## AI Agent とは？

AI Agent とは、特定の機能を実行するために設計された専門的なデジタルアシスタントです。各 Agent は与えられた一連の指示に基づいて動作し、タスクを実行するための特定のツールを備えることができます。汎用的なチャットボットとは異なり、AIGNE の Agent は狭い領域の専門家です。

Agent を、非常に効率的なプロジェクトチームの個々のメンバーと考えてみてください。

*   **リサーチャー:** 外部の情報源にアクセスしてデータを収集できる Agent。
*   **ライター:** 生の情報を処理し、構造化されたドキュメントを作成する Agent。
*   **コーダー:** 技術的な機能を実行するためにコードを記述し、実行できる Agent。
*   **アナリスト:** データを解釈し、パターンを特定し、洞察を提供できる Agent。

単一の Agent は、単純で定義されたタスクには効果的ですが、AIGNE フレームワークの主な強みは、複数の Agent を結束力のあるチームに編成し、複雑な目標を達成する能力にあります。

## AIGNE が解決する問題

単一の大規模言語モデル (LLM) は、質問に答えたりテキストを生成したりするようなタスクには強力なツールです。しかし、複数の個別のステップ、異なるスキルセット、またはさまざまなソースからの情報を必要とするプロセスに直面した場合、その能力には限界があります。

例えば、「最新の販売レポートを分析し、公開されている競合他社の業績データと比較して、マーケティングチーム向けのプレゼンテーションを作成してください」といったリクエストは、標準的なチャットボットにとっては困難でしょう。このプロセスには、いくつかの個別の段階が含まれます。

1.  **データ分析:** 社内の販売レポートを読み取り、解釈する。
2.  **外部リサーチ:** 競合他社の業績データを見つけ出し、抽出する。
3.  **統合:** 2つのデータセットを比較し、主要な洞察を特定する。
4.  **コンテンツ作成:** 調査結果を首尾一貫したプレゼンテーションにまとめる。

AIGNE は、このような複雑なリクエストを管理可能なサブタスクに分解するためのフレームワークを提供することで、この問題に対処します。各サブタスクは専門の Agent に割り当てられ、フレームワークがそれらの間の情報の流れを管理し、完全で正確な最終出力を保証します。

## Agent が連携してタスクを自動化する方法

AIGNE は Agent を**ワークフロー**に編成します。ワークフローとは、タスクを実行するための構造化されたプロセスです。Agent を接続することで、通常は多大な手作業による調整が必要となるプロセスを自動化できます。このフレームワークは、いくつかのコラボレーションパターンをサポートしており、柔軟で強力な自動化を可能にします。

以下の図は、AIGNE フレームワークが複雑なタスクをどのように分解し、Agent のチームを管理して最終的な結果を生成するかを示しています。

```d2
direction: down

Complex-Task: {
  label: "複雑な複数ステップのタスク"
  shape: oval
}

AIGNE: {
  label: "AIGNE フレームワーク"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

Decomposition: {
  label: "タスクをサブタスクに分解"
  shape: rectangle
  style: {
    stroke-dash: 2
  }
}

Orchestration-Patterns: {
  label: "コラボレーションパターンを用いて Agent を編成"
  grid-columns: 3
  grid-gap: 50

  Sequential-Workflow: {
    label: "シーケンシャル (組み立てライン)"
    shape: rectangle
    direction: down
    Researcher: "Researcher Agent"
    Summarizer: "Summarizer Agent"
    Report-Writer: "Report Writer Agent"
  }

  Parallel-Workflow: {
    label: "パラレル (チームワーク)"
    shape: rectangle
    Task: "フィードバックを分析"
    Agent-A: "ポジティブなものを処理"
    Agent-B: "ネガティブなものを処理"
  }

  Routing-Workflow: {
    label: "ルーティング (マネージャー)"
    shape: rectangle
    Request: "受信リクエスト"
    Manager: {
      label: "Manager Agent"
      shape: diamond
    }
    Coder: "Coder Agent"
    Writer: "Writer Agent"
  }
}

Final-Goal: {
  label: "一貫性のある完全な出力"
  shape: oval
}

Complex-Task -> AIGNE: "入力"
AIGNE -> Decomposition
Decomposition -> Orchestration-Patterns
Orchestration-Patterns -> Final-Goal: "出力"
Orchestration-Patterns.Sequential-Workflow.Researcher -> Orchestration-Patterns.Sequential-Workflow.Summarizer -> Orchestration-Patterns.Sequential-Workflow.Report-Writer
Orchestration-Patterns.Parallel-Workflow.Task -> Orchestration-Patterns.Parallel-Workflow.Agent-A
Orchestration-Patterns.Parallel-Workflow.Task -> Orchestration-Patterns.Parallel-Workflow.Agent-B
Orchestration-Patterns.Routing-Workflow.Request -> Orchestration-Patterns.Routing-Workflow.Manager
Orchestration-Patterns.Routing-Workflow.Manager -> Orchestration-Patterns.Routing-Workflow.Coder: "ルート"
Orchestration-Patterns.Routing-Workflow.Manager -> Orchestration-Patterns.Routing-Workflow.Writer: "ルート"
```

一般的なワークフローパターンには以下が含まれます。

*   **シーケンシャルワークフロー (組み立てライン):** 1つの Agent がタスクを完了し、その結果を直接次の Agent に渡します。これは、データの収集、要約、そしてレポートの作成といった、決められた順序での操作が必要なプロセスに適しています。
*   **パラレルワークフロー (チームワーク):** 複数の Agent がタスクの異なる部分に同時に取り組むことで、効率を向上させます。例えば、顧客のフィードバックを分析するために、1つの Agent が肯定的なレビューを処理し、別の Agent が同時に否定的なレビューを処理し、最後に結果を集約することができます。
*   **ルーティングワークフロー (マネージャー):** 「マネージャー」Agent が受信リクエストを分析し、どの専門 Agent がその処理に最も適しているかを判断します。このパターンは、多種多様な問い合わせに対応できるインテリジェントアシスタントやヘルプデスクを作成するのに効果的です。

これらのワークフローパターンを組み合わせることで、開発者は広範なデジタルプロセスを自動化する高度なシステムを構築できます。

## まとめ

AIGNE は、専門的な AI Agent からなるデジタルワークフォースを構築・管理するためのフレームワークです。以下のためのツールを提供します。

*   **分解**: 複雑な問題を、より小さく明確に定義されたタスクに分解します。
*   **割り当て**: 各タスクを、適切なスキルを持つ AI Agent に割り当てます。
*   **編成**: Agent 間のコラボレーションを編成し、最終的で一貫性のある目標を達成します。

この Agent ベースのアプローチは、単一の AI モデルの限界を克服し、複雑で現実世界のビジネスプロセスを、より高い信頼性と精度で自動化することを可能にします。

システム内で Agent が果たすことのできるさまざまな役割についてさらに学ぶには、次のセクションに進んでください。

*   **次へ:** [Agent を理解する](./user-guide-understanding-agents.md)