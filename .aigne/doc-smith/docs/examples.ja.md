# サンプル

AIGNE Framework の実際の動作を見てみませんか？このセクションでは、さまざまな機能とワークフローパターンを示す実践的なサンプルの包括的なコレクションを提供します。複雑な設定をスキップして、ワンクリックコマンドで機能的な Agent を直接実行できます。

## 概要

AIGNE Framework のサンプルは、インテリジェントなチャットボットから複雑なマルチ Agent ワークフローまで、さまざまなアプリケーションの実践的なデモンストレーションを提供します。各サンプルは、フレームワークの特定の機能を示すために設計された、自己完結型で実行可能なデモです。Model Context Protocol (MCP) の統合、メモリの永続化、並列およびシーケンシャルなタスク処理、動的なコード実行などのトピックを探求できます。

特定の機能またはワークフローに関する詳細情報については、対応するサンプルドキュメントを参照してください。

<x-cards data-columns="3">
  <x-card data-title="Chatbot" data-icon="lucide:bot" data-href="/examples/chat-bot">Agent ベースのチャットボットを作成して実行する方法を示します。</x-card>
  <x-card data-title="AFS System FS" data-icon="lucide:folder-git-2" data-href="/examples/afs-system-fs">ローカルファイルシステムと対話できるチャットボットを構築する方法を示します。</x-card>
  <x-card data-title="Memory" data-icon="lucide:database" data-href="/examples/memory">永続的なメモリを持つチャットボットを作成する方法を説明します。</x-card>
  <x-card data-title="MCP Server" data-icon="lucide:server" data-href="/examples/mcp-server">AIGNE Agent を MCP サーバーとして実行する方法を示します。</x-card>
  <x-card data-title="MCP Integrations" data-icon="lucide:plug" data-href="/examples/mcp-blocklet">Blocklet、GitHub、Puppeteer、SQLite との統合を探ります。</x-card>
  <x-card data-title="Code Execution" data-icon="lucide:terminal" data-href="/examples/workflow-code-execution">ワークフロー内で動的に生成されたコードを安全に実行する方法を学びます。</x-card>
  <x-card data-title="Concurrency" data-icon="lucide:git-compare-arrows" data-href="/examples/workflow-concurrency">複数のタスクを並列処理してパフォーマンスを最適化します。</x-card>
  <x-card data-title="Group Chat" data-icon="lucide:messages-square" data-href="/examples/workflow-group-chat">複数の Agent が対話し、メッセージを共有できる環境を構築します。</x-card>
  <x-card data-title="Sequential" data-icon="lucide:arrow-right" data-href="/examples/workflow-sequential">実行順序が保証されたステップバイステップの処理パイプラインを構築します。</x-card>
</x-cards>

## クイックスタート（インストール不要）

リポジトリをクローンしたり、ローカルにインストールしたりすることなく、`npx` を使用してターミナルから直接任意のサンプルを実行できます。

### 前提条件

Node.js（バージョン 20.0 以上）と npm がシステムにインストールされていることを確認してください。

### サンプルの実行

次のコマンドは、基本的なチャットボットのサンプルをワンショットモードで実行します。このモードでは、デフォルトのプロンプトを受け取り、応答を提供してから終了します。

```bash ワンショットモードで実行 icon=lucide:terminal
npx -y @aigne/example-chat-bot
```

Agent と対話的に会話するには、`--chat` フラグを追加します。

```bash 対話モードで実行 icon=lucide:terminal
npx -y @aigne/example-chat-bot --chat
```

入力を直接 Agent にパイプすることもできます。

```bash パイプライン入力を使用 icon=lucide:terminal
echo "Tell me about AIGNE Framework" | npx -y @aigne/example-chat-bot
```

## AI モデルへの接続

サンプルを実行するには、AI モデルへの接続が必要です。事前の設定なしでコマンドを実行すると、接続を促すプロンプトが表示されます。

![モデルが設定されていない場合の初期接続プロンプト](../../../examples/chat-bot/run-example.png)

接続を確立するには、3 つのオプションがあります。

### 1. 公式 AIGNE Hub に接続する

これは新規ユーザーに推奨されるオプションです。AIGNE Hub はシームレスな接続体験を提供し、新規ユーザーにはすぐに始められる無料トークンが付与されます。

-   プロンプトの最初のオプションを選択します。
-   ブラウザで公式 AIGNE Hub ページが開きます。
-   画面の指示に従って AIGNE CLI を承認します。

![AIGNE CLI を承認して AIGNE Hub に接続する](../../../examples/images/connect-to-aigne-hub.png)

### 2. セルフホストの AIGNE Hub に接続する

組織が AIGNE Hub のプライベートインスタンスを実行している場合は、直接接続できます。

-   プロンプトの 2 番目のオプションを選択します。
-   セルフホストの AIGNE Hub の URL を入力し、プロンプトに従って接続を完了します。

![セルフホストの AIGNE Hub の URL を入力する](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

独自の AIGNE Hub をデプロイする必要がある場合は、[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) から行うことができます。

### 3. サードパーティのモデルプロバイダー経由で接続する

適切な環境変数を設定することで、サードパーティの AI モデルプロバイダーに直接接続できます。対話型プロンプトを終了し、選択したプロバイダーの API キーを設定します。

たとえば、OpenAI を使用するには、`OPENAI_API_KEY` 環境変数を設定します。

```bash OpenAI API キーを設定する icon=lucide:key-round
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

キーを設定した後、サンプルのコマンドを再度実行します。

## 言語モデルの設定

サンプルは、`MODEL` 環境変数と対応する API キーを設定することで、さまざまな大規模言語モデルを使用するように設定できます。`MODEL` 変数は `provider:model-name` の形式に従います。

### OpenAI

```bash OpenAI 設定 icon=lucide:terminal
export MODEL=openai:gpt-4o
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

### Anthropic

```bash Anthropic 設定 icon=lucide:terminal
export MODEL=anthropic:claude-3-5-sonnet-20240620
export ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
```

### Google Gemini

```bash Google Gemini 設定 icon=lucide:terminal
export MODEL=gemini:gemini-1.5-flash
export GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### AWS Bedrock

```bash AWS Bedrock 設定 icon=lucide:terminal
export MODEL=bedrock:anthropic.claude-3-sonnet-20240229-v1:0
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
export AWS_REGION="us-east-1"
```

### DeepSeek

```bash DeepSeek 設定 icon=lucide:terminal
export MODEL=deepseek:deepseek-chat
export DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY
```

### Doubao

```bash Doubao 設定 icon=lucide:terminal
export MODEL=doubao:Doubao-pro-128k
export DOUBAO_API_KEY=YOUR_DOUBAO_API_KEY
```

### xAI (Grok)

```bash xAI 設定 icon=lucide:terminal
export MODEL=xai:grok-1.5-flash
export XAI_API_KEY=YOUR_XAI_API_KEY
```

### Ollama (ローカルモデル)

```bash Ollama 設定 icon=lucide:terminal
export MODEL=ollama:llama3
export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434"
```

### LMStudio (ローカルモデル)

```bash LMStudio 設定 icon=lucide:terminal
export MODEL=lmstudio:local-model/llama-3.1-8b-instruct-gguf
export LM_STUDIO_DEFAULT_BASE_URL="http://localhost:1234/v1"
```

サポートされているモデルとその設定の詳細の完全なリストについては、[モデル概要](./models-overview.md) セクションを参照してください。

## デバッグと監視

Agent の実行フローを把握するには、リアルタイムのターミナル出力用のデバッグログと、より詳細なウェブベースの分析用の AIGNE 監視サーバーという 2 つの主要な方法を使用できます。

### デバッグログ

`DEBUG` 環境変数を設定してデバッグログを有効にします。これにより、モデルの呼び出し、応答、およびその他の内部操作に関する詳細情報がターミナルに直接出力されます。

```bash デバッグログを有効にする icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

### AIGNE Observe

`aigne observe` コマンドは、Agent の実行データを監視および分析するためのローカルウェブサーバーを起動します。このツールは、デバッグ、パフォーマンスチューニング、および Agent が情報をどのように処理するかを理解するために不可欠です。

1.  **AIGNE CLI のインストール:**

    ```bash AIGNE CLI をインストールする icon=lucide:terminal
    npm install -g @aigne/cli
    ```

2.  **監視サーバーの起動:**

    ```bash 監視サーバーを起動する icon=lucide:terminal
    aigne observe
    ```

    ![ターミナルで起動する AIGNE 監視サーバー](../../../examples/images/aigne-observe-execute.png)

3.  **トレースの表示:**

    サンプルを実行した後、ブラウザで `http://localhost:7893` を開いてトレースを検査し、詳細な呼び出し情報を表示し、Agent のランタイム動作を理解します。

    ![AIGNE Observe UI での最近の Agent 実行リスト](../../../examples/images/aigne-observe-list.png)