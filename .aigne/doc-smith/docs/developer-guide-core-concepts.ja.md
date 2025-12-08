# コアコンセプト

AIGNE フレームワークで効果的にアプリケーションを構築するには、まずその基本的なアーキテクチャコンポーネントを理解することが不可欠です。このセクションでは、主要な構成要素とその相互作用の概要を説明します。これらの概念を明確に把握することで、より直感的な開発プロセスが促進されます。

このフレームワークは、複雑な AI 駆動のワークフローをオーケストレーションするために連携する、いくつかの主要な抽象化を中心に設計されています。主なコンポーネントは、AIGNE オーケストレーター、基本作業単位としての Agent、AI サービスと連携するためのモデル、そして状態を永続化するためのメモリです。

以下の図は、これらのコアコンポーネント間の関係を示しています。

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Core Concepts](assets/diagram/core-concepts-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## アーキテクチャの構成要素

AIGNE フレームワークは、4つの主要な概念で構成されています。それぞれを理解することは、堅牢でスケーラブルな Agent ベースのアプリケーションを構築するために不可欠です。

<x-cards data-columns="2">
  <x-card data-title="AIGNE" data-icon="lucide:box" data-href="/developer-guide/core-concepts/aigne-engine">
    Agent のライフサイクル管理、相互作用の調整、および全体的な実行フローの処理を担当する中央オーケストレーターです。
  </x-card>
  <x-card data-title="Agents" data-icon="lucide:bot" data-href="/developer-guide/core-concepts/agents">
    基本的な作業単位です。Agent は、単純な関数の実行から複雑な推論まで、特定の能力をカプセル化する抽象化です。
  </x-card>
  <x-card data-title="Models" data-icon="lucide:brain-circuit" data-href="/developer-guide/core-concepts/models">
    大規模言語モデル (LLM) や画像生成 API などの外部サービスへの標準化されたインターフェースを提供する特殊な Agent です。
  </x-card>
  <x-card data-title="Memory" data-icon="lucide:database" data-href="/developer-guide/core-concepts/memory">
    Agent に情報を永続化および呼び出す能力を提供し、時間経過とともにステートフルな会話とコンテキストを意識した振る舞いを可能にします。
  </x-card>
</x-cards>

## まとめ

このセクションでは、AIGNE フレームワークの4つの基本的な柱、すなわち `AIGNE` オーケストレーター、`Agent`、`モデル`、そして `メモリ` を紹介しました。各コンポーネントは、アーキテクチャにおいて明確かつ重要な役割を果たします。

より包括的な理解のために、各概念の詳細なドキュメントに進むことをお勧めします。

*   **次へ:** [AIGNE オーケストレーター](./developer-guide-core-concepts-aigne-engine.md)について、さらに深く掘り下げます。