---
labels: ["Reference"]
---

# 概要

<p align="center">
  <picture>
    <source srcset="../logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="../logo.svg" media="(prefers-color-scheme: light)">
    <img src="../logo.svg" alt="AIGNE ロゴ" width="400" />
  </picture>

  <center>Agent 開発のコマンドセンター</center>
</p>

`@aigne/cli` は、[AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) の公式コマンドラインツールであり、Agent 開発のライフサイクル全体を効率化するように設計されています。プロジェクトの作成、ローカルでの実行、テスト、デプロイを簡素化するための包括的なコマンドスイートを提供し、AIGNE アプリケーションの構築、実行、管理を容易にします。

## 主な機能

`@aigne/cli` には、Agent 開発ワークフローを加速するための機能が満載です。

<x-cards data-columns="3">
  <x-card data-title="プロジェクトの雛形作成" data-icon="lucide:folder-plus">
    `aigne create` コマンドを使用して、定義済みのファイル構造と構成を持つ新しい AIGNE プロジェクトを迅速に作成します。
  </x-card>
  <x-card data-title="ローカルでの Agent 実行" data-icon="lucide:play-circle">
    `aigne run` を介して、ローカルのチャットループで Agent を簡単に実行し、対話することで、迅速なテストとデバッグが可能です。
  </x-card>
  <x-card data-title="自動テスト" data-icon="lucide:beaker">
    組み込みの `aigne test` コマンドを活用して単体テストと統合テストを実行し、Agent の堅牢性と信頼性を確保します。
  </x-card>
  <x-card data-title="MCP サーバー統合" data-icon="lucide:server">
    Agent を Model Context Protocol (MCP) サーバーとして起動し、外部システムとの統合を可能にします。
  </x-card>
  <x-card data-title="豊富な可観測性" data-icon="lucide:bar-chart-3">
    `aigne observe` でローカルサーバーを起動し、Agent の実行トレースとパフォーマンスデータを表示・分析します。
  </x-card>
  <x-card data-title="マルチモデル対応" data-icon="lucide:bot">
    OpenAI、Claude、XAI など、さまざまな AI モデルプロバイダーをシームレスに切り替えることができます。
  </x-card>
</x-cards>

---

始める準備はできましたか？ [スタートガイド](./getting-started.md) に従って CLI をインストールし、最初の AIGNE agent を作成してください。
