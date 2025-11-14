# 事例

AIGNE フレームワークの動作を見る準備はできましたか？このセクションでは、様々な機能やワークフローのパターンを実証する実践的な事例を包括的に提供します。複雑な設定をスキップして、ワンクリックコマンドで機能的な Agent を直接実行してみましょう。

## 概要

AIGNE フレームワークの事例は、インテリジェントなチャットボットから複雑なマルチ Agent ワークフローまで、さまざまなアプリケーションに関する実践的なデモンストレーションを提供します。各事例は、フレームワークの特定の能力を説明するために設計された、自己完結型で実行可能なデモです。Model Context Protocol (MCP) の統合、メモリの永続化、並行および順次タスク処理、動的なコード実行などのトピックを探求できます。

特定の機能やワークフローに関する詳細情報については、対応する事例ドキュメントを参照してください：

<x-cards data-columns="3">
  <x-card data-title="チャットボット" data-icon="lucide:bot" data-href="/examples/chat-bot">Agent ベースのチャットボットを作成し、実行する方法を実証します。</x-card>
  <x-card data-title="AFS システム FS" data-icon="lucide:folder-git-2" data-href="/examples/afs-system-fs">ローカルファイルシステムと対話できるチャットボットを構築する方法を示します。</x-card>
  <x-card data-title="メモリ" data-icon="lucide:database" data-href="/examples/memory">永続的なメモリを持つチャットボットを作成する方法を説明します。</x-card>
  <x-card data-title="MCP サーバー" data-icon="lucide:server" data-href="/examples/mcp-server">AIGNE Agent を MCP サーバーとして実行する方法を示します。</x-card>
  <x-card data-title="MCP 統合" data-icon="lucide:plug" data-href="/examples/mcp-blocklet">Blocklet、GitHub、Puppeteer、SQLite との統合を探ります。</x-card>
  <x-card data-title="コード実行" data-icon="lucide:terminal" data-href="/examples/workflow-code-execution">動的に生成されたコードをワークフロー内で安全に実行する方法を学びます。</x-card>
  <x-card data-title="並行処理" data-icon="lucide:git-compare-arrows" data-href="/examples/workflow-concurrency">複数のタスクを並行処理してパフォーマンスを最適化します。</x-card>
  <x-card data-title="グループチャット" data-icon="lucide:messages-square" data-href="/examples/workflow-group-chat">複数の Agent が対話し、メッセージを共有できる環境を構築します。</x-card>
  <x-card data-title="順次処理" data-icon="lucide:arrow-right" data-href="/examples/workflow-sequential">実行順序が保証されたステップバイステップの処理パイプラインを構築します。</x-card>
</x-cards>

## クイックスタート

リポジトリをクローンしたり、ローカルにインストールしたりすることなく、`npx` を使用してターミナルから直接任意の事例を実行できます。

### 前提条件

システムに Node.js と npm がインストールされていることを確認してください。

### 事例の実行

事例を実行するには、大規模言語モデルプロバイダーの API キーなど、必要な環境変数を設定する必要があります。

1.  **API キーを設定します：**

    ```bash OpenAI API キーを設定する icon=lucide:key-round
    export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```

2.  **チャットボットの事例を実行します：**

    次のコマンドは、基本的なチャットボットの事例をワンショットモードで実行します。このモードでは、デフォルトのプロンプトを受け取って終了します。

    ```bash ワンショットモードで実行 icon=lucide:terminal
    npx -y @aigne/example-chat-bot
    ```

    Agent と対話的な会話をするには、`--chat` フラグを追加します。

    ```bash 対話モードで実行 icon=lucide:terminal
    npx -y @aigne/example-chat-bot --chat
    ```

## 言語モデルの設定

`MODEL` 環境変数を対応する API キーと一緒に設定することで、さまざまな大規模言語モデルを使用するように事例を設定できます。`MODEL` 変数は `provider:model-name` の形式に従います。

### OpenAI

```bash OpenAI の設定 icon=lucide:terminal
export MODEL=openai:gpt-4o
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

### Anthropic

```bash Anthropic の設定 icon=lucide:terminal
export MODEL=anthropic:claude-3-5-sonnet-20240620
export ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
```

### Google Gemini

```bash Google Gemini の設定 icon=lucide:terminal
export MODEL=gemini:gemini-1.5-flash
export GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### AWS Bedrock

```bash AWS Bedrock の設定 icon=lucide:terminal
export MODEL=bedrock:anthropic.claude-3-sonnet-20240229-v1:0
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
export AWS_REGION="us-east-1"
```

### DeepSeek

```bash DeepSeek の設定 icon=lucide:terminal
export MODEL=deepseek:deepseek-chat
export DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY
```

### Doubao

```bash Doubao の設定 icon=lucide:terminal
export MODEL=doubao:Doubao-pro-128k
export DOUBAO_API_KEY=YOUR_DOUBAO_API_KEY
```

### xAI (Grok)

```bash xAI の設定 icon=lucide:terminal
export MODEL=xai:grok-1.5-flash
export XAI_API_KEY=YOUR_XAI_API_KEY
```

### Ollama (ローカルモデル)

```bash Ollama の設定 icon=lucide:terminal
export MODEL=ollama:llama3
export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434"
```

### LMStudio (ローカルモデル)

```bash LMStudio の設定 icon=lucide:terminal
export MODEL=lmstudio:local-model/llama-3.1-8b-instruct-gguf
export LM_STUDIO_DEFAULT_BASE_URL="http://localhost:1234/v1"
```

サポートされているモデルとその設定詳細の完全なリストについては、[モデル](./models-overview.md) セクションを参照してください。

## デバッグ

モデルの呼び出しや応答など、Agent の実行フローに関する洞察を得るには、`DEBUG` 環境変数を設定してデバッグログを有効にすることができます。

```bash デバッグログを有効にする icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

このコマンドは詳細なログをターミナルに出力します。これは Agent の内部動作を理解し、その挙動をトラブルシューティングするのに役立ちます。