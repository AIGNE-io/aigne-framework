# MCP GitHub

このドキュメントは、AIGNE フレームワークと GitHub MCP (Model Context Protocol) サーバーを使用して GitHub リポジトリと対話する方法を示すサンプルについての包括的なガイドです。サンプルの設定方法と実行方法を学び、AI Agent がリポジトリの検索やファイルの管理といったさまざまな GitHub 操作を実行できるようにします。

## 概要

このサンプルは、GitHub MCP サーバーに接続する `MCPAgent` の統合を示しています。この Agent は、AI に GitHub API と対話するための一連のツール (スキル) を提供します。このワークフローにより、ユーザーは自然言語でリクエストを行うことができ、AI Agent はそれを特定の関数呼び出しに変換して、リポジトリの検索、ファイル内容の読み取り、Issue の作成などのアクションを GitHub Agent に実行させます。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE フレームワーク"
  shape: rectangle

  AIAgent: {
    label: "AI Agent\n(@aigne/core)"
    shape: rectangle
  }

  MCPAgent: {
    label: "GitHub MCP Agent\n(スキル)"
    shape: rectangle
  }

  AIAgent -> MCPAgent: "スキルを使用"
}

GitHub-MCP-Server: {
  label: "GitHub MCP サーバー\n(@modelcontextprotocol/server-github)"
  shape: rectangle
}

GitHub-API: {
  label: "GitHub API"
  shape: cylinder
}

AI-Model-Provider: {
  label: "AI モデルプロバイダー\n(例: OpenAI、AIGNE Hub)"
  shape: cylinder
}

AIGNE-Observe: {
  label: "AIGNE Observe\n(デバッグ用 UI)"
  shape: rectangle
}

User -> AIGNE-Framework.AIAgent: "1. 自然言語リクエスト"
AIGNE-Framework.AIAgent -> AI-Model-Provider: "2. リクエストを処理"
AI-Model-Provider -> AIGNE-Framework.AIAgent: "3. 関数呼び出しを返す"
AIGNE-Framework.AIAgent -> AIGNE-Framework.MCPAgent: "4. 関数呼び出しを実行"
AIGNE-Framework.MCPAgent -> GitHub-MCP-Server: "5. コマンドを送信"
GitHub-MCP-Server -> GitHub-API: "6. GitHub API を呼び出す"
GitHub-API -> GitHub-MCP-Server: "7. API レスポンスを返す"
GitHub-MCP-Server -> AIGNE-Framework.MCPAgent: "8. 結果を返す"
AIGNE-Framework.MCPAgent -> AIGNE-Framework.AIAgent: "9. 結果を返す"
AIGNE-Framework.AIAgent -> AI-Model-Provider: "10. 結果を処理"
AI-Model-Provider -> AIGNE-Framework.AIAgent: "11. 自然言語レスポンスを返す"
AIGNE-Framework.AIAgent -> User: "12. 最終レスポンス"
AIGNE-Framework -> AIGNE-Observe: "実行トレースを送信"
```

## 前提条件

先に進む前に、お使いのシステムが以下の要件を満たしていることを確認してください:

*   **Node.js**: バージョン 20.0 以上。
*   **npm**: Node.js に同梱されています。
*   **GitHub パーソナルアクセストークン**: 操作対象のリポジトリに必要な権限を持つトークン。[GitHub の設定](https://github.com/settings/tokens)から作成できます。
*   **AI モデルプロバイダーのアカウント**: [OpenAI](https://platform.openai.com/api-keys) などのプロバイダーの API キー、または AIGNE Hub インスタンスへの接続。

## クイックスタート

ローカルにインストールすることなく、`npx` を使って直接このサンプルを実行できます。

まず、GitHub トークンを環境変数として設定します。

```bash GitHub トークンを設定する icon=lucide:terminal
export GITHUB_TOKEN=YOUR_GITHUB_TOKEN
```

次に、サンプルを実行します。

```bash サンプルを実行する icon=lucide:terminal
npx -y @aigne/example-mcp-github
```

### AI モデルに接続する

初回実行時に AI モデルが設定されていない場合、接続を促すプロンプトが表示されます。


続行するにはいくつかのオプションがあります:

#### 1. 公式 AIGNE Hub に接続する

これは推奨されるアプローチです。このオプションを選択すると、ブラウザで公式の AIGNE Hub ページが開きます。画面の指示に従って接続を承認してください。新規ユーザーは、利用開始のための無料クレジットを受け取れます。


#### 2. セルフホストの AIGNE Hub に接続する

独自の AIGNE Hub インスタンスを運用している場合は、このオプションを選択してください。接続を完了するために、セルフホストの Hub の URL を入力するよう求められます。


#### 3. サードパーティのモデルプロバイダーを設定する

OpenAI など、サポートされているサードパーティのモデルプロバイダーに直接接続することもできます。これを行うには、プロバイダーの API キーを環境変数として設定します。

例えば、OpenAI を使用するには、`OPENAI_API_KEY` を設定します:

```bash OpenAI API キーを設定する icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

環境変数を設定した後、再度 `npx` コマンドを実行してください。他のプロバイダーでサポートされている環境変数の一覧については、プロジェクトソースの `.env.local.example` ファイルを参照してください。

## ソースからのインストール

コードを調査または変更したい開発者は、以下の手順に従ってローカルクローンからサンプルを実行してください。

### 1. リポジトリをクローンする

GitHub から AIGNE フレームワークのメインリポジトリをクローンします。

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

サンプルのディレクトリに移動し、`pnpm` を使用して必要な依存関係をインストールします。

```bash icon=lucide:terminal
cd aigne-framework/examples/mcp-github
pnpm install
```

### 3. サンプルを実行する

開始スクリプトを実行してサンプルを起動します。

```bash ワンショットモードで実行する icon=lucide:terminal
pnpm start
```

このサンプルは対話型のチャットモードもサポートしており、他のコマンドからのパイプ入力を受け付けることもできます。

```bash 対話型チャットモードで実行する icon=lucide:terminal
pnpm start -- --chat
```

```bash パイプライン入力を使用する icon=lucide:terminal
echo "Search for repositories related to 'modelcontextprotocol'" | pnpm start
```

### コマンドラインオプション

以下のコマンドラインパラメータで実行をカスタマイズできます:

| パラメータ | 説明 | デフォルト |
| --- | --- | --- |
| `--chat` | 対話型チャットモードで実行します。 | 無効 |
| `--model <provider[:model]>` | 使用する AI モデルを指定します (例: `openai` または `openai:gpt-4o-mini`)。 | `openai` |
| `--temperature <value>` | モデル生成の temperature を設定します。 | プロバイダーのデフォルト |
| `--top-p <value>` | top-p サンプリングの値を設定します。 | プロバイダーのデフォルト |
| `--presence-penalty <value>` | presence penalty の値を設定します。 | プロバイダーのデフォルト |
| `--frequency-penalty <value>` | frequency penalty の値を設定します。 | プロバイダーのデフォルト |
| `--log-level <level>` | ログレベルを設定します (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`)。 | `INFO` |
| `--input, -i <input>` | 引数として直接入力を指定します。 | なし |

## コード例

以下の TypeScript コードは、このサンプルの中心的なロジックを示しています。AI モデルを初期化し、GitHub 用の `MCPAgent` を設定し、`AIAgent` を呼び出してリポジトリ検索を実行します。

```typescript index.ts
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 環境変数を読み込む
const { OPENAI_API_KEY, GITHUB_TOKEN } = process.env;

// OpenAI モデルを初期化する
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// GitHub MCP agent を初期化する
const githubMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN,
  },
});

// モデルと GitHub スキルを持つ AIGNE インスタンスを作成する
const aigne = new AIGNE({
  model,
  skills: [githubMCPAgent],
});

// GitHub と対話するための指示を持つ AI agent を作成する
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
});

// agent を呼び出してリポジトリを検索する
const result = await aigne.invoke(
  agent,
  "Search for repositories related to 'modelcontextprotocol'",
);

console.log(result);
// 期待される出力:
// I found several repositories related to 'modelcontextprotocol':
//
// 1. **modelcontextprotocol/servers** - MCP servers for various APIs and services
// 2. **modelcontextprotocol/modelcontextprotocol** - The main ModelContextProtocol repository
// ...

// 完了したら AIGNE インスタンスをシャットダウンする
await aigne.shutdown();
```

## 利用可能な操作

GitHub MCP サーバーは、AI Agent が使用できるスキルとして、以下を含む幅広い GitHub 機能を提供します:

*   **リポジトリ操作**: リポジトリの検索、作成、情報取得。
*   **ファイル操作**: ファイル内容の取得、ファイルの作成または更新、単一コミットでの複数ファイルのプッシュ。
*   **Issue と PR の操作**: Issue とプルリクエストの作成、コメントの追加、プルリクエストのマージ。
*   **検索操作**: コード、Issue、ユーザーの検索。
*   **コミット操作**: コミットの一覧表示とコミット詳細の取得。

## AIGNE Observe によるデバッグ

Agent の動作を調査・分析するには、`aigne observe` コマンドを使用できます。このツールは、実行トレース、呼び出し詳細、その他のランタイムデータを表示するためのユーザーインターフェースを提供するローカルウェブサーバーを起動します。

監視サーバーを起動するには、以下を実行します:

```bash AIGNE observe サーバーを起動する icon=lucide:terminal
aigne observe
```


サーバーが実行されると、ブラウザで Web インターフェースにアクセスして、最近の実行リストを表示し、各トレースの詳細を掘り下げることができます。


このツールは、デバッグ、Agent がツールやモデルとどのように対話するかを理解し、パフォーマンスを最適化するために非常に価値があります。