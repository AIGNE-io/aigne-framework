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

`@aigne/cli` は、[AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) の公式コマンドラインツールであり、Agent 開発のライフサイクル全体を効率化するために設計されています。プロジェクトの作成、ローカルでの実行、テスト、デプロイを簡素化するための包括的なコマンドスイートを提供し、AIGNE アプリケーションを簡単に構築、実行、管理できるようにします。

## 主な機能

`@aigne/cli` には、Agent 開発のワークフローを加速するための機能が満載です。

<x-cards data-columns="3">
  <x-card data-title="プロジェクトのひな形作成" data-icon="lucide:folder-plus">
    `aigne create` コマンドを使用して、定義済みのファイル構造と設定を持つ新しい AIGNE プロジェクトを迅速に作成します。
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
    OpenAI、Claude、XAI など、さまざまな AI モデルプロバイダーをシームレスに切り替えます。
  </x-card>
</x-cards>

## 主要コマンド一覧

CLI は、AIGNE プロジェクトを管理するための一連の直感的なコマンドを提供します。以下は、使用する主なコマンドです。

```bash 基本コマンド icon=lucide:terminal
# 新しい AIGNE プロジェクトを作成
aigne create [path]

# Agent をローカルで実行
aigne run --path <agent-path>

# Agent の自動テストを実行
aigne test --path <agent-path>

# Agent を MCP サーバーとして提供
aigne serve-mcp --path <agent-path>

# 可観測性および監視サーバーを起動
aigne observe
```

このツールセットは AIGNE 開発体験の基盤を形成し、構想から本番稼働まで必要なすべてを提供します。

---

準備はいいですか？[スタートガイド](./getting-started.md) に従って CLI をインストールし、最初の AIGNE Agent を作成してください。
