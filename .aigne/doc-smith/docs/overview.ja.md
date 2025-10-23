# 概要

AIGNE フレームワークは、機能的な AI アプリケーション開発フレームワークであり、スケーラブルなエージェント型 AI アプリケーションの構築プロセスを簡素化および高速化するために設計されています。関数型プログラミングの概念、堅牢な人工知能機能、モジュラー設計を組み合わせ、開発者に構造化された環境を提供します。

このドキュメントでは、AIGNE フレームワークのアーキテクチャ、コアコンポーネント、および主要な機能の概要を説明します。また、技術的な背景や目的に応じて適切なドキュメントパスに誘導するナビゲーションガイドとしても機能します。

## コアアーキテクチャ

このフレームワークは、`AIGNE` として知られる中央オーケストレーターを中心にアーキテクチャが設計されており、`Agents` と呼ばれる様々な特化コンポーネントのライフサイクルとインタラクションを管理します。Agent は作業の基本単位であり、特定のタスクを実行するように設計されています。複雑なワークフローを処理するために、チームに編成することができます。

```d2
direction: down
style: {
  font-size: 14
}

AIGNE: {
  label: "AIGNE"
  tooltip: "Agent とワークフローをオーケストレーションする中央実行エンジン。"
  shape: hexagon
  style: {
    fill: "#F0F4EB"
    stroke: "#C2D7A7"
    stroke-width: 2
  }
}

Models: {
  label: "AI モデル"
  tooltip: "外部の言語モデルや画像モデル（例：OpenAI、Anthropic）とのインターフェース。"
  shape: cylinder
  style: {
    fill: "#FEF7E8"
    stroke: "#F7D8A3"
    stroke-width: 2
  }
}

Agents: {
  shape: package
  label: "Agents"
  tooltip: "タスクを実行する特化された作業単位。"
  style: {
    fill: "#EBF5FB"
    stroke: "#AED6F1"
    stroke-width: 2
  }

  AIAgent: {
    label: "AI Agent"
    tooltip: "言語モデルと対話します。"
  }
  TeamAgent: {
    label: "Team Agent"
    tooltip: "複数の Agent をオーケストレーションします。"
  }
  FunctionAgent: {
    label: "Function Agent"
    tooltip: "カスタムコードをラップします。"
  }
  OtherAgents: {
    label: "..."
    tooltip: "ImageAgent、MCPAgent などの他の特化 Agent。"
  }
}

Skills: {
  label: "スキル＆ツール"
  tooltip: "Agent が利用できる再利用可能な関数または外部ツール。"
  shape: rectangle
  style: {
    fill: "#F4ECF7"
    stroke: "#D7BDE2"
    stroke-width: 2
  }
}

AIGNE -> Agents: 管理＆呼び出し
Agents -> Models: 利用
Agents -> Skills: 使用
```

-   **AIGNE**: Agent のライフサイクル管理、インタラクションのオーケストレーション、および全体的な実行フローの処理を担当する中央実行エンジンです。モデル、Agent、スキルを含む構成でインスタンス化されます。
-   **Agents**: フレームワークの基本的な構成要素です。Agent は特定のタスクを実行する自律的なユニットです。このフレームワークは、言語モデルと対話するための `AIAgent`、複数の Agent を調整するための `TeamAgent`、カスタムコードを実行するための `FunctionAgent` など、いくつかの特化された Agent タイプを提供します。
-   **モデル**: OpenAI、Anthropic、Google などの外部 AI モデルプロバイダーとインターフェースする抽象化レイヤーです。これらは Agent によって、大規模言語モデル（LLM）や画像生成モデルの能力を活用するために使用されます。
-   **スキル**: Agent にアタッチしてその機能を拡張できる、再利用可能な能力で、多くの場合、関数や他の Agent として表現されます。

## 主な機能

AIGNE フレームワークは、高度な AI アプリケーションの開発をサポートするための包括的な機能セットを備えています。

<x-cards data-columns="2">
  <x-card data-title="モジュラー設計" data-icon="lucide:blocks">
    明確なモジュラー構造により、開発者はコードを効果的に整理でき、開発効率の向上とメンテナンスの簡素化が実現します。
  </x-card>
  <x-card data-title="複数 AI モデルのサポート" data-icon="lucide:bot">
    OpenAI、Google、Anthropic などの主流 AI モデルを幅広く組み込みでサポートし、追加モデルをサポートするための拡張可能な設計を備えています。
  </x-card>
  <x-card data-title="柔軟なワークフローパターン" data-icon="lucide:git-merge">
    シーケンシャル、コンカレント、ルーティングなど、様々なワークフローパターンをネイティブにサポートし、複雑なアプリケーション要件に対応します。
  </x-card>
  <x-card data-title="TypeScript のサポート" data-icon="lucide:file-type">
    包括的な TypeScript の型定義を提供し、型安全性を確保し、全体的な開発者体験を向上させます。
  </x-card>
  <x-card data-title="コード実行" data-icon="lucide:terminal-square">
    安全なサンドボックス内で動的に生成されたコードの実行をサポートし、強力な自動化機能を可能にします。
  </x-card>
  <x-card data-title="MCP プロトコル統合" data-icon="lucide:plug-zap">
    モデルコンテキストプロトコル（MCP）を介して、外部システムやサービスとシームレスに統合します。
  </x-card>
</x-cards>

## 本ドキュメントの使い方

様々なニーズに対応するため、このドキュメントは主に2つのパスに分かれています。ご自身の役割や目標に最も合ったパスを選択してください。

<x-cards data-columns="2">
  <x-card data-title="開発者ガイド" data-icon="lucide:code" data-href="/developer-guide/getting-started" data-cta="ビルドを開始">
    エンジニアおよび開発者向け。このガイドでは、技術的な詳細、コードファーストの例、API リファレンスなど、AIGNE フレームワークでエージェント型アプリケーションをビルド、テスト、デプロイするために必要なすべてを提供します。
  </x-card>
  <x-card data-title="ユーザーガイド" data-icon="lucide:user" data-href="/user-guide" data-cta="コンセプトを学ぶ">
    非技術系のユーザー、プロダクトマネージャー、ビジネス関係者向け。このガイドでは、AI Agent とワークフローのコアコンセプトを平易な言葉で説明し、専門用語を使わずに、潜在的なアプリケーションやビジネス成果に焦点を当てています。
  </x-card>
</x-cards>

## まとめ

この概要では、AIGNE フレームワーク、そのコアアーキテクチャ、および主な機能を紹介しました。このフレームワークは、最新のエージェントベースの AI アプリケーションを構築するための包括的なツールセットです。

次のステップとして、以下をお勧めします。
-   **開発者**: ハンズオンチュートリアルとして、[スタートガイド](./developer-guide-getting-started.md) に進んでください。
-   **非技術系ユーザー**: 概念的な紹介として、[AIGNE とは？](./user-guide-what-is-aigne.md) から始めてください。