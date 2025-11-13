# MCP SQLite

このガイドでは、AIGNEフレームワークとモデルコンテキストプロトコル（MCP）を使用してSQLiteデータベースを操作するための包括的なウォークスルーを提供します。この例に従うことで、自然言語のコマンドを通じて、テーブルの作成、データの挿入、レコードのクエリなどのデータベース操作を実行できるAgentをセットアップする方法を学びます。

## 概要

MCP SQLiteの例は、MCPサーバーを介してAI Agentを外部のSQLiteデータベースに接続する方法を示しています。これにより、Agentはデータの作成、読み取り、書き込みなど、データベース管理のための事前定義された一連のスキルを活用できます。Agentはユーザーのリクエストを解釈し、それらを適切なデータベースコマンドに変換し、SQLite MCPサーバーを通じて実行します。

基本的なワークフローは次のとおりです：
1.  ユーザーが自然言語のコマンドを提供します（例：「製品テーブルを作成して」）。
2.  `AIAgent`がコマンドを処理します。
3.  Agentは、SQLiteサーバーに接続された`MCPAgent`から適切なスキル（例：`create_table`）を特定します。
4.  `MCPAgent`がデータベース上で対応するSQLコマンドを実行します。
5.  結果がAgentに返され、Agentはユーザーへの応答を作成します。

次の図は、このワークフローを示しています：

```d2
direction: down

User: {
  shape: c4-person
}

AIAgent: {
  label: "AI Agent"
  shape: rectangle
}

MCPAgent: {
  label: "MCP Agent \n(SQLiteスキル)"
  shape: rectangle
}

SQLite-DB: {
  label: "SQLiteデータベース"
  shape: cylinder
}

User -> AIAgent: "1. 自然言語コマンド\n(例: 'テーブルを作成して')"
AIAgent -> MCPAgent: "2. スキルを選択して呼び出す\n(例: create_table)"
MCPAgent -> SQLite-DB: "3. SQLコマンドを実行"
SQLite-DB -> MCPAgent: "4. 結果を返す"
MCPAgent -> AIAgent: "5. 結果を転送"
AIAgent -> User: "6. 応答を作成して送信"

```

## 前提条件

先に進む前に、開発環境が次の要件を満たしていることを確認してください：

*   **Node.js**: バージョン20.0以上。
*   **npm**: Node.jsに同梱されています。
*   **uv**: Pythonの仮想環境およびパッケージインストーラー。[uvインストールガイド](https://github.com/astral-sh/uv)でセットアップ手順を確認してください。
*   **AIモデルAPIキー**: OpenAIなどのサポートされているプロバイダーからのAPIキー。

## クイックスタート

ローカルにインストールすることなく、`npx`を使用してこの例を直接実行できます。これは、MCP SQLite連携を最も早く確認する方法です。

### 例の実行

ターミナルで次のコマンドを実行してください。この例は、単一コマンド用のワンショットモードと、対話型のチャットモードをサポートしています。

1.  **ワンショットモード（デフォルト）**
    このモードは単一のコマンドを受け取り、それを実行して終了します。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-mcp-sqlite --input "create a product table with columns name, description, and createdAt"
    ```

2.  **パイプライン入力**
    入力をコマンドに直接パイプすることもできます。

    ```bash icon=lucide:terminal
    echo "how many products are in the table?" | npx -y @aigne/example-mcp-sqlite
    ```

3.  **対話型チャットモード**
    対話形式で利用するには、`--chat`フラグを使用します。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-mcp-sqlite --chat
    ```

### AIモデルへの接続

コマンドを実行するには、Agentが大規模言語モデルに接続する必要があります。これにはいくつかのオプションがあります。

*   **AIGNE Hub（推奨）**: 初めて例を実行すると、公式のAIGNE Hub経由での接続を求められます。これは最も簡単な方法であり、新規ユーザーにはすぐに始められる無料トークンが提供されます。
*   **セルフホストのAIGNE Hub**: 独自のAIGNE Hubインスタンスをお持ちの場合は、そのURLを提供することで接続できます。
*   **サードパーティのモデルプロバイダー**: 必要なAPIキーを環境変数として設定することで、OpenAIなどのモデルプロバイダーに直接接続できます。

例えば、OpenAIを使用するには、APIキーをエクスポートします：

```bash title="OpenAI APIキーの設定" icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```

さまざまなモデルプロバイダーの設定例については、ソースリポジトリの`.env.local.example`ファイルを参照してください。

## ソースからのインストール

開発やカスタマイズのために、リポジトリをクローンしてローカルで例を実行することができます。

1.  **リポジトリのクローン**

    ```bash icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **依存関係のインストール**
    例のディレクトリに移動し、`pnpm`を使用して必要なパッケージをインストールします。

    ```bash icon=lucide:terminal
    cd aigne-framework/examples/mcp-sqlite
    pnpm install
    ```

3.  **例の実行**
    `pnpm start`コマンドを使用してスクリプトを実行します。

    ```bash icon=lucide:terminal
    # ワンショットモードで実行
    pnpm start -- --input "create 10 products for test"

    # 対話型チャットモードで実行
    pnpm start -- --chat
    ```

## コマンドラインオプション

このスクリプトは、その動作をカスタマイズするためにいくつかのコマンドライン引数を受け入れます。

| パラメータ                | 説明                                                                                      | デフォルト       |
| ------------------------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| `--chat`                  | 対話型チャットモードで実行します。                                                                | 無効             |
| `--model <provider[:model]>` | 使用するAIモデルを指定します。例：`openai` または `openai:gpt-4o-mini`。                            | `openai`         |
| `--temperature <value>`   | モデル生成のtemperatureを設定します。                                                           | プロバイダーのデフォルト |
| `--top-p <value>`         | top-pサンプリングの値を設定します。                                                                 | プロバイダーのデフォルト |
| `--presence-penalty <value>` | presence penaltyの値を設定します。                                                                | プロバイダーのデフォルト |
| `--frequency-penalty <value>`| frequency penaltyの値を設定します。                                                               | プロバイダーのデフォルト |
| `--log-level <level>`     | ログレベルを設定します（`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`）。                           | `INFO`           |
| `--input`, `-i <input>`   | 引数として直接入力を提供します。                                                                  | なし             |

## コード実装

中心的なロジックは、AIモデルの初期化、SQLiteサーバーに接続するための`MCPAgent`のセットアップ、そしてそのAgentとスキルを使用する`AIGNE`インスタンスの作成を含みます。

次の例は、テーブルの作成、レコードの挿入、データベースのクエリの全プロセスを示しています。

```typescript index.ts
import { join } from "node:path";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 環境変数にOpenAI APIキーが設定されていることを確認します
const { OPENAI_API_KEY } = process.env;

// 1. AIモデルを初期化します
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. SQLiteサーバープロセスを管理するためのMCPAgentを作成します
const sqlite = await MCPAgent.from({
  command: "uvx",
  args: [
    "-q",
    "mcp-server-sqlite",
    "--db-path",
    join(process.cwd(), "usages.db"), // データベースファイルのパスを指定します
  ],
});

// 3. モデルとSQLiteスキルでAIGNEをインスタンス化します
const aigne = new AIGNE({
  model,
  skills: [sqlite],
});

// 4. 特定の指示を持つAI Agentを定義します
const agent = AIAgent.from({
  instructions: "You are a database administrator",
});

// 5. Agentを呼び出してデータベース操作を実行します
console.log(
  "Creating table...",
  await aigne.invoke(
    agent,
    "create a product table with columns name, description, and createdAt",
  ),
);
// 期待される出力:
// {
//   $message: "The product table has been created successfully with the columns: `name`, `description`, and `createdAt`.",
// }

console.log(
  "Inserting test data...",
  await aigne.invoke(agent, "create 10 products for test"),
);
// 期待される出力:
// {
//   $message: "I have successfully created 10 test products in the database...",
// }

console.log(
  "Querying data...",
  await aigne.invoke(agent, "how many products?"),
);
// 期待される出力:
// {
//   $message: "There are 10 products in the database.",
// }

// 6. AIGNEインスタンスをシャットダウンしてMCPサーバーを終了します
await aigne.shutdown();
```

このスクリプトは、ライフサイクル全体を自動化します。MCPサーバーを起動し、それを使用するようにAI Agentを設定し、自然言語に基づいて一連のデータベースタスクを実行し、クリーンにシャットダウンします。

## デバッグ

Agentの動作を監視および分析するには、`aigne observe`コマンドを使用できます。このツールは、モデルやツールとのやり取りを含む、Agentの実行トレースの詳細なビューを提供するローカルWebサーバーを起動します。これは、デバッグや情報の流れを理解するために非常に貴重です。

```bash icon=lucide:terminal
aigne observe
```

このコマンドを実行した後、提供されたURLをブラウザで開いて、最近のAgentの呼び出しを検査できます。

## まとめ

この例は、AIGNEフレームワークとモデルコンテキストプロトコルを組み合わせて、データベースのような外部システムと対話できるAgentを作成する強力さを示しています。データベース操作をスキルとして抽象化することにより、開発者は最小限の労力で洗練された言語駆動型のアプリケーションを構築できます。

より高度なユースケースやその他の例については、以下のドキュメントを参照してください：

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-icon="lucide:box" data-href="/developer-guide/agents/mcp-agent">
    モデルコンテキストプロトコルを介して外部システムに接続する方法について詳しく学びます。
  </x-card>
  <x-card data-title="AI Agent" data-icon="lucide:bot" data-href="/developer-guide/agents/ai-agent">
    言語モデルと対話し、ツールを使用するための主要なAgentについて探ります。
  </x-card>
</x-cards>