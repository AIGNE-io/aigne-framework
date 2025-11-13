# サンプル

このセクションでは、AIGNE フレームワークのコア機能とワークフローパターンを示す、すぐに実行できる実践的なサンプルのコレクションを提供します。これらのデモンストレーションを調べることで、インテリジェントなチャットボットの実装、外部サービスの統合、Agent のメモリ管理、および複雑なマルチ Agent ワークフローのオーケストレーション方法について具体的な理解を得ることができます。

これらのサンプルは、自己完結型で最小限のセットアップで実行できるように設計されており、基本的な会話から高度な統合まで、幅広いアプリケーションをカバーしています。各サンプルは、独自の Agent AI アプリケーションを構築するためのリファレンス実装として機能します。

## クイックスタート

Node.js と npm が利用可能であれば、ローカルにインストールすることなく、どのサンプルでも直接実行できます。以下の手順は、`npx` を使用して基本的なチャットボットのサンプルを実行する方法を示しています。

まず、必要な環境変数を設定します。ほとんどのサンプルでは、OpenAI API キーが必要です。

```bash OpenAI API キーを設定する icon=lucide:terminal
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

次に、サンプルを実行します。1 回の応答のためにワンショットモードで実行するか、対話型のチャットモードで実行することができます。

```bash ワンショットモードで実行 icon=lucide:terminal
npx -y @aigne/example-chat-bot
```

継続的な会話を行うには、`--chat` フラグを追加します。

```bash 対話型チャットモードで実行 icon=lucide:terminal
npx -y @aigne/example-chat-bot --chat
```

## サンプルコレクション

このコレクションは、基本的な概念、Model Context Protocol (MCP) の統合、および高度なワークフローパターンをカバーしています。

### コアコンセプト

<x-cards data-columns="2">
  <x-card data-title="基本的なチャットボット" data-href="/examples/chat-bot" data-icon="lucide:bot">
  シンプルな Agent ベースのチャットボットを作成し、実行する方法を示します。
  </x-card>
  <x-card data-title="メモリ付きチャットボット" data-href="/examples/memory" data-icon="lucide:database">
  永続的な会話のために、Agent にステートフルなメモリを追加する方法を説明します。
  </x-card>
</x-cards>

### MCP とインテグレーション

<x-cards data-columns="2">
  <x-card data-title="MCP サーバー" data-href="/examples/mcp-server" data-icon="lucide:server">
  AIGNE フレームワークの Agent を Model Context Protocol (MCP) サーバーとして実行する方法を示します。
  </x-card>
  <x-card data-title="Blocklet とのインテグレーション" data-href="/examples/mcp-blocklet" data-icon="lucide:box">
  Blocklet と統合し、その機能を MCP スキルとして公開する方法を説明します。
  </x-card>
  <x-card data-title="GitHub とのインテグレーション" data-href="/examples/mcp-github" data-icon="lucide:github">
  GitHub MCP サーバーを使用して GitHub リポジトリと対話する例です。
  </x-card>
  <x-card data-title="Web コンテンツの抽出" data-href="/examples/mcp-puppeteer" data-icon="lucide:mouse-pointer-click">
  AIGNE フレームワークを介して、自動化された Web スクレイピングのために Puppeteer を活用する方法を学びます。
  </x-card>
  <x-card data-title="スマートなデータベース操作" data-href="/examples/mcp-sqlite" data-icon="lucide:database-zap">
  Model Context Protocol を介して SQLite に接続し、データベース操作を探求します。
  </x-card>
</x-cards>

### 高度なワークフロー

<x-cards data-columns="2">
  <x-card data-title="コード実行" data-href="/examples/workflow-code-execution" data-icon="lucide:code-2">
  AI 駆動のワークフロー内で動的に生成されたコードを安全に実行する方法を示します。
  </x-card>
  <x-card data-title="並行処理" data-href="/examples/workflow-concurrency" data-icon="lucide:git-compare-arrows">
  並列実行により複数のタスクを同時に処理し、パフォーマンスを最適化します。
  </x-card>
  <x-card data-title="シーケンシャルパイプライン" data-href="/examples/workflow-sequential" data-icon="lucide:git-commit-horizontal">
  実行順序が保証されたステップバイステップの処理パイプラインを構築します。
  </x-card>
  <x-card data-title="グループチャット" data-href="/examples/workflow-group-chat" data-icon="lucide:messages-square">
  グループチャット環境でメッセージを共有し、複数の Agent と対話する方法を示します。
  </x-card>
  <x-card data-title="タスクの引き継ぎ" data-href="/examples/workflow-handoff" data-icon="lucide:arrow-right-left">
  専門的な Agent 間でシームレスな移行を作成し、複雑な問題を解決します。
  </x-card>
  <x-card data-title="スマートオーケストレーション" data-href="/examples/workflow-orchestration" data-icon="lucide:workflow">
  洗練された処理パイプラインで連携して動作する複数の Agent を調整します。
  </x-card>
  <x-card data-title="リフレクション" data-href="/examples/workflow-reflection" data-icon="lucide:rotate-cw">
  出力の評価と改良機能を通じて自己改善を可能にします。
  </x-card>
  <x-card data-title="ルーター" data-href="/examples/workflow-router" data-icon="lucide:git-fork">
  インテリジェントなルーティングロジックを実装し、コンテンツに基づいてリクエストを適切なハンドラに転送します。
  </x-card>
</x-cards>

## 高度な設定

### 異なる大規模言語モデルの使用

`MODEL` 環境変数と対応する API キーを設定することで、さまざまな大規模言語モデルを使用するようにサンプルを設定できます。サポートされているプロバイダーの完全なリストについては、[モデルの概要](./models-overview.md) を参照してください。

#### OpenAI

```bash OpenAI の設定 icon=lucide:terminal
export MODEL=openai:gpt-4o
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

#### Anthropic

```bash Anthropic の設定 icon=lucide:terminal
export MODEL=anthropic:claude-3-opus-20240229
export ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
```

#### Google Gemini

```bash Gemini の設定 icon=lucide:terminal
export MODEL=gemini:gemini-1.5-flash
export GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

#### AWS Bedrock

```bash Bedrock の設定 icon=lucide:terminal
export MODEL=bedrock:us-east-1.anthropic.claude-3-sonnet-20240229-v1:0
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_KEY"
export AWS_REGION="us-east-1"
```

#### Ollama (ローカル)

```bash Ollama の設定 icon=lucide:terminal
export MODEL=llama3
export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434/v1"
export OLLAMA_API_KEY=ollama
```

### デバッグログの出力

モデルの呼び出しや応答など、Agent の内部操作に関する洞察を得るには、`DEBUG` 環境変数を設定してデバッグロギングを有効にすることができます。

```bash デバッグロギングを有効にする icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

このコマンドは詳細な出力を生成し、トラブルシューティングや Agent の実行フローを理解するのに役立ちます。

## まとめ

これらのサンプルは、AIGNE フレームワークで構築を始めるための実践的な出発点を提供します。まず[基本的なチャットボット](./examples-chat-bot.md)から始めて基本を理解し、その後必要に応じてより複雑なワークフローを探求することをお勧めします。より深い理論的な理解については、[コアコンセプト](./developer-guide-core-concepts.md)のドキュメントを参照してください。