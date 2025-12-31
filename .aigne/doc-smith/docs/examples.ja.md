# 事例

AIGNEフレームワークのさまざまな機能とワークフローパターンを実証する実践的な事例集をご覧ください。このセクションでは、インテリジェントな会話、MCPプロトコルの統合、メモリメカニズム、および複雑なAgentワークフローを理解するのに役立つ、ハンズオンで実行可能なデモを提供します。

## クイックスタート

`npx` を使用すると、ローカルにインストールすることなく、どの事例でも直接実行できます。この方法は、AIGNEフレームワークの動作を最も早く確認する方法です。

### 前提条件

- Node.js（バージョン20.0以上）とnpmがインストールされていること。
- 選択した大規模言語モデル（LLM）プロバイダー（例：OpenAI）のAPIキー。

### 事例の実行

ターミナルで以下のコマンドを実行して、基本的なチャットボットを実行します。

1.  **APIキーを設定する:**
    `YOUR_OPENAI_API_KEY` を実際のOpenAI APIキーに置き換えてください。

    ```sh icon=lucide:terminal
    export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```

2.  **ワンショットモードで実行する:**
    Agentはデフォルトのプロンプトを処理して終了します。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-chat-bot
    ```

3.  **インタラクティブモードで実行する:**
    `--interactive` フラグを使用すると、Agentと会話できるインタラクティブセッションが開始されます。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-chat-bot --interactive
    ```

### 異なるLLMの使用

`MODEL` 環境変数と対応するAPIキーを設定することで、異なるモデルを指定できます。以下は、いくつかの人気プロバイダーの設定です。

| プロバイダー | 環境変数 |
| :--- | :--- |
| **OpenAI** | `export MODEL=openai:gpt-4o`<br/>`export OPENAI_API_KEY=...` |
| **Anthropic** | `export MODEL=anthropic:claude-3-opus-20240229`<br/>`export ANTHROPIC_API_KEY=...` |
| **Google Gemini** | `export MODEL=gemini:gemini-1.5-flash`<br/>`export GEMINI_API_KEY=...` |
| **DeepSeek** | `export MODEL=deepseek/deepseek-chat`<br/>`export DEEPSEEK_API_KEY=...` |
| **AWS Bedrock** | `export MODEL=bedrock:anthropic.claude-3-sonnet-20240229-v1:0`<br/>`export AWS_ACCESS_KEY_ID=...`<br/>`export AWS_SECRET_ACCESS_KEY=...`<br/>`export AWS_REGION=...` |
| **Ollama** | `export MODEL=llama3`<br/>`export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434/v1"` |

## 事例ライブラリ

このセクションでは、AIGNEフレームワーク内の特定の機能やワークフローパターンを実証する、厳選された事例のリストを提供します。各カードをクリックすると、その事例の詳細なガイドに移動します。

### コア機能

<x-cards data-columns="2">
  <x-card data-title="Chatbot" data-icon="lucide:bot" data-href="/examples/chat-bot">
    ワンショットモードとインタラクティブモードの両方をサポートする基本的な会話型Agentを構築します。
  </x-card>
  <x-card data-title="AFS Local FS" data-icon="lucide:folder-git-2" data-href="/examples/afs-local-fs">
    ローカルファイルシステム上のファイルの読み書き、一覧表示ができるチャットボットを作成します。
  </x-card>
  <x-card data-title="Memory" data-icon="lucide:brain-circuit" data-href="/examples/memory">
    FSMemoryプラグインを使用して、永続的なメモリを持つAgentを実装します。
  </x-card>
  <x-card data-title="Nano Banana" data-icon="lucide:image" data-href="/examples/nano-banana">
    画像生成機能を備えたチャットボットの作成方法を実証します。
  </x-card>
</x-cards>

### ワークフローパターン

<x-cards data-columns="3">
  <x-card data-title="Sequential" data-icon="lucide:arrow-right-circle" data-href="/examples/workflow-sequential">
    組立ラインのように、一連のAgentを特定の順序で実行します。
  </x-card>
  <x-card data-title="Concurrency" data-icon="lucide:git-fork" data-href="/examples/workflow-concurrency">
    複数のAgentを同時に実行してタスクを並行処理し、効率を向上させます。
  </x-card>
  <x-card data-title="Router" data-icon="lucide:route" data-href="/examples/workflow-router">
    タスクを適切な専門Agentにインテリジェントに指示するマネージャーAgentを作成します。
  </x-card>
  <x-card data-title="Handoff" data-icon="lucide:arrow-right-left" data-href="/examples/workflow-handoff">
    あるAgentがその出力を別のAgentに渡してさらなる処理を行う、シームレスな移行を可能にします。
  </x-card>
  <x-card data-title="Reflection" data-icon="lucide:refresh-ccw" data-href="/examples/workflow-reflection">
    自己修正と改善のために自身の出力をレビューし、洗練させることができるAgentを構築します。
  </x-card>
  <x-card data-title="Orchestration" data-icon="lucide:users" data-href="/examples/workflow-orchestration">
    協力を必要とする複雑な問題を解決するために、複数のAgentを調整します。
  </x-card>
  <x-card data-title="Group Chat" data-icon="lucide:messages-square" data-href="/examples/workflow-group-chat">
    Agentが相互作用し、お互いのメッセージに基づいて構築できるマルチAgentディスカッションをシミュレートします。
  </x-card>
  <x-card data-title="Code Execution" data-icon="lucide:code-2" data-href="/examples/workflow-code-execution">
    動的に生成されたコードをAI駆動のワークフロー内で安全に実行します。
  </x-card>
</x-cards>

### MCPとインテグレーション

<x-cards data-columns="3">
  <x-card data-title="MCP Server" data-icon="lucide:server" data-href="/examples/mcp-server">
    AIGNE AgentをModel Context Protocol（MCP）サーバーとして実行し、そのスキルを公開します。
  </x-card>
  <x-card data-title="MCP Blocklet" data-icon="lucide:box" data-href="/examples/mcp-blocklet">
    Blockletと統合し、その機能をMCPスキルとして公開します。
  </x-card>
  <x-card data-title="MCP GitHub" data-icon="lucide:github" data-href="/examples/mcp-github">
    GitHub MCPサーバーに接続されたAgentを使用して、GitHubリポジトリと対話します。
  </x-card>
  <x-card data-title="MCP Puppeteer" data-icon="lucide:mouse-pointer-2" data-href="/examples/mcp-puppeteer">
    自動化されたウェブスクレイピングとブラウザ操作のためにPuppeteerを活用します。
  </x-card>
  <x-card data-title="MCP SQLite" data-icon="lucide:database" data-href="/examples/mcp-sqlite">
    SQLiteデータベースに接続し、スマートなデータベース操作を実行します。
  </x-card>
  <x-card data-title="DID Spaces Memory" data-icon="lucide:key-round" data-href="/examples/memory-did-spaces">
    DID Spacesを使用して、分散型IDとストレージでAgentのメモリを永続化します。
  </x-card>
</x-cards>

## デバッグ

Agentの実行に関する洞察を得るために、デバッグログを有効にするか、AIGNE観測サーバーを使用することができます。

### デバッグログの表示

`DEBUG` 環境変数を `*` に設定すると、モデルの呼び出しや応答を含む詳細なログが出力されます。

```sh icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --interactive
```

### 観測サーバーの使用

`aigne observe` コマンドは、実行トレースの検査、詳細な呼び出し情報の表示、およびAgentの動作の理解を支援するユーザーフレンドリーなインターフェースを提供するローカルウェブサーバーを起動します。これは、デバッグとパフォーマンスチューニングのための強力なツールです。

1.  **AIGNE CLIをインストールする:**

    ```sh icon=lucide:terminal
    npm install -g @aigne/cli
    ```

2.  **観測サーバーを起動する:**

    ```sh icon=lucide:terminal
    aigne observe
    ```

    ![A terminal showing the aigne observe command starting the server.](../../../examples/images/aigne-observe-execute.png)

3.  **トレースの表示:**
    Agentを実行した後、ブラウザで `http://localhost:7893` を開くと、最近の実行リストが表示され、各実行の詳細を検査できます。

    ![The AIGNE observability interface showing a list of traces.](../../../examples/images/aigne-observe-list.png)
