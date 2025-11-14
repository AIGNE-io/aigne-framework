# MCP サーバー

このガイドでは、AIGNE Framework の Agent をモデルコンテキストプロトコル (MCP) サーバーとして実行する方法について説明します。これらの手順に従うことで、カスタム Agent を Claude Code などの MCP 互換クライアントにツールとして公開し、その機能を拡張できます。

## 概要

[モデルコンテキストプロトコル (MCP)](https://modelcontextprotocol.io) は、AI アシスタントがさまざまなデータソースやツールに安全に接続できるように設計されたオープンスタンダードです。AIGNE Agent を MCP サーバーとして運用することで、MCP 互換クライアントを Agent の専門的な機能で強化できます。

## 前提条件

続行する前に、以下の要件が満たされていることを確認してください：

*   **Node.js:** バージョン 20.0 以上がインストールされている必要があります。[nodejs.org](https://nodejs.org) からダウンロードできます。
*   **AI モデルプロバイダー:** Agent が機能するには、[OpenAI](https://platform.openai.com/api-keys) などのプロバイダーからの API キーが必要です。

## クイックスタート

`npx` を使用すると、ローカルにインストールすることなく、MCP サーバーを直接起動できます。

### 1. MCP サーバーを実行する

ターミナルで次のコマンドを実行して、ポート `3456` でサーバーを起動します：

```bash server.js icon=lucide:terminal
npx -y @aigne/example-mcp-server serve-mcp --port 3456
```

正常に実行されると、サーバーが起動し、MCP サーバーがアクティブでアクセス可能であることを示す次の出力が表示されます。

```bash
Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.
MCP server is running on http://localhost:3456/mcp
```

### 2. AI モデルに接続する

Agent は、リクエストを処理するために大規模言語モデル (LLM) への接続を必要とします。モデルプロバイダーを設定せずにサーバーを実行すると、接続方法を選択するように求められます。

![AI モデル設定の初期接続プロンプト。](../../../examples/mcp-server/run-example.png)

AI モデルへの接続には、主に 3 つのオプションがあります。

#### オプション A: 公式 AIGNE Hub に接続する

これは、新規ユーザーに推奨される方法です。

1.  最初のオプション「Arcblock 公式 AIGNE Hub に接続する」を選択します。
2.  Web ブラウザが開き、AIGNE Hub の承認ページが表示されます。
3.  画面の指示に従って接続を承認します。新規ユーザーには、評価目的で 400,000 トークンが自動的に付与されます。

![AIGNE Hub 承認ダイアログ。](../../../examples/images/connect-to-aigne-hub.png)

#### オプション B: セルフホストの AIGNE Hub に接続する

独自の AIGNE Hub インスタンスを運用している場合は、2 番目のオプションを選択します。

1.  セルフホストの AIGNE Hub の URL を入力するように求められます。
2.  URL を入力し、その後のプロンプトに従って接続を完了します。

セルフホストの AIGNE Hub をデプロイする手順については、[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ?utm_source=www.arcblock.io&utm_medium=blog_link&utm_campaign=default&utm_content=store.blocklet.dev#:~:text=%F0%9F%9A%80%20Get%20Started%20in%20Minutes) にアクセスしてください。

![セルフホストの AIGNE Hub URL を入力するプロンプト。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### オプション C: サードパーティのモデルプロバイダー経由で接続する

適切な API キーを環境変数として設定することで、OpenAI などのサードパーティのモデルプロバイダーに直接接続できます。

例えば、OpenAI を使用するには、`OPENAI_API_KEY` 変数を設定します：

```bash .env icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

環境変数を設定した後、MCP サーバーコマンドを再起動します。DeepSeek や Google Gemini などの他のプロバイダーでサポートされている変数の一覧については、リポジトリ内のサンプル設定ファイルを参照してください。

## 利用可能な Agent

この例では、それぞれが異なる機能を持つ、いくつかの事前構築済み Agent を MCP ツールとして公開しています：

| Agent | ファイルパス | 説明 |
| ----------------- | -------------------------- | ------------------------------------- |
| Current Time | `agents/current-time.js` | 現在の日付と時刻を提供します。 |
| Poet | `agents/poet.yaml` | 詩や創造的なテキストを生成します。 |
| System Info | `agents/system-info.js` | システムに関する情報を報告します。 |

## MCP クライアントへの接続

サーバーが実行されたら、MCP 互換のクライアントに接続できます。次の例では [Claude Code](https://claude.ai/code) を使用しています。

1.  次のコマンドで、実行中の MCP サーバーを Claude Code に追加します：

    ```bash icon=lucide:terminal
    claude mcp add -t http test http://localhost:3456/mcp
    ```

2.  クライアント内から Agent を呼び出します。例えば、システム情報を要求したり、詩を依頼したりできます。

    **例：System Info Agent の呼び出し**
    ![Claude Code から System Info Agent を呼び出す。](https://www.arcblock.io/image-bin/uploads/4824b6bf01f393a064fb36ca91feefcc.gif)

    **例：Poet Agent の呼び出し**
    ![Claude Code から Poet Agent を呼び出す。](https://www.arcblock.io/image-bin/uploads/d4b49b880c246f55e0809cdc712a5bdb.gif)

## Agent アクティビティの監視

AIGNE には、Agent の実行をリアルタイムで監視およびデバッグできる可観測性ツールが含まれています。

1.  新しいターミナルウィンドウで次のコマンドを実行して、可観測性サーバーを起動します：

    ```bash icon=lucide:terminal
    npx aigne observe --port 7890
    ```

    ![AIGNE observe サーバー起動後のターミナル出力。](../../../examples/images/aigne-observe-execute.png)

2.  Web ブラウザを開き、`http://localhost:7890` にアクセスします。

ダッシュボードは、実行トレースの検査、詳細な呼び出し情報の表示、Agent の動作の理解を可能にするユーザーフレンドリーなインターフェースを提供します。これは、デバッグ、パフォーマンスチューニング、および Agent が情報をどのように処理するかについての洞察を得るための不可欠なツールです。

![可観測性 UI の最近の実行リスト。](../../../examples/images/aigne-observe-list.png)

以下は、Poet Agent によって処理されたリクエストの詳細なトレースの例です。

![Poet Agent の詳細トレースビュー。](https://www.arcblock.io/image-bin/uploads/bb39338e593abc6f544c12636d1db739.png)

## まとめ

これで、MCP サーバーを起動し、AI モデルに接続し、AIGNE Agent を MCP クライアントにツールとして公開することに成功しました。これにより、カスタムロジックやデータソースで AI アシスタントの機能を拡張できます。

より高度な例や Agent の種類については、次のセクションを参照してください：

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-icon="lucide:box" data-href="/developer-guide/agents/mcp-agent">
    モデルコンテキストプロトコル (MCP) を介して外部システムに接続し、対話する方法を学びます。
  </x-card>
  <x-card data-title="MCP GitHub Example" data-icon="lucide:github" data-href="/examples/mcp-github">
    MCP サーバーを使用して GitHub リポジトリと対話する例をご覧ください。
  </x-card>
</x-cards>