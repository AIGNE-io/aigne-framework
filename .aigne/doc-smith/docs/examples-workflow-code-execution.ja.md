# ワークフローコードの実行

このドキュメントでは、コードを動的に生成して実行する、安全なAI駆動型ワークフローを構築するための技術的なウォークスルーを提供します。最後まで読むと、問題を解決するためにJavaScriptを作成する「コーダー」Agentと、そのコードを安全に実行する「サンドボックス」Agentを連携させ、複雑で自動化された問題解決を可能にする方法を理解できます。

## 概要

多くの高度なAIアプリケーションでは、標準的な言語モデルの能力を超える計算やロジックを必要とする問題を解決する必要があります。この例では、一般的で強力なパターンを実装します。つまり、あるAI Agentがコードを書き、別の隔離されたAgentがそれを実行するというものです。このアプローチにより、システムは複雑な計算、データ操作、その他のプログラム的なタスクを動的に実行できます。

このワークフローは、主に2つのAgentで構成されています。
*   **コーダーAgent**: ユーザーのリクエストを理解し、それを満たすためのJavaScriptコードを作成するタスクを担う `AIAgent` です。
*   **サンドボックスAgent**: JavaScriptの評価環境をラップする `FunctionAgent` です。コーダーからコードを受け取り、それを実行して結果を返します。これにより、コードの実行が隔離され、メインアプリケーションに影響を与えるのを防ぎます。

この関心事の分離により、安全性とモジュール性の両方が確保されます。以下の図は、高レベルのデータフローを示しています。

```d2
direction: down

User: {
  shape: c4-person
}

Workflow: {
  label: "AI ワークフロー"
  shape: rectangle

  Coder-Agent: {
    label: "コーダーAgent\n(AIAgent)"
    shape: rectangle
  }

  Sandbox-Agent: {
    label: "サンドボックスAgent\n(FunctionAgent)"
    shape: rectangle
  }
}

User -> Workflow.Coder-Agent: "1. 問題のリクエスト\n(例: '10!を計算して')"
Workflow.Coder-Agent -> Workflow.Sandbox-Agent: "2. JSの生成と実行\n(例: 'evaluateJs({ code: ... })')"
Workflow.Sandbox-Agent -> Workflow.Coder-Agent: "3. 結果の返却\n(例: 3628800)"
Workflow.Coder-Agent -> User: "4. 最終回答\n(例: '10! は 3628800 です')"

```

以下のシーケンス図は、サンプルリクエストに対するユーザーとAgent間のインタラクションを詳細に示しています。

DIAGRAM_PLACEHOLDER

## 前提条件

先に進む前に、開発環境が以下の要件を満たしていることを確認してください。

*   **Node.js**: バージョン20.0以上。
*   **npm**: Node.jsに同梱されています。
*   **OpenAI APIキー**: コーダーAgentがAIモデルと対話するために必要です。[OpenAI Platform](https://platform.openai.com/api-keys) からキーを取得できます。

## クイックスタート

この例は、`npx` を使用してローカルにインストールすることなく、コマンドラインから直接実行できます。

### 例を実行する

ターミナルで以下のいずれかのコマンドを実行してください。

*   **ワンショットモード**: Agentは単一の入力を処理して終了します。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-code-execution
    ```

*   **インタラクティブチャットモード**: Agentとの継続的なチャットセッションを開始します。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-code-execution --chat
    ```

*   **パイプラインモード**: 他のコマンドからの入力をパイプで渡します。

    ```bash icon=lucide:terminal
    echo 'Calculate 15!' | npx -y @aigne/example-workflow-code-execution
    ```

### AIモデルに接続する

初めてこの例を実行すると、AIモデルプロバイダーへの接続を求められます。

![モデルプロバイダーへの接続](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/workflow-code-execution/run-example.png)

いくつかの選択肢があります。

1.  **AIGNE Hub (公式)**: 最も簡単に始める方法です。新規ユーザー向けに無料クレジットが提供されます。

    ![公式AIGNE Hubへの接続](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/connect-to-aigne-hub.png)

2.  **AIGNE Hub (セルフホスト)**: 独自のAIGNE Hubインスタンスに接続します。

    ![セルフホストAIGNE Hubへの接続](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **サードパーティモデルプロバイダー**: OpenAI、DeepSeek、Google Geminiなどのプロバイダーへの直接接続を設定します。これを行うには、対応するAPIキーを環境変数として設定します。OpenAIの場合は、以下を使用します。

    ```bash icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key"
    ```

    環境変数を設定した後、再度この例を実行してください。

## 完全なインストールと使用法

この例を開発または変更する場合は、リポジトリをクローンし、依存関係をローカルにインストールしてください。

### 1. リポジトリをクローンする

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

サンプルディレクトリに移動し、`pnpm` を使用して必要なパッケージをインストールします。

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-code-execution
pnpm install
```

### 3. 例を実行する

`pnpm start` コマンドを使用してワークフローを実行します。

*   **ワンショットモード**:

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **インタラクティブチャットモード**:

    ```bash icon=lucide:terminal
    pnpm start -- --chat
    ```

*   **パイプラインモード**:

    ```bash icon=lucide:terminal
    echo "Calculate 15!" | pnpm start
    ```

### コマンドラインオプション

この例では、その動作をカスタマイズするためのいくつかのコマンドライン引数をサポートしています。

| パラメータ | 説明 | デフォルト |
| :--- | :--- | :--- |
| `--chat` | インタラクティブチャットモードで実行します。 | 無効 |
| `--model <provider[:model]>` | 使用するAIモデルを指定します (例: `openai` または `openai:gpt-4o-mini`)。 | `openai` |
| `--temperature <value>` | モデル生成のtemperatureを設定します。 | プロバイダーのデフォルト |
| `--top-p <value>` | top-pサンプリングの値を設定します。 | プロバイダーのデフォルト |
| `--presence-penalty <value>` | presence penaltyの値を設定します。 | プロバイダーのデフォルト |
| `--frequency-penalty <value>` | frequency penaltyの値を設定します。 | プロバイダーのデフォルト |
| `--log-level <level>` | ログレベルを設定します (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`)。 | `INFO` |
| `--input`, `-i <input>` | 引数として直接入力を提供します。 | なし |

## コード実装

以下のTypeScriptコードは、コード実行ワークフローのコアロジックの概要を示しています。`sandbox` Agentと `coder` Agentを定義し、それらを呼び出して問題を解決します。

```typescript code-execution.ts icon=logos:typescript
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

// OpenAI APIキーが環境変数で利用可能であることを確認します。
const { OPENAI_API_KEY } = process.env;

// 1. AIモデルを初期化する
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. サンドボックスAgentを作成する
// このAgentはFunctionAgentを使用してJavaScriptコードを安全に実行します。
const sandbox = FunctionAgent.from({
  name: "evaluateJs",
  description: "A js sandbox for running javascript code",
  inputSchema: z.object({
    code: z.string().describe("The code to run"),
  }),
  process: async (input: { code: string }) => {
    const { code } = input;
    // evalの使用はこのサンドボックス化されたAgent内に隔離されています。
    // biome-ignore lint/security/noGlobalEval: This is an intentional use for a sandboxed environment.
    const result = eval(code);
    return { result };
  },
});

// 3. コーダーAgentを作成する
// このAI Agentは、サンドボックススキルを使用してコードを書き、実行するように指示されます。
const coder = AIAgent.from({
  name: "coder",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the sandbox to execute your code.
`,
  skills: [sandbox],
});

// 4. AIGNEフレームワークを初期化する
const aigne = new AIGNE({ model });

// 5. ワークフローを呼び出す
const result = await aigne.invoke(coder, "10! = ?");
console.log(result);
```

期待される出力は、Agentからの最終メッセージを含むJSONオブジェクトです。

```json
{
  "$message": "The value of \\(10!\\) (10 factorial) is 3,628,800."
}
```

## デバッグ

AIGNEオブザーバーツールを使用して、Agentの実行を監視および分析できます。これにより、トレースの検査、詳細な呼び出しの表示、実行時のAgentの動作を理解するためのWebベースのインターフェースが提供されます。

まず、別のターミナルでオブザベーションサーバーを起動します。

```bash icon=lucide:terminal
aigne observe
```

ワークフローを実行した後、オブザーバーUIで実行トレースを表示できます。

![AIGNEオブザーブ実行](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-execute.png)

UIには、詳細な検査のために最近の実行リストが表示されます。

![AIGNEオブザーブリスト](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-list.png)