# ワークフローのコード実行

AI モデルから動的に生成されたコードを実行することは、セキュリティと信頼性の面で大きな課題をもたらします。このガイドでは、AIGNE フレームワークを使用して安全なコード実行ワークフローを構築するための、構造化されたステップバイステップのプロセスを提供します。コードを生成する `Coder` Agent と、それを隔離された環境で実行する `Sandbox` Agent を連携させる方法を学びます。

## 概要

コード実行ワークフローは、動的なコード生成と実行を必要とするタスクを安全に処理するように設計されています。これには、2つの Agent システムを採用しています。

1.  **Coder Agent**: ユーザーのリクエストを解釈し、それを解決するために必要な JavaScript コードを作成する役割を担う AI 駆動の Agent。
2.  **Sandbox Agent**: 生成されたコードを受け取り、それを制御された環境で実行して結果を返す `FunctionAgent`。

この関心の分離により、AI のコード生成が直接の実行から隔離され、セキュリティの層が提供されます。

### 論理フロー

以下の図は、Agent 間の高レベルな相互作用を示しています。`Coder` Agent は入力を受け取り、コードを生成し、それを実行のために `Sandbox` に渡し、最終的な出力をフォーマットします。

```d2
direction: down

User-Input: {
  label: "ユーザー入力\n(例: '15! を計算して')"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE フレームワーク"
  shape: rectangle

  Coder-Agent: {
    label: "Coder Agent\n(AIAgent)"
    shape: rectangle
  }

  Sandbox-Agent: {
    label: "Sandbox Agent\n(FunctionAgent)"
    shape: rectangle
  }
}

Final-Output: {
  label: "最終出力"
  shape: rectangle
}

User-Input -> AIGNE-Framework.Coder-Agent: "1. プロンプトを受信"
AIGNE-Framework.Coder-Agent -> AIGNE-Framework.Sandbox-Agent: "2. JS コードを生成し、実行のために渡す"
AIGNE-Framework.Sandbox-Agent -> AIGNE-Framework.Coder-Agent: "3. コードを実行し、結果を返す"
AIGNE-Framework.Coder-Agent -> Final-Output: "4. 最終的なレスポンスをフォーマット"

```

### 相互作用のシーケンス

このシーケンス図は、階乗の計算などの特定のタスクに対するユーザーと Agent 間のターンごとの通信を詳細に示しています。


## クイックスタート

この例は、`npx` を使用してローカルに何もインストールすることなく直接実行できます。

### 例を実行する

この例では、単一のタスクのためのワンショット実行モードと、対話的なワークフローのためのインタラクティブチャットモードをサポートしています。

#### ワンショットモード

これはデフォルトのモードです。Agent は単一の入力を処理して終了します。

```bash icon=lucide:terminal
npx -y @aigne/example-workflow-code-execution
```

標準入力パイプラインを介して直接入力を提供することもできます。

```bash icon=lucide:terminal
echo 'Calculate 15!' | npx -y @aigne/example-workflow-code-execution
```

#### インタラクティブチャットモード

`--chat` フラグを使用して永続的なセッションを開始し、Agent と会話することができます。

```bash icon=lucide:terminal
npx -y @aigne/example-workflow-code-execution --chat
```

### AI モデルに接続する

この例を初めて実行すると、`Coder` Agent が機能するために大規模言語モデル（LLM）が必要なため、接続を求めるプロンプトが表示されます。


続行するにはいくつかのオプションがあります。

#### オプション 1: AIGNE Hub (推奨)

これは最も簡単に始める方法です。公式の AIGNE Hub は、新規ユーザーに無料クレジットを提供しています。

1.  最初のオプション「`Connect to the Arcblock official AIGNE Hub`」を選択します。
2.  ウェブブラウザで認証ページが開きます。
3.  プロンプトに従って接続を承認します。


#### オプション 2: 自己ホスト型 AIGNE Hub

独自の AIGNE Hub のインスタンスをお持ちの場合は、それに接続できます。

1.  2番目のオプション「`Connect to a self-hosted AIGNE Hub`」を選択します。
2.  AIGNE Hub インスタンスの URL を入力するよう求められます。


#### オプション 3: サードパーティのモデルプロバイダー

適切な環境変数を設定することで、OpenAI、Anthropic、Google Gemini などのサードパーティのモデルプロバイダーに直接接続できます。たとえば、OpenAI を使用するには、API キーを設定します。

```bash icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

環境変数を設定した後、再度サンプルコマンドを実行してください。サポートされているすべてのプロバイダーとその必要な環境変数のリストについては、サンプルの `.env.local.example` ファイルを参照してください。

### AIGNE Observe でのデバッグ

AIGNE フレームワークには、Agent の動作をデバッグおよび分析するための強力な可観測性ツールが含まれています。

1.  **サーバーの起動**: ターミナルで `aigne observe` コマンドを実行します。これにより、ローカルウェブサーバーが起動します。

    ```bash icon=lucide:terminal
    aigne observe
    ```

    
2.  **トレースの表示**: ウェブブラウザを開き、提供されたローカル URL（例: `http://localhost:7893`）に移動します。インターフェースには最近の Agent 実行のリストが表示され、各トレースの入力、出力、ツールコール、およびパフォーマンスメトリクスを検査できます。

    
## ローカルでのインストールと使用方法

開発目的で、リポジトリをクローンしてサンプルをローカルで実行できます。

### 前提条件

-   [Node.js](https://nodejs.org) (バージョン 20.0 以上)
-   パッケージ管理のための [pnpm](https://pnpm.io)

### 1. リポジトリをクローンする

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

サンプルディレクトリに移動し、必要なパッケージをインストールします。

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-code-execution
pnpm install
```

### 3. 例を実行する

`pnpm start` コマンドを使用してワークフローを実行します。

```bash icon=lucide:terminal
# ワンショットモードで実行 (デフォルト)
pnpm start

# インタラクティブチャットモードで実行
pnpm start -- --chat

# パイプライン入力を使用
echo "Calculate 15!" | pnpm start
```

### コマンドラインオプション

このスクリプトは、その動作をカスタマイズするためにいくつかのコマンドライン引数を受け入れます。

| パラメータ | 説明 | デフォルト |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- |
| `--chat` | インタラクティブチャットモードで実行します。 | 無効 |
| `--model <provider[:model]>` | 使用する AI モデルを指定します。例: `openai` または `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | モデル生成の temperature を設定します。 | プロバイダーのデフォルト |
| `--top-p <value>` | top-p サンプリング値を設定します。 | プロバイダーのデフォルト |
| `--presence-penalty <value>`| presence penalty の値を設定します。 | プロバイダーのデフォルト |
| `--frequency-penalty <value>`| frequency penalty の値を設定します。 | プロバイダーのデフォルト |
| `--log-level <level>` | ログレベルを設定します (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`)。 | `INFO` |
| `--input`, `-i <input>` | 引数として直接入力を提供します。 | なし |

#### 使用例

このコマンドは、`DEBUG` ログレベルでインタラクティブモードでワークフローを実行します。

```bash icon=lucide:terminal
pnpm start -- --chat --log-level DEBUG
```

## コードの実装

以下の TypeScript コードは、コード実行ワークフローを構築する方法を示しています。`sandbox` と `coder` の Agent を定義し、AIGNE インスタンスを使用してそれらを呼び出します。

```typescript index.ts icon=logos:typescript
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

// 環境変数から OpenAI API キーを取得します。
const { OPENAI_API_KEY } = process.env;

// 1. チャットモデルを初期化する
// このモデルが AI Agent を動かします。
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. Sandbox Agent を定義する
// この Agent は FunctionAgent を使用して JavaScript コードを安全に実行します。
const sandbox = FunctionAgent.from({
  name: "evaluateJs",
  description: "A js sandbox for running javascript code",
  inputSchema: z.object({
    code: z.string().describe("The code to run"),
  }),
  process: async (input: { code: string }) => {
    const { code } = input;
    // eval の使用はこのサンドボックス化された Agent 内に隔離されています。
    // biome-ignore lint/security/noGlobalEval: <This is a controlled sandbox environment for the example>
    const result = eval(code);
    return { result };
  },
});

// 3. Coder Agent を定義する
// この AI Agent はコードを書き、サンドボックススキルを使用するように指示されています。
const coder = AIAgent.from({
  name: "coder",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the sandbox to execute your code.
`,
  skills: [sandbox],
});

// 4. AIGNE フレームワークを初期化する
const aigne = new AIGNE({ model });

// 5. ワークフローを呼び出す
// AIGNE インスタンスは、ユーザーのプロンプトで Coder Agent を実行します。
const result = await aigne.invoke(coder, "10! = ?");

console.log(result);
// 期待される出力:
// {
//   $message: "The value of \\(10!\\) (10 factorial) is 3,628,800.",
// }
```

## まとめ

このガイドでは、AIGNE フレームワークを使用して安全なコード実行ワークフローを構築し、実行する方法を実演しました。コード生成と実行の関心事を別々の `AIAgent` と `FunctionAgent` の役割に分離することで、動的なコードを必要とするタスクに対して LLM の能力を安全に活用できます。

より高度なワークフローパターンについては、以下の例をご覧ください。
<x-cards data-columns="2">
  <x-card data-title="シーケンシャルワークフロー" data-href="/examples/workflow-sequential" data-icon="lucide:arrow-right-circle">保証された実行順序でステップバイステップの処理パイプラインを構築します。</x-card>
  <x-card data-title="ワークフローオーケストレーション" data-href="/examples/workflow-orchestration" data-icon="lucide:milestone">洗練された処理パイプラインで連携する複数の Agent を調整します。</x-card>
</x-cards>