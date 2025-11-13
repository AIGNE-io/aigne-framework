# MCP Blocklet

このドキュメントでは、AIGNE フレームワークとモデルコンテキストプロトコル (MCP) を使用して、Blocklet プラットフォームでホストされているアプリケーションと対話するための技術ガイドを提供します。開発者向けに、必要な前提条件、クイックスタート手順、モデル接続方法、および高度な設定オプションについて概説します。

```d2
direction: down

Developer: {
  shape: c4-person
}

Execution-Environment: {
  label: "実行環境"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  MCP-Blocklet-Example: {
    label: "@aigne/example-mcp-blocklet"
    shape: rectangle
  }

  AIGNE-Observe: {
    label: "aigne observe"
    shape: rectangle
  }
}

Blocklet-Application: {
  label: "ターゲット Blocklet アプリケーション"
  shape: rectangle
  icon: "https://www.arcblock.io/image-bin/uploads/eb1cf5d60cd85c42362920c49e3768cb.svg"
}

AI-Model-Providers: {
  label: "AI モデルプロバイダー"
  shape: rectangle

  AIGNE-Hub-Official: {
    label: "AIGNE Hub (公式)"
  }

  Self-Hosted-AIGNE-Hub: {
    label: "セルフホスト AIGNE Hub"
  }

  Third-Party-Provider: {
    label: "サードパーティプロバイダー (例: OpenAI)"
  }
}

Developer -> Execution-Environment.MCP-Blocklet-Example: "`npx` または `pnpm start` で実行"
Developer -> Execution-Environment.AIGNE-Observe: "デバッグに使用"
Execution-Environment.MCP-Blocklet-Example -> Blocklet-Application: "と対話"
Execution-Environment.MCP-Blocklet-Example -> AI-Model-Providers: "いずれかに接続"
Execution-Environment.AIGNE-Observe -> Execution-Environment.MCP-Blocklet-Example: "実行データを監視"
```

## 前提条件

続行する前に、ローカルの開発マシンに以下の依存関係がインストールされ、正しく設定されていることを確認してください。

*   **Node.js:** バージョン 20.0 またはそれ以降のリリース。
*   **npm:** Node.js に同梱されている Node Package Manager。
*   **OpenAI API キー:** OpenAI モデルと連携するためにアクティブな API キーが必要です。キーは [OpenAI API キーページ](https://platform.openai.com/api-keys) から生成できます。

ソースコードからサンプルを実行する開発者には、以下も必要です。

*   **Bun:** ユニットテストやサンプルの実行に使用される JavaScript ランタイム。
*   **pnpm:** プロジェクトの依存関係を管理するためのパッケージマネージャー。

## クイックスタート

このセクションでは、`npx` を介して直接サンプルを実行する手順を概説します。この方法では、プロジェクトリポジトリをローカルにインストールする必要はありません。

まず、`BLOCKLET_APP_URL` 環境変数を設定して、ターゲットの Blocklet アプリケーションを指すようにします。

```bash Blocklet App URL を設定 icon=lucide:terminal
export BLOCKLET_APP_URL="https://xxx.xxxx.xxx"
```

### 実行モード

このサンプルは、主に2つの操作モードをサポートしています。

#### ワンショットモード

デフォルトのワンショットモードでは、Agent は単一のリクエストを処理した後に終了します。

```bash ワンショットモードで実行 icon=lucide:terminal
npx -y @aigne/example-mcp-blocklet
```

標準のパイプラインを介して入力を提供することもでき、これはスクリプト作成に便利です。

```bash パイプライン入力で実行 icon=lucide:terminal
echo "What are the features of this blocklet app?" | npx -y @aigne/example-mcp-blocklet
```

#### 対話型チャットモード

持続的な対話セッションを行うには、`--chat` フラグを付けてサンプルを実行します。

```bash 対話モードで実行 icon=lucide:terminal
npx -y @aigne/example-mcp-blocklet --chat
```

### AI モデルへの接続

Agent が機能するためには、AI モデルへの接続が必要です。以下の接続方法がサポートされています。

#### 1. AIGNE Hub (公式)

初回実行時に、モデルプロバイダーへの接続を促されます。最初のオプションである公式 AIGNE Hub を介した接続は、新規ユーザーに推奨されます。この方法は、マネージドサービスと初期使用のための無料トークン割り当てを提供します。

#### 2. セルフホスト AIGNE Hub

または、セルフホストの AIGNE Hub インスタンスに接続することもできます。2番目のオプションを選択し、デプロイしたインスタンスの URL を提供します。セルフホスト Hub は [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) からインストールできます。

#### 3. サードパーティモデルプロバイダー

サードパーティのモデルプロバイダーとの直接統合は、環境変数を介してサポートされています。たとえば、OpenAI を使用するには、`OPENAI_API_KEY` 変数を設定します。

```bash OpenAI API キーを設定 icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

サポートされているプロバイダーとその必要な環境変数の完全なリストについては、`.env.local.example` ファイルを参照してください。変数を設定した後、`npx` コマンドを再実行します。

## ソースから実行

開発や変更を目的として、リポジトリのローカルクローンからサンプルを実行できます。

### 1. リポジトリをクローンする

Git を使用して `aigne-framework` リポジトリをクローンします。

```bash リポジトリをクローン icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

サンプルのディレクトリに移動し、`pnpm` を使用して依存関係をインストールします。

```bash 依存関係をインストール icon=lucide:terminal
cd aigne-framework/examples/mcp-blocklet
pnpm install
```

### 3. サンプルを実行する

`pnpm start` コマンドを使用して、スクリプトをデフォルトのワンショットモードで実行します。

```bash サンプルを実行 icon=lucide:terminal
pnpm start
```

Blocklet アプリケーションの URL をコマンドライン引数として提供することもできます。

```bash 特定の URL で実行 icon=lucide:terminal
pnpm start https://your-blocklet-app-url
```

## コマンドラインオプション

サンプルの動作は、以下に詳述するコマンドラインパラメータを使用して変更できます。`pnpm start` を介してソースから実行する場合、スクリプトのコマンドライン引数の前に `--` を付ける必要があります。

| パラメータ | 説明 | デフォルト |
| :--- | :--- | :--- |
| `--chat` | Agent を対話型チャットモードで実行します。 | 無効 |
| `--model <provider[:model]>` | 使用する AI モデルを指定します。フォーマット: `'provider[:model]'`。例: `'openai'` または `'openai:gpt-4o-mini'`。 | `openai` |
| `--temperature <value>` | モデル生成の temperature を設定します。 | プロバイダーのデフォルト |
| `--top-p <value>` | モデル生成の top-p サンプリング値を設定します。 | プロバイダーのデフォルト |
| `--presence-penalty <value>` | モデル生成の presence penalty 値を設定します。 | プロバイダーのデフォルト |
| `--frequency-penalty <value>` | モデル生成の frequency penalty 値を設定します。 | プロバイダーのデフォルト |
| `--log-level <level>` | ログの詳細度を設定します。受け入れられる値: `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 引数として直接入力を提供します。 | `None` |

### 使用例

```bash 対話モードで実行 icon=lucide:terminal
pnpm start -- --chat
```

```bash ログレベルを DEBUG に設定 icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

```bash パイプライン入力を使用 icon=lucide:terminal
echo "What are the features of this blocklet app?" | pnpm start
```

## デバッグ

AIGNE フレームワークには `aigne observe` が含まれています。これは、Agent の実行データを監視および分析するためのローカル Web サーバーを起動するコマンドラインツールです。このツールは、デバッグ、パフォーマンス分析、および Agent の動作を理解するために不可欠です。

専用のターミナルセッションで観測サーバーを起動します。Agent を実行した後、Web インターフェースには最近の実行リストが表示され、詳細なトレース、呼び出し情報、およびランタイムメトリクスが提供されます。

## まとめ

このドキュメントでは、MCP Blocklet サンプルの実行手順について詳述し、前提条件、`npx` を使用したクイックスタート実行、さまざまなモデル接続方法、およびソースからの実行について説明しました。MCP 統合の追加の例については、以下のガイドを参照してください。

<x-cards data-columns="2">
  <x-card data-title="MCP Server" data-icon="lucide:server" data-href="/examples/mcp-server">AIGNE フレームワーク Agent をモデルコンテキストプロトコル (MCP) サーバーとして実行する方法を学びます。</x-card>
  <x-card data-title="MCP DID Spaces" data-icon="lucide:space" data-href="/examples/mcp-did-spaces">MCP DID Spaces 統合を使用してチャットボットを作成し、DID Spaces の機能をスキルとして公開する方法をご覧ください。</x-card>
</x-cards>