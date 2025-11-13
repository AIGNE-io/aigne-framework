# ワークフローオーケストレーション

このドキュメントでは、複数の専門AI Agentを連携させて高度な処理パイプラインを構築するための技術的なウォークスルーを提供します。この例を通じて、オーケストレーターAgentがリサーチ、執筆、ファクトチェックなどのタスクをAgentチームに委任し、複雑な目標を達成するために協力するワークフローを構築する方法を学びます。

## 概要

この例では、特定のトピックについて詳細なリサーチを行い、詳細なレポートを作成するために設計されたマルチAgentシステムを作成します。ワークフローは`OrchestratorAgent`によって管理され、専門Agentのチームに特定のサブタスクを並行して実行するよう指示します。

情報の流れは以下の通りです：

1.  最初の要求が`Orchestrator` Agentに送信されます。
2.  `Orchestrator`は要求をタスクに分解し、`Finder`、`Writer`、`Proofreader`、`Fact Checker`、`Style Enforcer`などの専門Agentに分配します。
3.  これらのAgentはタスクを同時に実行します。例えば、`Finder`はウェブスクレイピングツールを使って情報を収集し、`Writer`はレポートの構成を開始します。
4.  すべてのAgentからの出力が`Synthesizer` Agentに送信されます。
5.  `Synthesizer`は情報を統合し、最終的で包括的なレポートを生成します。

このワークフローは、次の図で視覚化できます：```d2
direction: down

Request: {
  label: "Initial Request"
  shape: oval
}

Orchestrator: {
  label: "Orchestrator Agent"
  shape: rectangle
}

Specialized-Agents: {
  label: "Specialized Agents (Concurrent Execution)"
  shape: rectangle
  grid-columns: 3
  style: {
    stroke-dash: 2
  }

  Finder: {
    shape: rectangle
  }

  Writer: {
    shape: rectangle
  }

  Proofreader: {
    shape: rectangle
  }

  Fact-Checker: {
    label: "Fact Checker"
    shape: rectangle
  }

  Style-Enforcer: {
    label: "Style Enforcer"
    shape: rectangle
  }
}

Synthesizer: {
  label: "Synthesizer Agent"
  shape: rectangle
}

Report: {
  label: "Final Report"
  shape: oval
}

Request -> Orchestrator: "1. Send request"
Orchestrator -> Specialized-Agents: "2. Distribute tasks"
Specialized-Agents -> Synthesizer: "4. Send outputs"
Synthesizer -> Report: "5. Produce final report"
```

## 前提条件

この例を実行する前に、以下の要件が満たされていることを確認してください：

*   **Node.js**: バージョン20.0以上がインストールされている必要があります。
*   **OpenAI APIキー**: Agentが言語モデルと対話するためにAPIキーが必要です。[OpenAI APIキーページ](https://platform.openai.com/api-keys)から取得してください。

## クイックスタート

この例は、手動のインストールプロセスなしで、`npx`を使用してコマンドラインから直接実行できます。

### 例の実行

スクリプトは、デフォルトのワンショットモードまたは対話型のチャットモードで実行できます。

```bash ワンショットモードで実行 icon=lucide:terminal
npx -y @aigne/example-workflow-orchestrator
```

```bash 対話型チャットモードで実行 icon=lucide:terminal
npx -y @aigne/example-workflow-orchestrator --chat
```

標準パイプラインを介して直接入力を提供することもできます：

```bash パイプライン入力を使用 icon=lucide:terminal
echo "Research ArcBlock and compile a report about their products and architecture" | npx -y @aigne/example-workflow-orchestrator
```

### AIモデルへの接続

初回実行時、スクリプトはAIモデルプロバイダーへの接続を促します。

![モデルプロバイダーに接続](./run-example.png)

接続オプションは3つあります：

1.  **AIGNE Hub（公式）**: これが推奨オプションです。ブラウザが公式のAIGNE Hubを開き、ログインして接続します。新規ユーザーには無料のトークンが付与されます。
2.  **AIGNE Hub（セルフホスト）**: 独自のAIGNE Hubインスタンスをホストしている場合は、このオプションを選択し、そのURLを入力して接続を確立します。
3.  **サードパーティモデルプロバイダー**: APIキーで適切な環境変数を設定することにより、OpenAIなどのプロバイダーに直接接続できます。

例えば、OpenAIを使用するには、`OPENAI_API_KEY`環境変数を設定します：

```bash OpenAI APIキーを設定 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

モデルを設定した後、再度実行コマンドを実行してください。

## ソースからのインストール

ソースコードを変更または調査したい開発者は、以下の手順に従ってローカルリポジトリから例を実行してください。

### 1. リポジトリをクローンする

```bash リポジトリをクローンする icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

例のディレクトリに移動し、`pnpm`を使用して必要なパッケージをインストールします。

```bash 依存関係をインストールする icon=lucide:terminal
cd aigne-framework/examples/workflow-orchestrator
pnpm install
```

### 3. 例を実行する

`pnpm start`コマンドを使用して、ソースディレクトリからスクリプトを実行します。

```bash ワンショットモードで実行 icon=lucide:terminal
pnpm start
```

対話型チャットモードで実行するには、`--chat`フラグを追加します。`pnpm`スクリプトランナーを介して引数を渡すには、余分な`--`が必要です。

```bash 対話型チャットモードで実行 icon=lucide:terminal
pnpm start -- --chat
```

## コードの実装

以下のTypeScriptコードは、Agentのチームを定義し、オーケストレーションする方法を示しています。`finder`と`writer`という2つの専門Agentを初期化し、`OrchestratorAgent`を使用してそれらの実行を管理します。

`finder` Agentは`puppeteer`と`filesystem`スキルを備えており、ウェブを閲覧して情報を保存することができます。`writer` Agentは最終レポートを作成し、それをファイルシステムに書き込む責任があります。

```typescript orchestrator-workflow.ts icon=logos:typescript
import { OrchestratorAgent } from "@aigne/agent-library/orchestrator/index.js";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
  modelOptions: {
    parallelToolCalls: false, // puppeteer can only run one task at a time
  },
});

const puppeteer = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
  env: process.env as Record<string, string>,
});

const filesystem = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", import.meta.dir],
});

const finder = AIAgent.from({
  name: "finder",
  description: "Find the closest match to a user's request",
  instructions: `You are an agent that can find information on the web.
You are tasked with finding the closest match to the user's request.
You can use puppeteer to scrape the web for information.
You can also use the filesystem to save the information you find.

Rules:
- do not use screenshot of puppeteer
- use document.body.innerText to get the text content of a page
- if you want a url to some page, you should get all link and it's title of current(home) page,
then you can use the title to search the url of the page you want to visit.
  `,
  skills: [puppeteer, filesystem],
});

const writer = AIAgent.from({
  name: "writer",
  description: "Write to the filesystem",
  instructions: `You are an agent that can write to the filesystem.
  You are tasked with taking the user's input, addressing it, and
  writing the result to disk in the appropriate location.`,
  skills: [filesystem],
});

const agent = OrchestratorAgent.from({
  skills: [finder, writer],
  maxIterations: 3,
  tasksConcurrency: 1, // puppeteer can only run one task at a time
});

const aigne = new AIGNE({ model });

const result = await aigne.invoke(
  agent,
  `\
Conduct an in-depth research on ArcBlock using only the official website\
(avoid search engines or third-party sources) and compile a detailed report saved as arcblock.md. \
The report should include comprehensive insights into the company's products \
(with detailed research findings and links), technical architecture, and future plans.`,
);
console.log(result);
```

呼び出されると、`AIGNE`インスタンスはプロンプトを`OrchestratorAgent`に渡し、`OrchestratorAgent`は`finder`と`writer`のAgentを調整して、提供された指示に基づいて最終レポートを生成します。

## コマンドラインオプション

スクリプトは、その動作とモデルの生成パラメータをカスタマイズするために、いくつかのコマンドライン引数を受け入れます。

| パラメータ | 説明 | デフォルト |
| :--- | :--- | :--- |
| `--chat` | 対話型チャットモードで実行します。 | 無効 |
| `--model <provider[:model]>` | 使用するAIモデルを指定します。フォーマットは'provider\[:model]'です。例: 'openai' または 'openai:gpt-4o-mini'。 | `openai` |
| `--temperature <value>` | モデル生成のtemperatureを設定します。 | プロバイダーのデフォルト |
| `--top-p <value>` | top-pサンプリング値を設定します。 | プロバイダーのデフォルト |
| `--presence-penalty <value>` | presence penalty値を設定します。 | プロバイダーのデフォルト |
| `--frequency-penalty <value>` | frequency penalty値を設定します。 | プロバイダーのデフォルト |
| `--log-level <level>` | ログの詳細度を設定します。`ERROR`、`WARN`、`INFO`、`DEBUG`、または`TRACE`を受け入れます。 | `INFO` |
| `--input`, `-i <input>` | コマンドライン引数として直接入力を指定します。 | なし |

### 使用例

```bash ログレベルを設定 icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

## デバッグ

Agentの実行を監視および分析するには、`aigne observe`コマンドを使用します。これにより、トレースの検査、詳細な呼び出し情報の表示、Agentのランタイム動作の理解を目的とした、ユーザーフレンドリーなインターフェースを備えたローカルウェブサーバーが起動します。

まず、ターミナルで監視サーバーを起動します：
![aigne observe を開始](../images/aigne-observe-execute.png)

インターフェースには最近の実行リストが表示されます。実行を選択して、その詳細なトレースをドリルダウンできます。
![実行リストを表示](../images/aigne-observe-list.png)

このツールは、デバッグ、パフォーマンスチューニング、およびAgentが情報を処理し、モデルやツールとどのように対話するかについての洞察を得るために不可欠です。

## まとめ

この例では、複雑な問題を解決するために複数の専門Agentを調整する`OrchestratorAgent`の機能を示しました。大きなタスクをより小さく管理しやすいサブタスクに分解し、適切なスキルを持つAgentに割り当てることで、堅牢でスケーラブルなAI駆動のワークフローを構築できます。

他のワークフローパターンを調べるには、以下の例を参照してください：
<x-cards data-columns="2">
  <x-card data-title="シーケンシャルワークフロー" data-href="/examples/workflow-sequential" data-icon="lucide:arrow-right">実行順序が保証されたステップバイステップの処理パイプラインを構築します。</x-card>
  <x-card data-title="並行ワークフロー" data-href="/examples/workflow-concurrency" data-icon="lucide:git-compare-arrows">複数のタスクを同時に処理することでパフォーマンスを最適化します。</x-card>
</x-cards>