このガイドでは、AIGNE Framework の Agent をモデルコンテキストプロトコル（MCP）サーバーとして実行する方法について説明します。このドキュメントを読み終える頃には、サーバーを起動し、AI モデルに接続し、Claude Code のような MCP 互換クライアントを使用して Agent と対話できるようになります。

モデルコンテキストプロトコル（MCP）は、AIアシスタントが様々なデータソースやツールに安全に接続できるように設計されたオープンスタンダードです。AIGNE Agent を MCP サーバーとして公開することで、カスタム Agent の専門的なスキルや機能を MCP 互換クライアントに拡張できます。

以下の図は、AIGNE MCP サーバーが Agent を AI モデルおよび MCP 互換クライアントに接続する仕組みを示しています。

<!-- DIAGRAM_IMAGE_START:guide:4:3 -->
![This guide provides instructions on how to run AIGNE Framework agents as a Model Context Protocol...](assets/diagram/examples-mcp-server-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 前提条件

先に進む前に、開発環境が以下の要件を満たしていることを確認してください。

*   **Node.js:** バージョン 20.0 以上。
*   **AI モデルへのアクセス:** OpenAI などのサポートされている大規模言語モデルプロバイダーの API キー。

## クイックスタート

`npx` を使用すると、ローカルにインストールすることなく直接サンプルを実行できます。

### 1. MCP サーバーを実行する

ターミナルで以下のコマンドを実行し、MCP サーバーのサンプルをダウンロードして起動します。

```sh serve-mcp icon=lucide:terminal
npx -y @aigne/example-mcp-server serve-mcp --port 3456
```

正常に実行されるとサーバーが起動し、MCP サーバーがアクティブであり接続を待機していることを確認する以下の出力が表示されます。

```sh Expected Output icon=lucide:terminal
Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.
MCP server is running on http://localhost:3456/mcp
```

### 2. AI モデルに接続する

MCP サーバーが機能するには、大規模言語モデルへの接続が必要です。初めてサーバーを実行する場合、コマンドラインプロンプトが表示され、接続プロセスを案内します。

![AI モデルへの接続を求めるターミナルのプロンプト。](../../../examples/mcp-server/run-example.png)

AI モデルへの接続には、主に3つの選択肢があります。

#### オプション1：AIGNE Hub（推奨）

公式の AIGNE Hub に接続すると、すぐに開始できます。新規ユーザーは無料クレジットを受け取れるため、評価にはこれが最も簡単なオプションです。プロンプトで最初のオプションを選択すると、ウェブブラウザが開き、認証プロセスを案内します。

![AIGNE Hub の認証ページ。](../../../examples/images/connect-to-aigne-hub.png)

#### オプション2：セルフホストの AIGNE Hub

組織がセルフホストの AIGNE Hub インスタンスを使用している場合は、2番目のオプションを選択し、プロンプトが表示されたらハブインスタンスの URL を入力します。

![セルフホストの AIGNE Hub の URL 入力を求めるターミナルのプロンプト。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### オプション3：サードパーティのモデルプロバイダー

適切な環境変数を設定することで、サードパーティのモデルプロバイダーに直接接続できます。例えば、OpenAI を使用するには、サーバーコマンドを実行する前に API キーをエクスポートします。

```sh Configure OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

環境変数を設定した後、`serve-mcp` コマンドを再起動します。

## 利用可能な Agent

このサンプルでは、それぞれが異なる機能を持つ、いくつかの事前設定された Agent を MCP ツールとして公開しています。

*   **Current Time Agent:** 現在の時刻を提供します。`agents/current-time.js` で定義されています。
*   **Poet Agent:** 詩やその他の創造的なテキスト形式を生成します。`agents/poet.yaml` で定義されています。
*   **System Info Agent:** ホストシステムに関する情報を取得します。`agents/system-info.js` で定義されています。

## MCP クライアントへの接続

MCP サーバーが実行されたら、任意の MCP 互換クライアントから接続できます。以下の例では Claude Code を使用します。

まず、[Claude Code](https://claude.ai/code) がインストールされていることを確認します。次に、以下のコマンドを使用して AIGNE MCP サーバーをツールソースとして追加します。

```sh Add MCP Server to Claude icon=lucide:terminal
claude mcp add -t http test http://localhost:3456/mcp
```

サーバーを追加した後、Claude Code のインターフェースから直接 Agent のスキルを呼び出すことができます。

## Agent の実行を監視する

AIGNE Framework には、Agent の振る舞いをリアルタイムで監視およびデバッグできる可観測性ツールが含まれています。このツールは、トレースの分析、入力と出力の検査、Agent のパフォーマンス理解に不可欠です。

### 1. オブザーバーを起動する

ローカルの可観測性ウェブサーバーを起動するには、新しいターミナルウィンドウで以下のコマンドを実行します。

```sh Start Observability Server icon=lucide:terminal
npx aigne observe --port 7890
```

サーバーが起動し、ダッシュボードにアクセスするための URL が提供されます。

![可観測性サーバーが実行中であることを示すターミナルの出力。](../../../examples/images/aigne-observe-execute.png)

### 2. トレースを表示する

ウェブブラウザで `http://localhost:7890` を開き、AIGNE の可観測性ダッシュボードにアクセスします。「Traces」ビューには、レイテンシー、トークン使用量、ステータスなどの詳細を含む、最近の Agent 実行のリストが表示されます。

![トレースのリストを表示している Aigne 可観測性インターフェース。](../../../examples/images/aigne-observe-list.png)