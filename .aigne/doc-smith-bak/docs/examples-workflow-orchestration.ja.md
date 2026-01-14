# ワークフローオーケストレーション

このガイドでは、複数の特化した AI Agent をオーケストレーションする高度なワークフローを構築し、実行する方法を解説します。`finder`、`writer`、`proofreader` のような Agent を連携させ、初期調査から最終レポート作成まで、複雑なタスクに共同で取り組む方法を学びます。

## 概要

ワークフローオーケストレーションとは、複数の Agent が共通の目標を達成するために協調する処理パイプラインを作成することです。パイプライン内の各 Agent は特定の役割を持ち、中央のオーケストレーターがタスクと情報の流れを管理します。この例では、AIGNE を使用してこのようなシステムを構築する方法を紹介し、単一実行（ワンショット）モードと対話型チャットモードの両方をサポートします。

以下の図は、この例における Agent の関係を示しています。

```d2
direction: down

User: {
  shape: c4-person
}

OrchestratorAgent: {
  label: "Orchestrator Agent"
  shape: rectangle

  finder: {
    label: "Finder Agent"
    shape: rectangle
  }

  writer: {
    label: "Writer Agent"
    shape: rectangle
  }
}

Skills: {
  label: "スキル / ツール"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  puppeteer: {
    label: "Puppeteer\n(ウェブスクレイピング)"
    shape: rectangle
  }

  filesystem: {
    label: "ファイルシステム\n(読み書き)"
    shape: cylinder
  }
}

User -> OrchestratorAgent: "1. 調査タスクを送信"
OrchestratorAgent -> OrchestratorAgent.finder: "2. 委任: 情報検索"
OrchestratorAgent.finder -> Skills.puppeteer: "3. ウェブをスクレイピング"
OrchestratorAgent.finder -> Skills.filesystem: "4. 調査結果を保存"
OrchestratorAgent -> OrchestratorAgent.writer: "5. 委任: レポート作成"
OrchestratorAgent.writer -> Skills.filesystem: "6. 最終レポートを書き込み"

```

## 前提条件

始める前に、以下がインストールされ、設定されていることを確認してください。

*   **Node.js**: バージョン 20.0 以上。
*   **npm**: Node.js にバンドルされています。
*   **OpenAI API キー**: Agent が OpenAI モデルと対話するために必要です。[OpenAI Platform](https://platform.openai.com/api-keys) から取得できます。

ソースコードから実行するためのオプションの依存関係：

*   **Bun**: ユニットテストやサンプルを実行するために使用します。
*   **Pnpm**: パッケージ管理に使用します。

## クイックスタート

このサンプルは `npx` を使用して、インストールなしで直接実行できます。

### サンプルの実行

ターミナルで以下のコマンドを実行してください。

```bash ワンショットモードで実行 icon=lucide:terminal
# ワンショットモードで実行 (デフォルト)
npx -y @aigne/example-workflow-orchestrator
```

```bash 対話型チャットモードで実行 icon=lucide:terminal
# 対話型チャットモードで実行
npx -y @aigne/example-workflow-orchestrator --interactive
```

```bash パイプライン入力を使用 icon=lucide:terminal
# パイプライン入力を使用
echo "Research ArcBlock and compile a report about their products and architecture" | npx -y @aigne/example-workflow-orchestrator
```

### AI モデルへの接続

初めてサンプルを実行すると、API キーが設定されていないため、AI モデルサービスへの接続を促すプロンプトが表示されます。

![AI モデルへの接続を促す最初のプロンプト](../../../examples/workflow-orchestrator/run-example.png)

3 つの選択肢があります。

1.  **公式 AIGNE Hub 経由で接続**: 新規ユーザーにおすすめのオプションです。これを選択すると、ブラウザで認証ページが開きます。承認後、CLI が AIGNE Hub に接続され、開始用の無料トークンが付与されます。

    ![公式 AIGNE Hub への接続を承認](../../../examples/images/connect-to-aigne-hub.png)

2.  **セルフホストの AIGNE Hub 経由で接続**: 独自の AIGNE Hub インスタンスをお持ちの場合は、こちらを選択してください。接続を完了するために、ハブの URL を入力するよう求められます。セルフホストの AIGNE Hub は、[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) からデプロイできます。

    ![セルフホストの AIGNE Hub の URL を入力](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **サードパーティのモデルプロバイダー経由で接続**: OpenAI のようなプロバイダーの API キーを直接設定できます。キーを環境変数として設定し、再度サンプルを実行してください。

    ```bash OpenAI API キーを設定 icon=lucide:terminal
    export OPENAI_API_KEY="ここにあなたのAPIキーを入力"
    ```

    その他の設定例については、リポジトリ内の `.env.local.example` ファイルを参照してください。

### AIGNE Observe を使用したデバッグ

`aigne observe` コマンドは、Agent の実行を監視・分析するのに役立つローカルウェブサーバーを起動します。このツールは、デバッグ、パフォーマンスチューニング、Agent の動作理解に非常に役立ちます。

まず、監視サーバーを起動します。

```bash 監視サーバーを起動 icon=lucide:terminal
aigne observe
```

![監視サーバーが実行中であることを示すターミナル出力](../../../examples/images/aigne-observe-execute.png)

サーバーが実行されると、提供された URL (`http://localhost:7893`) をブラウザで開き、最近の Agent トレースの一覧を表示し、その詳細を検査できます。

![AIGNE Observe のウェブインターフェースにトレースの一覧が表示されている様子](../../../examples/images/aigne-observe-list.png)

## ローカルでのインストールと使用方法

開発目的で、リポジトリをクローンしてローカルでサンプルを実行できます。

### 1. リポジトリのクローン

```bash リポジトリをクローン icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係のインストール

サンプルのディレクトリに移動し、`pnpm` を使用して必要なパッケージをインストールします。

```bash 依存関係をインストール icon=lucide:terminal
cd aigne-framework/examples/workflow-orchestrator
pnpm install
```

### 3. サンプルの実行

`pnpm start` コマンドを使用してワークフローを実行します。

```bash ワンショットモードで実行 icon=lucide:terminal
# ワンショットモードで実行 (デフォルト)
pnpm start
```

```bash 対話型チャットモードで実行 icon=lucide:terminal
# 対話型チャットモードで実行
pnpm start -- --interactive
```

```bash パイプライン入力を使用 icon=lucide:terminal
# パイプライン入力を使用
echo "Research ArcBlock and compile a report about their products and architecture" | pnpm start
```

## 実行オプション

スクリプトは、その動作をカスタマイズするためにいくつかのコマンドラインパラメータを受け付けます。

| パラメータ | 説明 | デフォルト |
| --- | --- | --- |
| `--interactive` | 対話型チャットモードで実行します。 | 無効 |
| `--model <provider[:model]>` | 使用する AI モデルを指定します (例: `openai` または `openai:gpt-4o-mini`)。 | `openai` |
| `--temperature <value>` | モデル生成の temperature を設定します。 | プロバイダーのデフォルト |
| `--top-p <value>` | top-p サンプリングの値を設定します。 | プロバイダーのデフォルト |
| `--presence-penalty <value>` | presence penalty の値を設定します。 | プロバイダーのデフォルト |
| `--frequency-penalty <value>` | frequency penalty の値を設定します。 | プロバイダーのデフォルト |
| `--log-level <level>` | ログレベルを設定します (例: `ERROR`, `WARN`, `INFO`, `DEBUG`)。 | `INFO` |
| `--input`, `-i <input>` | コマンドラインから直接入力を指定します。 | なし |

#### 例

```bash 対話型チャットモードで実行 icon=lucide:terminal
# チャットモードで実行
pnpm start -- --interactive
```

```bash 異なるログレベルを設定 icon=lucide:terminal
# ログレベルを DEBUG に設定
pnpm start -- --log-level DEBUG
```

## コード例

以下の TypeScript コードは、複数の Agent を定義し、オーケストレーションして詳細な調査を行い、レポートを作成する方法を示しています。`OrchestratorAgent` は、ウェブを閲覧する (`puppeteer`) およびローカルファイルシステムと対話するスキルを備えた `finder` と `writer` を調整します。

```typescript orchestrator.ts icon=logos:typescript
import { OrchestratorAgent } from "@aigne/agent-library/orchestrator/index.js";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// 1. チャットモデルを初期化
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
  modelOptions: {
    parallelToolCalls: false, // Puppeteer は一度に 1 つのタスクしか実行できません
  },
});

// 2. ウェブスクレイピングとファイルシステムアクセスのための MCP Agent を設定
const puppeteer = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
  env: process.env as Record<string, string>,
});

const filesystem = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", import.meta.dir],
});

// 3. 情報を調査するための finder Agent を定義
const finder = AIAgent.from({
  name: "finder",
  description: "ユーザーの要求に最も近い一致を見つけます",
  instructions: `あなたはウェブ上で情報を見つけることができる Agent です。
ユーザーの要求に最も近い一致を見つける任務を負っています。
puppeteer を使用してウェブから情報をスクレイピングできます。
また、ファイルシステムを使用して見つけた情報を保存することもできます。

ルール:
- puppeteer のスクリーンショットは使用しないでください
- ページのテキストコンテンツを取得するには document.body.innerText を使用してください
- あるページへの URL が必要な場合、現在の(ホーム)ページのすべてのリンクとそのタイトルを取得し、
そのタイトルを使って訪問したいページの URL を検索してください。
  `,
  skills: [puppeteer, filesystem],
});

// 4. レポートを保存するための writer Agent を定義
const writer = AIAgent.from({
  name: "writer",
  description: "ファイルシステムに書き込みます",
  instructions: `あなたはファイルシステムに書き込むことができる Agent です。
  ユーザーの入力を受け取り、それに対処し、
  結果を適切な場所にディスクに書き込む任務を負っています。`,
  skills: [filesystem],
});

// 5. ワークフローを管理するための orchestrator Agent を作成
const agent = OrchestratorAgent.from({
  skills: [finder, writer],
  maxIterations: 3,
  tasksConcurrency: 1, // Puppeteer は一度に 1 つのタスクしか実行できません
});

// 6. AIGNE インスタンスを初期化
const aigne = new AIGNE({ model });

// 7. 詳細なプロンプトでワークフローを呼び出し
const result = await aigne.invoke(
  agent,
  `\
公式サイトのみを使用して ArcBlock に関する詳細な調査を行い\
(検索エンジンやサードパーティのソースは避けること)、arcblock.md として保存される詳細なレポートを作成してください。\
レポートには、同社の製品\
(詳細な調査結果とリンクを含む)、技術アーキテクチャ、および将来の計画に関する包括的な洞察を含める必要があります。`,
);
console.log(result);
```

実行されると、このワークフローは詳細な Markdown ファイルを生成します。生成された出力の例はこちらで確認できます: [arcblock-deep-research.md](https://github.com/AIGNE-io/aigne-framework/blob/main/examples/workflow-orchestrator/generated-report-arcblock.md)。

## まとめ

この例は、複雑なマルチ Agent ワークフローを構築するための AIGNE の強力さを示しています。特化した Agent を定義し、それらをオーケストレーターで調整することにより、調査、コンテンツ生成、ファイル操作など、複数のステップを必要とする高度なタスクを自動化できます。

高度なワークフローパターンのその他の例については、以下のセクションをご覧ください。

<x-cards data-columns="2">
  <x-card data-title="シーケンシャルワークフロー" data-icon="lucide:arrow-right-circle" data-href="/examples/workflow-sequential">
    Agent が厳密なステップバイステップの順序でタスクを実行するパイプラインを構築します。
  </x-card>
  <x-card data-title="並行ワークフロー" data-icon="lucide:git-fork" data-href="/examples/workflow-concurrency">
    複数のタスクを同時に処理して、パフォーマンスと効率を向上させます。
  </x-card>
  <x-card data-title="Agent ハンドオフ" data-icon="lucide:arrow-right-left" data-href="/examples/workflow-handoff">
    ある Agent がその出力を別の Agent に渡してさらなる処理を行う、シームレスな移行を作成します。
  </x-card>
  <x-card data-title="グループチャット" data-icon="lucide:users" data-href="/examples/workflow-group-chat">
    複数の Agent が共有環境で協力し、コミュニケーションできるようにします。
  </x-card>
</x-cards>
