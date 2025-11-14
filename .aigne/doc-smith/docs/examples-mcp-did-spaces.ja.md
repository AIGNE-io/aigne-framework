# MCP DID Spaces

このドキュメントは、モデルコンテキストプロトコル (MCP) を介して DID Spaces と統合されたチャットボットを構築するための包括的なガイドを提供します。これらの指示に従うことで、[AIGNE フレームワーク](https://github.com/AIGNE-io/aigne-framework) の機能を活用し、分散ストレージ環境で安全にファイルにアクセスし管理できる AI Agent を作成できます。

## 前提条件

この例を正常に実行するためには、以下のコンポーネントがインストールされ、設定されていることを確認してください。

*   **Node.js**: バージョン 20.0 以降。
*   **OpenAI API キー**: AI モデルには有効な API キーが必要です。キーは [OpenAI プラットフォーム](https://platform.openai.com/api-keys) から取得できます。
*   **DID Spaces MCP サーバーの認証情報**: 指定された DID Space とのやり取りには認証情報が必要です。

## クイックスタート

この例は、`npx` を使用してローカルにインストールすることなく、ターミナルから直接実行できます。

### 1. 環境変数の設定

まず、DID Spaces サーバーの認証情報で環境変数を設定します。スペースの URL とアクセスキーは、Blocklet の管理設定から生成できます。

```bash DID Spaces の認証情報を設定 icon=lucide:terminal
# あなたの DID Spaces アプリケーションの URL に置き換えてください
export DID_SPACES_URL="https://spaces.staging.arcblock.io/app"

# プロフィール -> 設定 -> アクセスキーでキーを作成し、認証タイプを「シンプル」に設定します
export DID_SPACES_AUTHORIZATION="blocklet-xxx"
```

### 2. サンプルの実行

環境変数を設定したら、以下のコマンドを実行してチャットボットを初期化します。

```bash サンプルの実行 icon=lucide:terminal
npx -y @aigne/example-mcp-did-spaces
```

### 3. AI モデルへの接続

チャットボットが動作するには、大規模言語モデル (LLM) への接続が必要です。初回実行時には、接続設定をガイドするプロンプトが表示されます。

![AI モデル接続の初回プロンプト](../../../examples/mcp-did-spaces/run-example.png)

接続を確立するには、主に 3 つの方法があります。

#### オプション 1: AIGNE Hub (推奨)

これが最も直接的な方法です。公式の AIGNE Hub は、新規ユーザーに無料のトークンを提供しています。このオプションを使用するには、プロンプトで最初の選択肢を選びます。Web ブラウザが AIGNE Hub の認証ページで開き、そこで接続リクエストを承認できます。

![AIGNE Hub 接続の承認](../../../examples/images/connect-to-aigne-hub.png)

#### オプション 2: セルフホストの AIGNE Hub

プライベートな AIGNE Hub インスタンスを運用しているユーザーは、2 番目のオプションを選択します。セルフホストのハブの URL を入力するよう求められます。個人用の AIGNE Hub をデプロイする手順は、[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) で入手できます。

![セルフホストの AIGNE Hub に接続](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### オプション 3: サードパーティのモデルプロバイダー

OpenAI などのサードパーティ LLM プロバイダーとの直接統合もサポートされています。対応する API キーを環境変数として設定し、再度実行コマンドを実行します。

```bash OpenAI API キーの設定 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

DeepSeek や Google Gemini などのプロバイダーを含む追加の設定例については、ソースリポジトリ内の `.env.local.example` ファイルを参照してください。

AI モデルが接続されると、この例はあなたの DID Space に対して一連のテスト操作を実行し、その結果をコンソールにログ出力し、結果をまとめたマークダウンファイルを生成します。

## 仕組み

この例では、`MCPAgent` を使用して、モデルコンテキストプロトコル (MCP) を介して DID Spaces サーバーと通信します。このプロトコルにより、Agent は「スキル」を動的に発見して利用できます。スキルは DID Spaces の機能に直接マッピングされます。

以下の図は、操作の流れを示しています。

```d2
direction: down

AI-Agent: {
  label: "AI Agent"
  shape: rectangle
}

MCPAgent: {
  label: "MCPAgent"
  shape: rectangle
}

DID-Spaces-Server: {
  label: "DID Spaces MCP サーバー"
  shape: rectangle

  Skills: {
    label: "利用可能なスキル"
    shape: rectangle
    list-objects: "list_objects"
    write-object: "write_object"
    read-object: "read_object"
    head-space: "head_space"
    delete-object: "delete_object"
  }
}

DID-Space: {
  label: "DID Space"
  shape: cylinder
}

AI-Agent -> MCPAgent: "3. コマンド実行\n(例: 'ファイルを一覧表示')"
MCPAgent -> DID-Spaces-Server: "1. 接続と認証"
DID-Spaces-Server -> MCPAgent: "2. スキルを提供"
MCPAgent -> DID-Space: "4. スキル経由で操作を実行"

```

操作の流れは以下の通りです。
1. `MCPAgent` は、指定された DID Spaces MCP サーバーのエンドポイントに接続します。
2. 提供された認証情報を使用して認証します。
3. サーバーは、`list_objects` や `write_object` などの一連のスキルを Agent が利用できるようにします。
4. `MCPAgent` はこれらのスキルを統合し、プライマリ AI Agent がユーザーの入力やプログラムされたロジックに応じて、DID Space 内でファイルやデータの管理タスクを実行できるようにします。

### 利用可能なスキル

この統合により、Agent が利用できるいくつかの主要な DID Spaces 操作がスキルとして公開されます。

| スキル | 説明 |
| --------------- | ---------------------------------------------- |
| `head_space` | DID Space に関するメタデータを取得します。 |
| `read_object` | 指定されたオブジェクト (ファイル) の内容を読み取ります。 |
| `write_object` | オブジェクト (ファイル) に新しい内容を書き込みます。 |
| `list_objects` | ディレクトリ内のすべてのオブジェクト (ファイル) を一覧表示します。 |
| `delete_object` | 指定されたオブジェクト (ファイル) を削除します。 |

## 設定

本番環境へのデプロイでは、Agent の設定を特定の MCP サーバーを対象とし、安全な認証トークンを使用するように更新する必要があります。`MCPAgent` はサーバーの URL と適切な認証ヘッダーでインスタンス化されます。

```typescript agent-config.ts icon=logos:typescript
const mcpAgent = await MCPAgent.from({
  url: "YOUR_MCP_SERVER_URL",
  transport: "streamableHttp",
  opts: {
    requestInit: {
      headers: {
        Authorization: "Bearer YOUR_TOKEN",
      },
    },
  },
});
```

## デバッグ

`aigne observe` コマンドは、Agent の実行時の動作を監視および分析するためのツールを提供します。実行トレースを可視化するローカルウェブサーバーを起動し、入力、出力、ツールとのやり取り、パフォーマンスメトリクスに関する洞察を提供します。

1. **監視サーバーを起動します。**

    ```bash aigne observe icon=lucide:terminal
    aigne observe
    ```

    ![ターミナルで起動中の AIGNE Observe サーバー](../../../examples/images/aigne-observe-execute.png)

2. **実行トレースを表示します。**

    ウェブインターフェース `http://localhost:7893` にアクセスして、最近の Agent 実行のリストを確認します。各トレースを詳細に分析して、Agent の操作を調べることができます。

    ![AIGNE Observe のトレースリスト](../../../examples/images/aigne-observe-list.png)

## ローカルでのインストールとテスト

ソースコードを変更する開発者向けに、以下の手順でローカルでのセットアップとテストのプロセスを概説します。

### 1. リポジトリをクローンする

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

サンプルのディレクトリに移動し、`pnpm` を使用して必要なパッケージをインストールします。

```bash icon=lucide:terminal
cd aigne-framework/examples/mcp-did-spaces
pnpm install
```

### 3. サンプルを実行する

開始スクリプトを実行して、ローカルソースからアプリケーションを実行します。

```bash icon=lucide:terminal
pnpm start
```

### 4. テストを実行する

統合と機能性を検証するために、テストスイートを実行します。

```bash icon=lucide:terminal
pnpm test:llm
```

テストプロセスでは、MCP サーバーへの接続を確立し、利用可能なスキルを列挙し、基本的な DID Spaces 操作を実行して、統合が期待通りに機能していることを確認します。