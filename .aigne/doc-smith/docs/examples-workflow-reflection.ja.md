# ワークフローリフレクション

AI ワークフローが自身の誤りを修正するようにするにはどうすればよいか、考えたことはありますか？このガイドでは、1つの AI Agent がコンテンツを生成し、別の AI Agent がそれをレビューして改良することで、継続的な改善のためのフィードバックループを作成する自己改善システムを構築する方法を実演します。洗練された最終成果物を生成するために協力する「コーダー」と「レビュアー」の Agent チームを設定する方法を学びます。

## 概要

ワークフローリフレクションパターンには、反復的な改良のために設計されたマルチ Agent システムが含まれます。この例では、2つの異なる Agent を持つワークフローを作成します。

*   **コーダー Agent**: ユーザーのリクエストに基づいて初期ソリューションを生成する責任があります（例：コードの一部を記述する）。
*   **レビュアー Agent**: 特定の基準（例：正確性、効率性、安全性）に対してコーダーの出力を評価します。

ワークフローは構造化されたループに従います。

1.  ユーザーが初期のアイデアや問題を提供します。
2.  `Coder` Agent がアイデアを受け取り、解決策を生成します。
3.  `Reviewer` Agent が解決策を検証します。
4.  解決策が承認された場合、最終出力に送られます。
5.  解決策が拒否された場合、`Reviewer` はフィードバックを提供し、リクエストは修正のために `Coder` に送り返されます。

この周期的なプロセスは、`Reviewer` が出力を承認するまで続き、高品質な結果を保証します。

```d2
direction: down

User: {
  shape: c4-person
}

Coder-Agent: {
  label: "コーダー Agent"
  shape: rectangle
}

Reviewer-Agent: {
  label: "レビュアー Agent"
  shape: rectangle
}

Decision: {
  label: "承認？"
  shape: diamond
}

Final-Output: {
  label: "最終出力"
  shape: rectangle
}

User -> Coder-Agent: "1. アイデアの提供"
Coder-Agent -> Reviewer-Agent: "2. 解決策の生成"
Reviewer-Agent -> Decision: "3. 解決策の検証"
Decision -> Final-Output: "4. はい"
Decision -> Coder-Agent: "5. いいえ、フィードバックを提供"
```

## クイックスタート

この例は、`npx` を使用してローカルにインストールすることなく直接実行できます。

### 例を実行する

ターミナルで以下のコマンドを実行してください。

*   **ワンショットモード**: Agent は単一の入力を処理して終了します。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-reflection
    ```

*   **対話型チャットモード**: Agent チームとの継続的なチャットセッションを開始します。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-reflection --chat
    ```

*   **パイプラインモード**: 他のコマンドから直接入力をパイプします。

    ```bash icon=lucide:terminal
    echo "Write a function to validate email addresses" | npx -y @aigne/example-workflow-reflection
    ```

### AI モデルに接続する

AIGNE フレームワークが機能するには、大規模言語モデル（LLM）への接続が必要です。AIGNE Hub を通じて接続して管理された体験を得るか、サードパーティプロバイダーを直接設定することができます。

例えば、OpenAI を使用するには、`OPENAI_API_KEY` 環境変数を設定します。

```bash OpenAI API キーを設定 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```

API キーを設定した後、再度この例を実行してください。異なるモデルプロバイダーの設定に関する詳細なガイドについては、[モデル設定](./models-configuration.md) のドキュメントを参照してください。

## ソースから実行する

コードを調査または変更したい開発者は、以下の手順に従ってソースリポジトリからこの例を実行してください。

### 1. リポジトリをクローンする

まず、AIGNE フレームワークのリポジトリをローカルマシンにクローンします。

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

この例のディレクトリに移動し、`pnpm` を使用して必要な依存関係をインストールします。

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-reflection
pnpm install
```

### 3. 例を実行する

開始スクリプトを実行してワークフローを起動します。

*   **ワンショットモード（デフォルト）**

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **対話型チャットモード**

    ```bash icon=lucide:terminal
    pnpm start -- --chat
    ```

## コード実装

この例の中核は、`Coder` と `Reviewer` の Agent を定義し、編成する TypeScript ファイルです。主要なコンポーネントを見ていきましょう。

```typescript reflection-workflow.ts icon=logos:typescript
import { AIAgent, AIGNE, UserInputTopic, UserOutputTopic } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;

// 1. AI モデルを初期化
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. コーダー Agent を定義
const coder = AIAgent.from({
  subscribeTopic: [UserInputTopic, "rewrite_request"],
  publishTopic: "review_request",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the reviewer to improve your code.
Always put all finished code in a single Markdown code block.
For example:
\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

Respond using the following format:

Thoughts: <Your comments>
Code: <Your code>

Previous review result:
{{feedback}}

User's question:
{{question}}
`,
  outputSchema: z.object({
    code: z.string().describe("Your code"),
  }),
});

// 3. レビュアー Agent を定義
const reviewer = AIAgent.from({
  subscribeTopic: "review_request",
  publishTopic: (output) =>
    output.approval ? UserOutputTopic : "rewrite_request",
  instructions: `\
You are a code reviewer. You focus on correctness, efficiency and safety of the code.

The problem statement is: {{question}}
The code is:
\`\`\`
{{code}}
\`\`\`

Previous feedback:
{{feedback}}

Please review the code. If previous feedback was provided, see if it was addressed.
`,
  outputSchema: z.object({
    approval: z.boolean().describe("APPROVE or REVISE"),
    feedback: z.object({
      correctness: z.string().describe("Your comments on correctness"),
      efficiency: z.string().describe("Your comments on efficiency"),
      safety: z.string().describe("Your comments on safety"),
      suggested_changes: z
        .string()
        .describe("Your comments on suggested changes"),
    }),
  }),
  includeInputInOutput: true,
});

// 4. AIGNE インスタンスを初期化して実行
const aigne = new AIGNE({ model, agents: [coder, reviewer] });
aigne.publish(
  UserInputTopic,
  "Write a function to find the sum of all even numbers in a list.",
);

const { message } = await aigne.subscribe(UserOutputTopic);
console.log(message);
```

### 説明

1.  **モデルを初期化**: `OpenAIChatModel` インスタンスが作成され、両方の Agent の基盤となる LLM として機能します。
2.  **コーダー Agent を定義**:
    *   `subscribeTopic`: 初期のユーザー入力 (`UserInputTopic`) と、レビュアーからの修正リクエスト (`rewrite_request`) をリッスンします。
    *   `publishTopic`: 生成したコードを `review_request` トピックに送信し、レビュアーが受け取れるようにします。
    *   `instructions`: 役割、出力形式、フィードバックの処理方法を定義する詳細なプロンプトです。
    *   `outputSchema`: Zod スキーマを使用して、出力に `code` 文字列が含まれていることを強制します。
3.  **レビュアー Agent を定義**:
    *   `subscribeTopic`: `review_request` トピックでのコード提出をリッスンします。
    *   `publishTopic`: 出力を動的にルーティングする関数です。`approval` が `true` の場合、結果は最終的な `UserOutputTopic` に送信されます。それ以外の場合は、コーダーが修正するために `rewrite_request` トピックに送り返されます。
    *   `instructions`: コードをどのように評価するかをレビュアーに指示するプロンプトです。
    *   `outputSchema`: ブール値の `approval` フィールドと構造化された `feedback` オブジェクトを要求する Zod スキーマです。
4.  **ワークフローを実行**:
    *   モデルと2つの Agent を持つ `AIGNE` インスタンスが作成されます。
    *   `aigne.publish()` は、最初の問題提起を `UserInputTopic` に送信し、ワークフローを開始します。
    *   `aigne.subscribe()` は、`UserOutputTopic` でのメッセージを待ちます。これは、レビュアーがコードを承認した場合にのみ発生します。

### 出力例

スクリプトが実行されると、最終的に承認された出力がコンソールに記録されます。

```json
{
  "code": "def sum_of_even_numbers(numbers):\n    \"\"\"Function to calculate the sum of all even numbers in a list.\"\"\"\n    return sum(number for number in numbers if number % 2 == 0)",
  "approval": true,
  "feedback": {
    "correctness": "The function correctly calculates the sum of all even numbers in the given list. It properly checks for evenness using the modulus operator and sums the valid numbers.",
    "efficiency": "The implementation is efficient as it uses a generator expression which computes the sum in a single pass over the list. This minimizes memory usage as compared to creating an intermediate list of even numbers.",
    "safety": "The function does not contain any safety issues. However, it assumes that all elements in the input list are integers. It would be prudent to handle cases where the input contains non-integer values (e.g., None, strings, etc.).",
    "suggested_changes": "Consider adding type annotations to the function for better clarity and potential type checking, e.g. `def sum_of_even_numbers(numbers: list[int]) -> int:`. Also, include input validation to ensure 'numbers' is a list of integers."
  }
}
```

## コマンドラインオプション

以下のコマンドラインフラグを使用して実行をカスタマイズできます。

| パラメータ | 説明 | デフォルト |
| :--- | :--- | :--- |
| `--chat` | 対話型チャットモードで実行します。 | 無効 |
| `--model <provider[:model]>` | 使用するAIモデル（例：'openai' または 'openai:gpt-4o-mini'）。 | `openai` |
| `--temperature <value>` | モデル生成時の Temperature。 | プロバイダーのデフォルト |
| `--top-p <value>` | モデル生成時の Top-p サンプリング値。 | プロバイダーのデフォルト |
| `--presence-penalty <value>` | モデル生成時の Presence penalty 値。 | プロバイダーのデフォルト |
| `--frequency-penalty <value>` | モデル生成時の Frequency penalty 値。 | プロバイダーのデフォルト |
| `--log-level <level>` | ログレベルを設定します (ERROR, WARN, INFO, DEBUG, TRACE)。 | `INFO` |
| `--input`, `-i <input>` | コマンドライン経由で直接入力を指定します。 | なし |

#### 使用例

```bash ログレベルを DEBUG に設定 icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

## まとめ

この例は、堅牢で自己修正可能なAIシステムを構築する上でのワークフローリフレクションの力を示しています。生成と評価の役割を別々の Agent に分けることで、最終的な出力の品質と信頼性を大幅に向上させるフィードバックループを作成できます。

他の高度なワークフローパターンを探るには、以下の例を参照してください。

<x-cards data-columns="2">
  <x-card data-title="ワークフローオーケストレーション" data-href="/examples/workflow-orchestration" data-icon="lucide:workflow">
  洗練された処理パイプラインで連携して動作する複数の Agent を調整します。
  </x-card>
  <x-card data-title="ワークフロールーター" data-href="/examples/workflow-router" data-icon="lucide:git-fork">
  リクエストを適切なハンドラーに誘導するためのインテリジェントなルーティングロジックを実装します。
  </x-card>
</x-cards>