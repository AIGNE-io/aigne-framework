# ワークフローのハンドオフ

このガイドでは、ある Agent が別の専門 Agent にシームレスに制御をハンドオフ（引き渡し）するワークフローの構築方法を解説します。最後まで読むと、ユーザーの入力に基づいてタスクを委任し、より複雑で動的な問題解決を可能にするマルチ Agent システムを作成する方法を理解できます。

## 概要

多くの高度な AI アプリケーションでは、単一の Agent が幅広いタスクを処理するために必要なスキルをすべて備えているとは限りません。ワークフローのハンドオフパターンは、プライマリ Agent がディスパッチャーとして機能し、特定のトリガーや条件が満たされたときに専門 Agent に制御を移すことで、この問題に対処します。これによりシームレスな移行が実現し、異なる Agent が協力して複雑な問題を解決できるようになります。

この例では、単純なハンドオフを実装します。
*   **Agent A:** 汎用 Agent。
*   **Agent B:** 俳句でのみ対話する専門 Agent。

ユーザーが Agent A に「transfer to agent b」と指示すると、システムはシームレスに会話を Agent B にハンドオフし、以降のすべての対話は Agent B が行います。

```d2
shape: sequence_diagram

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE フレームワーク"
}

Agent-A: {
  label: "Agent A\n(汎用)"
}

Agent-B: {
  label: "Agent B\n(俳句専門)"
}

User -> AIGNE-Framework: "1. 'transfer to agent b'"
AIGNE-Framework -> Agent-A: "2. 入力で呼び出す"
Agent-A -> Agent-A: "3. スキル実行: transfer_to_b()"
Agent-A -> AIGNE-Framework: "4. Agent B オブジェクトを返す"
AIGNE-Framework -> AIGNE-Framework: "5. ハンドオフ: Agent A を B に置き換える"
AIGNE-Framework -> Agent-B: "6. 応答のために Agent B を呼び出す"
Agent-B -> AIGNE-Framework: "7. 俳句の応答を生成"
AIGNE-Framework -> User: "8. Agent B の応答を表示"

User -> AIGNE-Framework: "9. 'It's a beautiful day'"
AIGNE-Framework -> Agent-B: "10. 新しい入力で呼び出す"
Agent-B -> AIGNE-Framework: "11. 別の俳句を生成"
AIGNE-Framework -> User: "12. Agent B の応答を表示"
```

## 前提条件

この例を実行する前に、開発環境が以下の要件を満たしていることを確認してください。

*   **Node.js:** バージョン 20.0 以上。
*   **npm:** Node.js に同梱されています。
*   **AI モデルプロバイダーのアカウント:** Agent を動作させるために、OpenAI などのプロバイダーから発行された API キーが必要です。

## クイックスタート

`npx` を使用すると、リポジトリをクローンせずにこの例を直接実行できます。

### ステップ1：例を実行する

ターミナルを開き、以下のいずれかのコマンドを実行します。`--interactive` フラグを使用すると、継続的な会話ができる対話型セッションが有効になります。

```bash ワンショットモードで実行 icon=lucide:terminal
npx -y @aigne/example-workflow-handoff
```

```bash 対話型チャットモードで実行 icon=lucide:terminal
npx -y @aigne/example-workflow-handoff --interactive
```

コマンドに直接入力をパイプすることもできます。

```bash パイプライン入力を使用 icon=lucide:terminal
echo "transfer to agent b" | npx -y @aigne/example-workflow-handoff
```

### ステップ2：AI モデルに接続する

初めてこの例を実行する場合、API キーが設定されていないため、AI モデルに接続するよう求められます。

![run example](../../../examples/workflow-handoff/run-example.png)

続行するには、いくつかの選択肢があります。

1.  **AIGNE Hub に接続する（推奨）**
    これが最も簡単な開始方法です。公式の AIGNE Hub は、新規ユーザー向けに無料クレジットを提供しています。最初のオプションを選択すると、ブラウザが開き、接続を承認するためのページが表示されます。

    ![connect to official aigne hub](../../../examples/images/connect-to-aigne-hub.png)

2.  **セルフホストの AIGNE Hub に接続する**
    独自の AIGNE Hub インスタンスをお持ちの場合は、2番目のオプションを選択し、その URL を入力して接続します。

    ![connect to self hosted aigne hub](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **サードパーティのモデルプロバイダーを設定する**
    適切な環境変数を設定することで、OpenAI、DeepSeek、Google Gemini などのプロバイダーに直接接続できます。例えば、OpenAI を使用する場合は、ターミナルで API キーを設定します。

    ```bash OpenAI API キーを設定 icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

    環境変数を設定した後、再度 `npx` コマンドを実行してください。

## コードの詳細

この例の核となるのは、最初の Agent の「スキル」として機能する関数です。モデルがユーザーの入力に基づいてこのスキルを使用すべきだと判断すると、この関数は新しい Agent を返し、効果的に制御を移譲します。

### 仕組み

1.  **Agent A (ディスパッチャー):** この Agent は `transfer_to_b` スキルで設定されています。その指示は汎用的なものです。
2.  **Agent B (スペシャリスト):** この Agent には「俳句でのみ話すこと」という非常に具体的な指示があります。特別なスキルはありません。
3.  **ハンドオフの仕組み:** `transfer_to_b` 関数は、単に `agentB` オブジェクトを返します。AIGNE フレームワークは、スキル実行の結果として Agent オブジェクトを受け取ると、セッション内の現在の Agent を新しい Agent に置き換えます。

### 実装例

以下のコードは、2つの Agent を定義し、ハンドオフのロジックを実装する方法を示しています。

```typescript index.ts icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// 1. AI モデルを初期化する
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. ハンドオフを実行するスキルを定義する
function transfer_to_b() {
  return agentB;
}

// 3. ハンドオフスキルを持つ Agent A を定義する
const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent.",
  outputKey: "A",
  skills: [transfer_to_b],
});

// 4. 専門家である Agent B を定義する
const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
});

// 5. AIGNE ランタイムを初期化する
const aigne = new AIGNE({ model });

// 6. Agent A でセッションを開始する
const userAgent = aigne.invoke(agentA);

// 7. 最初の呼び出し：ハンドオフをトリガーする
const result1 = await userAgent.invoke("transfer to agent b");
console.log(result1);
// 期待される出力:
// {
//   B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?",
// }

// 8. 2回目の呼び出し：今度は Agent B と対話する
const result2 = await userAgent.invoke("It's a beautiful day");
console.log(result2);
// 期待される出力:
// {
//   B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy.  ",
// }
```

## ソースからの実行（オプション）

コードをローカルで変更または確認したい場合は、以下の手順に従ってください。

### 1. リポジトリをクローンする

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

サンプルディレクトリに移動し、`pnpm` を使用して必要なパッケージをインストールします。

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-handoff
pnpm install
```

### 3. 例を実行する

`pnpm start` コマンドを使用します。`--interactive` のような追加の引数を渡すには、その前に `--` を追加します。

```bash ワンショットモードで実行 icon=lucide:terminal
pnpm start
```

```bash 対話型チャットモードで実行 icon=lucide:terminal
pnpm start -- --interactive
```

## コマンドラインオプション

このサンプルスクリプトは、動作をカスタマイズするためのいくつかのコマンドライン引数を受け付けます。

| パラメータ | 説明 | デフォルト |
|---|---|---|
| `--interactive` | 対話型のチャットモードで実行します。 | 無効 |
| `--model <provider[:model]>` | 使用する AI モデル（例：`openai` または `openai:gpt-4o-mini`）。 | `openai` |
| `--temperature <value>` | モデル生成時の Temperature。 | プロバイダーのデフォルト |
| `--top-p <value>` | Top-p サンプリングの値。 | プロバイダーのデフォルト |
| `--presence-penalty <value>` | Presence penalty の値。 | プロバイダーのデフォルト |
| `--frequency-penalty <value>` | Frequency penalty の値。 | プロバイダーのデフォルト |
| `--log-level <level>` | ログレベルを設定します（ERROR, WARN, INFO, DEBUG, TRACE）。 | INFO |
| `--input`, `-i <input>` | コマンドライン経由で直接入力を指定します。 | なし |

## デバッグと監視

Agent の実行フローを検査するには、`aigne observe` コマンドを使用できます。このツールは、トレース、呼び出し、その他のランタイムデータを詳細に表示するローカルウェブサーバーを起動し、デバッグに非常に役立ちます。

まず、別のターミナルで監視サーバーを起動します。

```bash 監視サーバーを起動 icon=lucide:terminal
aigne observe
```

![aigne-observe-execute](../../../examples/images/aigne-observe-execute.png)

例を実行した後、ウェブインターフェース（通常は `http://localhost:7893` で利用可能）で実行トレースを表示できます。

![aigne-observe-list](../../../examples/images/aigne-observe-list.png)

## まとめ

これで、タスクを専門の Agent に委任するマルチ Agent システムを構築するための強力なパターンである、ワークフローのハンドオフを実装する方法を学びました。このアプローチにより、異なるスキルを持つ Agent を組み合わせることで、より堅牢で有能な AI アプリケーションを構築できます。

より高度な Agent オーケストレーションを探求するには、以下の関連例をご覧ください。

<x-cards data-columns="2">
  <x-card data-title="ワークフローオーケストレーション" data-icon="lucide:milestone" data-href="/examples/workflow-orchestration">高度な処理パイプラインで連携する複数の Agent を調整します。</x-card>
  <x-card data-title="ワークフロールーター" data-icon="lucide:git-fork" data-href="/examples/workflow-router">コンテンツに基づいてリクエストを適切なハンドラに転送するためのインテリジェントなルーティングロジックを実装します。</x-card>
</x-cards>
