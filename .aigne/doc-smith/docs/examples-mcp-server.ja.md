# MCP サーバー

このガイドでは、AIGNE フレームワークのエージェントをモデルコンテキストプロトコル (MCP) サーバーとして実行するための包括的なウォークスルーを提供します。これらの手順に従うことで、カスタムエージェントを Claude Code などの MCP 互換クライアントのツールとして公開し、AI アシスタントの機能を効果的に拡張できます。

## 概要

[モデルコンテキストプロトコル (MCP)](https://modelcontextprotocol.io) は、AI アシスタントが幅広いデータソースやツールと安全に接続できるように設計されたオープンスタンダードです。MCP サーバーを実装することで、AIGNE エージェントをプロトコルをサポートする任意のクライアントで利用可能にできます。これにより、エージェント内で定義された専門的なスキルや機能で AI アシスタントを強化できます。

この例では、[AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md) を使用して [AIGNE フレームワーク](https://github.com/AIGNE-io/aigne-framework) のエージェントを提供し、Claude Code のようなクライアントに接続する方法を示します。

次の図は、AIGNE フレームワークのエージェントを MCP サーバーとして実行し、Claude Code のような MCP 互換クライアントに接続するワークフローを示しています。

```d2
direction: down

Client: {
  label: "MCP クライアント\n(例: Claude Code)"
  shape: rectangle
}

Developer: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

MCP-Server-Container: {
  label: "MCP サーバー (localhost)"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  MCP-Server: {
    label: "@aigne/example-mcp-server"
  }

  AIGNE-Agents: {
    label: "AIGNE フレームワークエージェント"
    shape: rectangle
    grid-columns: 3

    Current-Time-Agent: {
      label: "現在時刻 Agent"
    }
    Poet-Agent: {
      label: "詩人 Agent"
    }
    System-Info-Agent: {
      label: "システム情報 Agent"
    }
  }
}

Model-Providers: {
  label: "AI モデルプロバイダー"
  shape: rectangle

  Official-AIGNE-Hub: {
    label: "公式 AIGNE ハブ"
  }

  Self-Hosted-AIGNE-Hub: {
    label: "セルフホスト AIGNE ハブ"
  }

  Third-Party-Provider: {
    label: "サードパーティプロバイダー\n(例: OpenAI)"
  }
}

Observability-Server: {
  label: "AIGNE 可観測性サーバー"
  shape: rectangle
}

Developer -> AIGNE-CLI: "1. npx ... serve-mcp"
Developer -> Client: "2. claude mcp add ..."
Client -> MCP-Server-Container.MCP-Server: "3. エージェントスキルを呼び出す"
MCP-Server-Container.MCP-Server -> MCP-Server-Container.AIGNE-Agents: "4. エージェントロジックを実行する"
MCP-Server-Container.AIGNE-Agents -> Model-Providers: "5. AI モデルに接続する"
Model-Providers -> MCP-Server-Container.AIGNE-Agents: "6. モデルの出力を返す"
MCP-Server-Container.AIGNE-Agents -> MCP-Server-Container.MCP-Server: "7. 結果を送信する"
MCP-Server-Container.MCP-Server -> Client: "8. スキルの出力を返す"
Developer -> AIGNE-CLI: "(オプション) npx aigne observe"
AIGNE-CLI -> Observability-Server: "サーバーを起動する"
MCP-Server-Container.MCP-Server -> Observability-Server: "実行トレースを送信する"
```

## 前提条件

始める前に、開発環境が以下の要件を満たしていることを確認してください。

*   **Node.js**: バージョン 20.0 以上。
*   **npm**: Node.js のインストールに含まれています。
*   **OpenAI API キー**: OpenAI モデルと対話するエージェントに必要です。[OpenAI API キーのページ](https://platform.openai.com/api-keys)から取得できます。

## クイックスタート

ローカルにインストールすることなく、`npx` を使用して直接 MCP サーバーを起動できます。

### 1. MCP サーバーを実行する

ターミナルで以下のコマンドを実行して、ポート `3456` でサーバーを起動します。

```bash serve-mcp.sh icon=lucide:terminal
npx -y @aigne/example-mcp-server serve-mcp --port 3456
```

起動が成功すると、以下の出力が表示され、サーバーが実行中で接続を受け入れる準備ができていることを示します。

```bash Output
Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.
MCP server is running on http://localhost:3456/mcp
```

### 2. AI モデルに接続する

MCP サーバーによって提供されるエージェントが機能するには、基盤となる AI モデルが必要です。初めてサーバーを実行すると、モデルプロバイダーに接続するように求められます。いくつかのオプションがあります。

#### オプション A: 公式 AIGNE ハブ経由で接続する

これは新規ユーザーに推奨されるオプションです。
1.  ターミナルのプロンプトで最初のオプションを選択します。
2.  Web ブラウザで公式 AIGNE ハブのウェブサイトが開きます。
3.  画面の指示に従ってログインまたはサインアップします。新規ユーザーは自動的に 400,000 トークンの初期残高を受け取ります。

#### オプション B: セルフホスト AIGNE ハブ経由で接続する

AIGNE ハブのセルフホストインスタンスをお持ちの場合：
1.  2 番目のオプションを選択します。
2.  セルフホスト AIGNE ハブの URL を入力します。
3.  プロンプトに従って接続を完了します。
    - 独自の AIGNE ハブをセットアップするには、[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) からインストールできます。

#### オプション C: サードパーティのモデルプロバイダー経由で接続する

API キーの環境変数を設定することで、OpenAI のようなサードパーティプロバイダーに直接接続できます。

```bash configure-api-key.sh icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

環境変数を設定した後、MCP サーバーのコマンドを再起動します。DeepSeek や Google Gemini など他のプロバイダーの設定については、サンプルプロジェクト内の `.env.local.example` ファイルを参照してください。

## 利用可能なエージェント

この例では、それぞれが異なる機能を持ついくつかの事前構築済みエージェントを MCP ツールとして公開しています。

*   **現在時刻 Agent** (`agents/current-time.js`): 現在の日付と時刻を提供します。
*   **詩人 Agent** (`agents/poet.yaml`): 詩やその他の創造的なテキスト形式を生成します。
*   **システム情報 Agent** (`agents/system-info.js`): ホストシステムに関する情報を取得して表示します。

## MCP クライアントへの接続

MCP サーバーが実行されたら、互換性のある任意のクライアントに接続できます。以下の例では、[Claude Code](https://claude.ai/code) を使用します。

### Claude Code に MCP サーバーを追加する

次のコマンドを実行して、ローカルの MCP サーバーを `test` という名前のツールソースとして Claude Code に追加します。

```bash add-mcp-server.sh icon=lucide:terminal
claude mcp add -t http test http://localhost:3456/mcp
```

### Claude Code からエージェントを呼び出す

これで、Claude Code のインターフェースから直接エージェントのスキルを呼び出すことができます。

**例 1: システム情報 Agent の呼び出し**
システム情報を取得するには、`system-info` スキルをトリガーする質問をします。

![Claude Code からシステム情報 Agent を呼び出す](https://www.arcblock.io/image-bin/uploads/4824b6bf01f393a064fb36ca91feefcc.gif)

**例 2: 詩人 Agent の呼び出し**
詩を生成するには、`poet` スキルを呼び出すリクエストを記述します。

![Claude Code から詩人 Agent を呼び出す](https://www.arcblock.io/image-bin/uploads/d4b49b880c246f55e0809cdc712a5bdb.gif)

## デバッグと観測

AIGNE フレームワークには、エージェントの実行をリアルタイムで監視およびデバッグできる強力な可観測性ツールが含まれています。

### 可観測性サーバーを起動する

ローカルの監視ダッシュボードを起動するには、新しいターミナルウィンドウで次のコマンドを実行します。

```bash aigne-observe.sh icon=lucide:terminal
npx aigne observe --port 7890
```

### 実行トレースを表示する

Web ブラウザを開き、`http://localhost:7890` にアクセスします。ダッシュボードは、トレースの検査、各エージェント呼び出しに関する詳細情報の表示、および実行フローの理解を容易にするユーザーフレンドリーなインターフェースを提供します。これは、デバッグ、パフォーマンスチューニング、およびエージェントの動作に関する洞察を得るための不可欠なツールです。

![AIGNE 可観測性ダッシュボードで詩人 Agent のトレースを表示](https://www.arcblock.io/image-bin/uploads/bb39338e593abc6f544c12636d1db739.png)

## まとめ

これで、MCP サーバーを正常に起動し、AIGNE エージェントをツールとして公開し、MCP クライアントに接続することができました。この強力なパターンにより、カスタムで再利用可能なスキルを作成し、AI アシスタントのワークフローにシームレスに統合できます。

より高度な例やエージェントの種類については、[Examples](./examples.md) セクションの他のドキュメントを参照してください。独自のエージェントの作成についてさらに学ぶには、[開発者ガイド](./developer-guide-core-concepts-agents.md) を参照してください。