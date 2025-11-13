# ワークフロールーター

このガイドでは、ユーザーのリクエストを最も適切な専門エージェントに自動的にルーティングするインテリジェントなワークフローを構築する方法を説明します。スマートなディスパッチャーとして機能する「トリアージ」エージェントを作成し、受信したクエリを分析し、クエリの内容に基づいて他のエージェントに転送する方法を学びます。

## 概要

多くのアプリケーションでは、ユーザーのリクエストは製品サポート、ユーザーフィードバック、一般的な質問など、さまざまなカテゴリに分類されます。ルーターワークフローは、プライマリエージェントを使用してリクエストを分類し、それを適切な下流エージェントに委任することで、これを効率的に処理する方法を提供します。このパターンにより、ユーザーは迅速かつ効率的に適切なリソースに接続されます。

このワークフローは、メインの `triage` エージェントといくつかの専門エージェントで構成されています。

-   **Triage Agent**: エントリーポイント。ユーザーのクエリを分析し、どの専門エージェントがそれを処理すべきかを決定します。
-   **Product Support Agent**: 製品の使用に関する質問を処理します。
-   **Feedback Agent**: ユーザーのフィードバックや提案を管理します。
-   **Other Agent**: 他のカテゴリに当てはまらないクエリのための汎用エージェント。

```d2
direction: down

User: {
  shape: c4-person
}

Workflow: {
  label: "ワークフロールーター"
  shape: rectangle

  Triage-Agent: {
    label: "Triage Agent"
    shape: diamond
  }

  Specialized-Agents: {
    shape: rectangle
    grid-columns: 3

    Product-Support-Agent: {
      label: "Product Support Agent"
      shape: rectangle
    }

    Feedback-Agent: {
      label: "Feedback Agent"
      shape: rectangle
    }

    Other-Agent: {
      label: "Other Agent"
      shape: rectangle
    }
  }
}

User -> Workflow.Triage-Agent: "ユーザーのクエリ"
Workflow.Triage-Agent -> Workflow.Specialized-Agents.Product-Support-Agent: "にルーティング"
Workflow.Triage-Agent -> Workflow.Specialized-Agents.Feedback-Agent: "にルーティング"
Workflow.Triage-Agent -> Workflow.Specialized-Agents.Other-Agent: "にルーティング"
```

## 前提条件

この例を実行する前に、以下がインストールされ、設定されていることを確認してください。

-   **Node.js**: バージョン20.0以上。
-   **npm**: Node.jsに同梱されています。
-   **OpenAI APIキー**: OpenAIの言語モデルに接続するために、OpenAIのAPIキーが必要です。[OpenAI Platform](https://platform.openai.com/api-keys)から取得できます。

## クイックスタート

この例は、`npx` を使用してローカルにインストールすることなく直接実行できます。

### 例を実行する

この例は、ワンショットモード、対話型チャットモード、または入力を直接パイプすることで実行できます。

1.  **ワンショットモード（デフォルト）**
    このコマンドは、デフォルトの質問でワークフローを実行して終了します。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-router
    ```

2.  **対話型チャットモード**
    `--chat` フラグを使用すると、複数の質問ができる対話型セッションを開始します。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-router --chat
    ```

3.  **パイプライン入力**
    質問をコマンドに直接パイプすることができます。

    ```sh icon=lucide:terminal
    echo "How do I return a product?" | npx -y @aigne/example-workflow-router
    ```

### AIモデルに接続する

初めてこの例を実行すると、AIモデルに接続するように求められます。いくつかの選択肢があります。

1.  **AIGNE Hub（公式）**: 最も簡単に始める方法です。ブラウザが開き、プロンプトに従って接続できます。新規ユーザーは無料のトークンが付与されます。
2.  **AIGNE Hub（セルフホスト）**: 独自のAIGNE Hubインスタンスをホストしている場合は、そのURLを提供して接続できます。
3.  **サードパーティモデルプロバイダー**: APIキーを持つ環境変数を設定することで、OpenAIのようなプロバイダーに直接接続できます。

    ```sh icon=lucide:terminal
    export OPENAI_API_KEY="your_openai_api_key_here"
    ```

    キーを設定した後、再度サンプルコマンドを実行してください。

## 実装の詳細

このワークフローの中核は `triage` エージェントで、他のエージェントを「スキル」または「ツール」として使用します。`toolChoice` を `"router"` に設定することで、`triage` エージェントに、受信したリクエストを処理するために利用可能なスキルのうち、ちょうど1つを選択するように指示します。

### コード例

以下のTypeScriptコードは、専門エージェントとメインのルーティングエージェントを定義する方法を示しています。

```typescript router.ts icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// 1. チャットモデルを初期化する
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 専門エージェントを定義する
const productSupport = AIAgent.from({
  name: "product_support",
  description: "製品に関するあらゆる質問を支援するエージェント。",
  instructions: `あなたは製品に関するあらゆる質問を処理できるエージェントです。
  あなたの目標は、製品に関する正確で役立つ情報を提供することです。
  丁寧でプロフェッショナルであり、ユーザーがサポートされていると感じられるようにしてください。`,
  outputKey: "product_support",
});

const feedback = AIAgent.from({
  name: "feedback",
  description: "フィードバックに関するあらゆる質問を支援するエージェント。",
  instructions: `あなたはフィードバックに関するあらゆる質問を処理できるエージェントです。
  あなたの目標は、ユーザーのフィードバックに耳を傾け、その入力を認め、適切な応答を提供することです。
  共感的で理解があり、ユーザーが自分の意見が聞かれていると感じられるようにしてください。`,
  outputKey: "feedback",
});

const other = AIAgent.from({
  name: "other",
  description: "一般的な質問を支援するエージェント。",
  instructions: `あなたは一般的な質問を処理できるエージェントです。
  あなたの目標は、幅広いトピックに関する正確で役立つ情報を提供することです。
  フレンドリーで知識が豊富であり、ユーザーが提供された情報に満足していると感じられるようにしてください。`,
  outputKey: "other",
});

// 3. Triage（ルーター）エージェントを定義する
const triage = AIAgent.from({
  name: "triage",
  instructions: `あなたは質問を適切なエージェントにルーティングできるエージェントです。
  あなたの目標は、ユーザーのクエリを理解し、彼らを支援するのに最も適したエージェントに誘導することです。
  効率的で明確であり、ユーザーが迅速に適切なリソースに接続されるようにしてください。`,
  skills: [productSupport, feedback, other],
  toolChoice: "router", // これによりルーターモードが有効になります
});

// 4. AIGNEを初期化し、ワークフローを呼び出す
const aigne = new AIGNE({ model });

// 例1：製品サポートに関するクエリ
const result1 = await aigne.invoke(triage, "How to use this product?");
console.log(result1);

// 例2：フィードバックに関するクエリ
const result2 = await aigne.invoke(triage, "I have feedback about the app.");
console.log(result2);

// 例3：一般的なクエリ
const result3 = await aigne.invoke(triage, "What is the weather today?");
console.log(result3);
```

### 期待される出力

コードを実行すると、`triage` エージェントは各質問を分析し、適切な専門エージェントにルーティングします。最終的な出力は、選択されたエージェントの `outputKey` をキーとするオブジェクトになります。

**製品サポートに関するクエリ:**
```json
{
  "product_support": "I’d be happy to help you with that! However, I need to know which specific product you’re referring to. Could you please provide me with the name or type of product you have in mind?"
}
```

**フィードバックに関するクエリ:**
```json
{
  "feedback": "Thank you for sharing your feedback! I'm here to listen. Please go ahead and let me know what you’d like to share about the app."
}
```

**一般的なクエリ:**
```json
{
  "other": "I can't provide real-time weather updates. However, you can check a reliable weather website or a weather app on your phone for the current conditions in your area. If you tell me your location, I can suggest a few sources where you can find accurate weather information!"
}
```

## ソースから実行する（オプション）

リポジトリのローカルクローンから例を実行したい場合は、以下の手順に従ってください。

1.  **リポジトリをクローンする**

    ```sh icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **依存関係をインストールする**

    サンプルディレクトリに移動し、`pnpm` を使用して依存関係をインストールします。

    ```sh icon=lucide:terminal
    cd aigne-framework/examples/workflow-router
    pnpm install
    ```

3.  **例を実行する**

    `pnpm start` コマンドを使用してワークフローを実行します。コマンドライン引数は `--` の後に渡す必要があります。

    ```sh icon=lucide:terminal
    # ワンショットモードで実行
    pnpm start

    # 対話型チャットモードで実行
    pnpm start -- --chat

    # パイプライン入力を使用
    echo "How do I return a product?" | pnpm start
    ```

### コマンドラインオプション

以下のパラメータで実行をカスタマイズできます。

| パラメータ | 説明 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `--chat` | 対話型チャットモードで実行します。 |
| `--model <provider[:model]>` | 使用するAIモデル。例：`openai` または `openai:gpt-4o-mini`。 |
| `--temperature <value>` | モデル生成の温度。 |
| `--top-p <value>` | Top-pサンプリング値。 |
| `--presence-penalty <value>` | 存在ペナルティ値。 |
| `--frequency-penalty <value>` | 頻度ペナルティ値。 |
| `--log-level <level>` | ログレベルを設定します：`ERROR`、`WARN`、`INFO`、`DEBUG`、または `TRACE`。 |
| `--input`, `-i <input>` | 直接入力を指定します。 |

## まとめ

この例は、複雑なAIワークフローを構築するための強力で一般的なパターンを示しています。ルーターエージェントを作成することで、タスクを専門エージェントに効果的に管理および委任し、より正確で効率的なアプリケーションを実現できます。

さらに探求を続けるには、以下の関連する例を検討してください。

<x-cards data-columns="2">
  <x-card data-title="シーケンシャルワークフロー" data-icon="lucide:arrow-right-circle" data-href="/examples/workflow-sequential">
    エージェントが特定の順序でタスクを実行するワークフローの構築方法を学びます。
  </x-card>
  <x-card data-title="ハンドオフワークフロー" data-icon="lucide:arrow-right-left" data-href="/examples/workflow-handoff">
    専門エージェント間でシームレスな移行を作成し、複雑な問題を段階的に解決します。
  </x-card>
</x-cards>