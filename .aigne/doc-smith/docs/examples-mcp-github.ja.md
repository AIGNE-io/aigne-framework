# MCP GitHub

このドキュメントでは、GitHub リポジトリと対話する方法を示す包括的なガイドを提供します。このガイドを最後まで読めば、AIGNE Framework と GitHub Model Context Protocol (MCP) Server を使用して、リポジトリの検索、ファイル内容の読み取り、その他の GitHub 関連タスクを実行できる AI Agent を実行できるようになります。

## 概要

この例では、AIGNE Framework と GitHub MCP Server の統合を紹介し、AI Agent が GitHub の API を一連のツールとして利用できるようにします。Agent は、単一コマンド (ワンショット) モードまたは対話型チャットモードで実行でき、柔軟な対話が可能です。

関与するコアコンポーネントは次のとおりです。
- **AI Agent**: ユーザーのリクエストを理解し、タスクを調整する責任を持つ主要な Agent。
- **GitHub MCP Agent**: GitHub MCP Server に接続し、その機能 (リポジトリの検索、ファイルの読み取りなど) をスキルとして公開する特殊な Agent。

次の図は、これらのコンポーネント間の関係と情報の流れを示しています。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle

  AI-Agent: {
    label: "AI Agent"
    shape: rectangle
    "ユーザーのリクエストを理解し\nタスクを調整する"
  }

  GitHub-MCP-Agent: {
    label: "GitHub MCP Agent"
    shape: rectangle
    "GitHub サーバーの\n機能をスキルとして公開する"
  }
}

GitHub-MCP-Server: {
  label: "GitHub MCP Server"
  shape: rectangle
}

GitHub-API: {
  label: "GitHub API"
  shape: cylinder
}

User -> AIGNE-Framework.AI-Agent: "1. リクエストを送信 (例: リポジトリ検索)"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.GitHub-MCP-Agent: "2. GitHub スキルを使用"
AIGNE-Framework.GitHub-MCP-Agent -> GitHub-MCP-Server: "3. 接続してコマンドを送信"
GitHub-MCP-Server -> GitHub-API: "4. API コールを実行"
GitHub-API -> GitHub-MCP-Server: "5. データを返す"
GitHub-MCP-Server -> AIGNE-Framework.GitHub-MCP-Agent: "6. レスポンスを転送"
AIGNE-Framework.GitHub-MCP-Agent -> AIGNE-Framework.AI-Agent: "7. スキル実行の結果を返す"
AIGNE-Framework.AI-Agent -> User: "8. 最終的な回答を提示"
```

MCP Agent の仕組みについてより深く理解するには、[MCP Agent](./developer-guide-agents-mcp-agent.md) のドキュメントを参照してください。

## 前提条件

続行する前に、次の要件が満たされていることを確認してください。

- **Node.js**: バージョン 20.0 以降。[nodejs.org](https://nodejs.org) からダウンロードできます。
- **GitHub Personal Access Token**: 適切なリポジトリ権限を持つトークンが必要です。[GitHub 設定](https://github.com/settings/tokens)から生成できます。
- **AI モデルプロバイダー API キー**: AI Agent が機能するためには、OpenAI などのプロバイダーからの API キーが必要です。[OpenAI プラットフォーム](https://platform.openai.com/api-keys)からキーを取得してください。

## クイックスタート

ローカルにインストールすることなく、`npx` を使用してこの例を直接実行できます。

まず、GitHub トークンを環境変数として設定します。

```sh GitHub トークンを設定 icon=lucide:terminal
export GITHUB_TOKEN=YOUR_GITHUB_TOKEN
```

次に、例を実行します。

```sh 例を実行 icon=lucide:terminal
npx -y @aigne/example-mcp-github
```

### AI モデルへの接続

初めて例を実行すると、AI モデルへの接続を求められます。いくつかのオプションがあります。

1.  **AIGNE Hub (公式)**: 公式の AIGNE Hub を介して接続するには、このオプションを選択します。ブラウザウィンドウが開き、接続を完了します。新規ユーザーは無料のトークンが付与されます。
2.  **AIGNE Hub (セルフホスト)**: 独自の AIGNE Hub インスタンスをホストしている場合は、このオプションを選択し、その URL を入力して接続します。
3.  **サードパーティモデルプロバイダー**: OpenAI のような直接プロバイダーを使用するには、対応する API キーを環境変数として設定します。

例えば、OpenAI を使用するには、API キーをエクスポートしてコマンドを再実行します。

```sh OpenAI API キーを設定 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
npx -y @aigne/example-mcp-github
```

他のプロバイダーの設定に関する詳細については、リポジトリ内のサンプル環境ファイルを参照してください。

## ソースからのインストール

開発や変更のために、リポジトリをクローンしてローカルで例を実行できます。

1.  **リポジトリのクローン**

    ```sh リポジトリをクローン icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **ディレクトリに移動して依存関係をインストール**

    ```sh 依存関係をインストール icon=lucide:terminal
    cd aigne-framework/examples/mcp-github
    pnpm install
    ```

3.  **例の実行**

    Agent は、デフォルトのワンショットモード、対話型チャットモード、または入力を直接パイプして実行できます。

    ```sh ワンショットモードで実行 icon=lucide:terminal
    pnpm start
    ```

    ```sh 対話型チャットモードで実行 icon=lucide:terminal
    pnpm start -- --chat
    ```

    ```sh パイプライン入力で実行 icon=lucide:terminal
    echo "Search for repositories related to 'modelcontextprotocol'" | pnpm start
    ```

### コマンドラインオプション

このアプリケーションは、カスタマイズされた実行のためにいくつかのコマンドライン引数をサポートしています。

| パラメータ | 説明 | デフォルト |
| :--- | :--- | :--- |
| `--chat` | Agent を対話型チャットモードで実行します。 | 無効 |
| `--model <provider[:model]>` | 使用する AI モデルを指定します (例: `openai` または `openai:gpt-4o-mini`)。 | `openai` |
| `--temperature <value>` | モデル生成の temperature を設定します。 | プロバイダーのデフォルト |
| `--top-p <value>` | top-p サンプリング値を設定します。 | プロバイダーのデフォルト |
| `--presence-penalty <value>`| presence penalty 値を設定します。 | プロバイダーのデフォルト |
| `--frequency-penalty <value>`| frequency penalty 値を設定します。 | プロバイダーのデフォルト |
| `--log-level <level>` | ログレベルを設定します (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`)。 | `INFO` |
| `--input`, `-i <input>` | 引数として直接入力を提供します。 | なし |

## コード例

以下の TypeScript コードは、GitHub Agent を設定して実行するためのコアロジックを示しています。AI モデルと GitHub MCP Agent を初期化し、`AIGNE` を使用してそれらを組み合わせ、`AIAgent` を呼び出してタスクを実行します。

```typescript usages.ts icon=logos:typescript
import assert from "node:assert";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 環境変数が設定されていることを確認
const { OPENAI_API_KEY, GITHUB_TOKEN } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");
assert(GITHUB_TOKEN, "Please set the GITHUB_TOKEN environment variable");

// 1. AI モデルを初期化
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. GitHub MCP Agent を初期化
const githubMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN,
  },
});

// 3. モデルと GitHub スキルを持つ AIGNE インスタンスを作成
const aigne = new AIGNE({
  model,
  skills: [githubMCPAgent],
});

// 4. 特定の指示を持つ AI Agent を作成
const agent = AIAgent.from({
  instructions: `\
## GitHub Interaction Assistant
You are an assistant that helps users interact with GitHub repositories.
You can perform various GitHub operations like:
1. Searching repositories
2. Getting file contents
3. Creating or updating files
4. Creating issues and pull requests
5. And many more GitHub operations

Always provide clear, concise responses with relevant information from GitHub.
`,
  inputKey: "message",
});

// 5. Agent を呼び出してタスクを実行
const result = await aigne.invoke(agent, {
  message: "Search for repositories related to 'modelcontextprotocol' and limit to 3 results",
});

console.log(result);
// 期待される出力:
// I found the following repositories related to 'modelcontextprotocol':
// 1. **modelcontextprotocol/modelcontextprotocol**: The main repository for the Model Context Protocol.
// 2. **modelcontextprotocol/servers**: A collection of MCP servers for various APIs and services.
// 3. **AIGNE-io/aigne-framework**: The framework for building agentic AI applications.

// 6. AIGNE インスタンスをシャットダウン
await aigne.shutdown();
```

このスクリプトは、必要なコンポーネントの設定、Agent の目的の定義、特定のタスクの実行という完全なワークフローを示しています。

## 利用可能な GitHub 操作

GitHub MCP サーバーは、幅広い機能を公開しています。AI Agent は、いくつかのカテゴリにわたる操作を実行するように指示できます。

- **リポジトリ操作**: リポジトリ情報の検索、作成、取得。
- **ファイル操作**: ファイル内容の取得、ファイルの作成または更新、単一コミットでの複数ファイルのプッシュ。
- **Issue と PR の操作**: Issue とプルリクエストの作成、コメントの追加、プルリクエストのマージ。
- **検索操作**: GitHub 全体でのコード、Issue、ユーザーの検索。
- **コミット操作**: コミットのリスト表示、特定のコミットの詳細取得。

## まとめ

この例では、Model Context Protocol を通じて GitHub のような外部サービスと対話できる機能的な AI Agent を構築する方法を実践的に示します。概説された手順に従うことで、リポジトリ関連のタスクを自動化する Agent を迅速にセットアップし、試すことができます。

他の利用可能な例や高度なワークフローに関する詳細については、以下のセクションをご覧ください。

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-icon="lucide:box" data-href="/developer-guide/agents/mcp-agent">
    MCPAgent の背後にあるコアコンセプトと、それが外部ツールにどのように接続するかを学びます。
  </x-card>
  <x-card data-title="すべての例" data-icon="lucide:binary" data-href="/examples">
    例の完全なリストを閲覧して、AIGNE Framework の他の機能を発見してください。
  </x-card>
</x-cards>