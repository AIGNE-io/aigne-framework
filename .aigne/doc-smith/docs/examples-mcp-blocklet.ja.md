# MCP Blocklet

このドキュメントでは、AIGNE Framework とモデルコンテキストプロトコル (MCP) を利用して、Blocklet プラットフォームでホストされているアプリケーションと対話する方法について説明します。このサンプルは、ワンショット実行、インタラクティブチャットモード、およびモデルと I/O パイプラインのカスタマイズ可能な設定をサポートしています。

## 前提条件

続行する前に、以下のコンポーネントがシステムにインストールされ、設定されていることを確認してください。

*   **Node.js**: バージョン 20.0 以上。
*   **npm**: Node.js のインストールに含まれています。
*   **OpenAI API キー**: OpenAI モデルと対話するために必要です。[OpenAI API キーのページ](https://platform.openai.com/api-keys) から取得できます。

以下の依存関係は任意であり、ソースコードからサンプルを実行する場合にのみ必要です。

*   **Bun**: JavaScript ランタイム。ここではテストとサンプルの実行に使用されます。
*   **pnpm**: パッケージマネージャ。

## クイックスタート

このセクションでは、ローカルにインストールせずにサンプルを直接実行する方法を説明します。

### サンプルを実行する

まず、ターゲットとなる Blocklet アプリケーションの URL を環境変数として設定します。

```bash Blocklet アプリの URL を設定する icon=lucide:terminal
export BLOCKLET_APP_URL="https://xxx.xxxx.xxx"
```

サンプルはいくつかのモードで実行できます。

*   **ワンショットモード (デフォルト)**: 単一のリクエストを送信し、レスポンスを受け取ります。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-mcp-blocklet
    ```

*   **インタラクティブチャットモード**: 継続的なチャットセッションを開始します。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-mcp-blocklet --interactive
    ```

*   **パイプライン入力**: パイプからの入力をプロンプトとして使用します。

    ```bash icon=lucide:terminal
    echo "What are the features of this blocklet app?" | npx -y @aigne/example-mcp-blocklet
    ```

### AI モデルに接続する

サンプルの実行には AI モデルへの接続が必要です。初回実行時に接続が設定されていない場合、接続方法を選択するよう求められます。

![AI モデル設定の初回接続プロンプト](../../../examples/mcp-blocklet/run-example.png)

接続を確立するには、いくつかの方法があります。

#### 1. 公式 AIGNE Hub 経由で接続する

これは推奨されるアプローチです。このオプションを選択すると、Web ブラウザで公式 AIGNE Hub の認証ページが開きます。画面の指示に従って接続を完了してください。新規ユーザーには自動的に 40 万トークンが付与されます。

![AIGNE CLI が AIGNE Hub に接続することを承認する](../../../examples/images/connect-to-aigne-hub.png)

#### 2. セルフホストの AIGNE Hub 経由で接続する

独自の AIGNE Hub インスタンスを運用している場合は、2 番目のオプションを選択します。セルフホストの Hub の URL を入力するよう求められますので、入力して接続を完了してください。

![セルフホストの AIGNE Hub の URL を入力する](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

セルフホストの AIGNE Hub をデプロイするには、[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ?utm_source=www.arcblock.io&utm_medium=blog_link&utm_campaign=default&utm_content=store.blocklet.dev#:~:text=%F0%9F%9A%80%20Get%20Started%20in%20Minutes) からインストールできます。

#### 3. サードパーティのモデルプロバイダー経由で接続する

適切な API キーを環境変数として設定することで、OpenAI などのサードパーティのモデルプロバイダーに直接接続できます。

```bash OpenAI API キーを設定する icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

さまざまなプロバイダー (例: DeepSeek, Google Gemini) でサポートされている環境変数の完全なリストについては、サンプルのソースコード内にある `.env.local.example` ファイルを参照してください。環境変数を設定した後、再度サンプルコマンドを実行してください。

### デバッグ

AIGNE Framework には、Agent の実行データを監視および分析するためのローカル観測可能性サーバーが含まれています。このツールは、デバッグ、パフォーマンスチューニング、および Agent の動作を理解するために不可欠です。

サーバーを起動するには、次のコマンドを実行します。

```bash 観測サーバーを起動する icon=lucide:terminal
aigne observe
```

![aigne observe コマンドが実行されているターミナルの出力](../../../examples/images/aigne-observe-execute.png)

サーバーが起動したら、`http://localhost:7893` の Web インターフェースにアクセスして、最近の Agent トレースのリストを表示し、詳細な呼び出し情報を確認できます。

![トレースのリストを表示する Aigne Observability の Web インターフェース](../../../examples/images/aigne-observe-list.png)

## ソースからのインストール

開発目的で、リポジトリのローカルクローンからサンプルを実行できます。

### 1. リポジトリをクローンする

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

サンプルのディレクトリに移動し、`pnpm` を使用して必要なパッケージをインストールします。

```bash icon=lucide:terminal
cd aigne-framework/examples/mcp-blocklet
pnpm install
```

### 3. サンプルを実行する

開始スクリプトを実行してアプリケーションを起動します。

```bash ワンショットモードで実行 icon=lucide:terminal
pnpm start
```

Blocklet アプリケーションの URL を引数として直接指定することもできます。

```bash icon=lucide:terminal
pnpm start https://your-blocklet-app-url
```

## 実行オプション

このアプリケーションは、カスタマイズのためにいくつかのコマンドラインパラメータをサポートしています。

| パラメータ | 説明 | デフォルト |
| :--- | :--- | :--- |
| `--interactive` | インタラクティブチャットモードを有効にします。 | 無効 |
| `--model <provider[:model]>` | 使用する AI モデルを指定します。フォーマットは `provider[:model]` です。例: `openai` または `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | モデル生成の temperature を設定します。 | プロバイダーのデフォルト |
| `--top-p <value>` | top-p サンプリングの値を設定します。 | プロバイダーのデフォルト |
| `--presence-penalty <value>`| presence penalty の値を設定します。 | プロバイダーのデフォルト |
| `--frequency-penalty <value>`| frequency penalty の値を設定します。 | プロバイダーのデフォルト |
| `--log-level <level>` | ログレベルを設定します。オプション: `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`。 | `INFO` |
| `--input`, `-i <input>` | コマンドライン経由で直接入力を提供します。 | なし |

`pnpm` を使用してソースから実行する場合、引数をスクリプトに渡すには `--` を使用する必要があります。

**例:**

```bash インタラクティブチャットモードで実行 icon=lucide:terminal
pnpm start -- --interactive
```

```bash ログレベルを DEBUG に設定 icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

```bash パイプライン入力を使用 icon=lucide:terminal
echo "What are the features of this blocklet app?" | pnpm start
```

## まとめ

このガイドでは、クイックスタート実行、モデル設定、デバッグ、ローカルインストールなど、MCP Blocklet サンプルを実行するプロセスについて詳しく説明しました。より高度なユースケースや関連する概念については、以下のドキュメントを参照してください。

<x-cards data-columns="2">
  <x-card data-title="MCP サーバー" data-icon="lucide:server" data-href="/examples/mcp-server">
    AIGNE Framework の Agent をモデルコンテキストプロトコル (MCP) サーバーとして実行する方法を学びます。
  </x-card>
  <x-card data-title="MCP Agent" data-icon="lucide:bot" data-href="/developer-guide/agents/mcp-agent">
    MCP を介して外部システムに接続し、対話する方法を理解します。
  </x-card>
</x-cards>
