# ワークフロー逐次実行

このガイドでは、タスクが保証された順序で実行されるステップバイステップの処理パイプラインを構築する方法を説明します。複数の Agent を連結し、ある Agent の出力を次の Agent の入力とすることで、信頼性が高く予測可能なワークフローを作成する方法を学びます。

この例は、コンテンツの下書き、推敲、そして公開のためのフォーマット化など、一連の変換や分析を必要とするプロセスに最適です。タスクの同時実行が有効なワークフローについては、[ワークフロー並行実行](./examples-workflow-concurrency.md) の例を参照してください。

## 概要

逐次実行ワークフローは、事前に定義された順序でタスクを処理します。各ステップは次のステップが始まる前に完了する必要があり、入力から最終出力まで順序正しい進行を保証します。このパターンは、複雑な多段階の Agent システムを構築するための基本です。

```d2
direction: down

Input: {
  label: "入力\n(製品説明)"
  shape: oval
}

Sequential-Workflow: {
  label: "逐次実行ワークフロー (TeamAgent)"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Concept-Extractor: {
    label: "1. コンセプト抽出"
    shape: rectangle
  }

  Writer: {
    label: "2. ライター"
    shape: rectangle
  }

  Format-Proofread: {
    label: "3. フォーマットと校正"
    shape: rectangle
  }
}

Output: {
  label: "最終出力\n(コンセプト、下書き、コンテンツ)"
  shape: oval
}

Input -> Sequential-Workflow.Concept-Extractor
Sequential-Workflow.Concept-Extractor -> Sequential-Workflow.Writer: "output: concept"
Sequential-Workflow.Writer -> Sequential-Workflow.Format-Proofread: "output: draft"
Sequential-Workflow.Format-Proofread -> Output: "output: content"
```

## クイックスタート

この例は、`npx` を使用してローカルにインストールすることなく直接実行できます。

### 前提条件

- [Node.js](https://nodejs.org) (バージョン 20.0 以上)
- サポートされているモデルプロバイダー (例: [OpenAI](https://platform.openai.com/api-keys)) の API キー

### ワークフローの実行

この例は、デフォルトのワンショットモード、対話型のチャットモード、または入力を直接パイプで渡す方法で実行できます。

1.  **ワンショットモード**: 事前に定義された入力でワークフローを一度実行します。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-sequential
    ```

2.  **対話型チャットモード**: 継続的に入力できるセッションを開始します。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-sequential --chat
    ```

3.  **パイプライン入力**: 他のコマンドからパイプで渡された入力を処理します。

    ```sh icon=lucide:terminal
    echo "Create marketing content for our new AI-powered fitness app" | npx -y @aigne/example-workflow-sequential
    ```

### AI モデルへの接続

ワークフローを実行するには、AI モデルに接続する必要があります。初回実行時に接続方法を選択するよう求められます。

- **AIGNE Hub (推奨)**: 最も簡単に始められる方法です。新規ユーザーには無料のトークンが付与されます。
- **セルフホスト AIGNE Hub**: 独自の AIGNE Hub インスタンスに接続します。
- **サードパーティプロバイダー**: OpenAI などのプロバイダーの API キーで環境を設定します。

OpenAI を直接使用するには、以下の環境変数を設定してください。

```sh icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

## 仕組み

逐次実行ワークフローは、`ProcessMode.sequential` で設定された `TeamAgent` を使用して構築されます。これにより、`skills` 配列にリストされている Agent が定義された順序で実行されることが保証されます。

### コード実装

中核となるロジックは、3つの異なる `AIAgent` インスタンスを定義し、それらを逐次実行の `TeamAgent` 内で連携させることです。

```typescript sequential-workflow.ts icon=logos:typescript
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. モデルを初期化する
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. シーケンスの最初の Agent を定義する: コンセプト抽出
const conceptExtractor = AIAgent.from({
  instructions: `\
あなたはマーケティングアナリストです。製品説明が与えられたら、以下を特定してください:
- 主要な機能
- ターゲットオーディエンス
- ユニークセリングポイント (USP)

製品説明:
{{product}}`,
  outputKey: "concept",
});

// 3. 2番目の Agent を定義する: ライター
const writer = AIAgent.from({
  instructions: `\
あなたはマーケティングコピーライターです。機能、オーディエンス、USP を記述したテキストブロックが与えられたら、
魅力的なマーケティングコピー (約150語) を作成してください。

製品説明:
{{product}}

以下は製品に関する情報です:
{{concept}}`, // 前の Agent の出力を使用する
  outputKey: "draft",
});

// 4. 最後の Agent を定義する: フォーマットと校正
const formatProof = AIAgent.from({
  instructions: `\
あなたは編集者です。下書きのコピーが与えられたら、文法を修正し、明瞭さを向上させ、一貫したトーンを確保してください。
最終的に磨き上げられたコピーを出力してください。

製品説明:
{{product}}

以下は製品に関する情報です:
{{concept}}

下書きコピー:
{{draft}}`, // 前の Agent たちの出力を使用する
  outputKey: "content",
});

// 5. AIGNE インスタンスと TeamAgent を設定する
const aigne = new AIGNE({ model });

const teamAgent = TeamAgent.from({
  skills: [conceptExtractor, writer, formatProof],
  mode: ProcessMode.sequential, // 実行モードを逐次実行に設定する
});

// 6. ワークフローを呼び出す
const result = await aigne.invoke(teamAgent, {
  product: "AIGNE is a No-code Generative AI Apps Engine",
});

console.log(result);
```

### 実行分析

1.  **モデルの初期化**: `OpenAIChatModel` が必要な API キーで設定されます。
2.  **Agent の定義**:
    *   `conceptExtractor`: 初期の `product` 説明を受け取り、`concept` の出力を生成します。
    *   `writer`: 元の `product` 説明と前のステップからの `concept` を使用して `draft` を作成します。
    *   `formatProof`: これまでのすべての出力 (`product`, `concept`, `draft`) を受け取り、最終的な `content` を生成します。
3.  **チームの設定**: `TeamAgent` が、目的の実行順序で3つの Agent と共に作成されます。この順序を強制するために `ProcessMode.sequential` が指定されています。
4.  **呼び出し**: `aigne.invoke` メソッドが、初期入力オブジェクトでワークフローを開始します。フレームワークは自動的に状態を管理し、蓄積された出力を後続の各 Agent に渡します。
5.  **出力**: 最終結果は、シーケンス内のすべての Agent からの出力を含むオブジェクトです。

```json 出力例
{
  "concept": "**製品説明: AIGNE - ノーコード生成AIアプリエンジン**\n\nAIGNE は、ユーザーがシームレスに作成できるように設計された最先端のノーコード生成AIアプリエンジンです...",
  "draft": "革新的なノーコード生成AIアプリエンジンである AIGNE で、創造の力を解き放ちましょう！業務を効率化したい中小企業でも、起業家でも...",
  "content": "革新的なノーコード生成AIアプリエンジンである AIGNE で、創造の力を解き放ちましょう！業務の効率化を目指す中小企業であろうと、起業家であろうと..."
}
```

## コマンドラインオプション

以下のパラメータで実行をカスタマイズできます。

| パラメータ                | 説明                                                                                             | デフォルト         |
| ------------------------- | ------------------------------------------------------------------------------------------------ | ------------------ |
| `--chat`                  | 対話型チャットモードで実行します。                                                               | 無効               |
| `--model <provider[:model]>` | 使用する AI モデルを指定します (例: `openai` または `openai:gpt-4o-mini`)。                     | `openai`           |
| `--temperature <value>`   | モデル生成の temperature を設定します。                                                          | プロバイダーのデフォルト |
| `--top-p <value>`         | top-p サンプリング値を設定します。                                                               | プロバイダーのデフォルト |
| `--presence-penalty <value>`| presence penalty の値を設定します。                                                              | プロバイダーのデフォルト |
| `--frequency-penalty <value>`| frequency penalty の値を設定します。                                                             | プロバイダーのデフォルト |
| `--log-level <level>`     | ログレベルを設定します (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`)。                               | `INFO`             |
| `--input, -i <input>`     | コマンドライン経由で直接入力を指定します。                                                       | なし               |

### 使用例

```sh icon=lucide:terminal
# 特定のモデルを使用してチャットモードで実行
npx @aigne/example-workflow-sequential --chat --model openai:gpt-4o-mini

# 詳細な出力のためにログレベルをデバッグに設定
npx @aigne/example-workflow-sequential --log-level DEBUG
```

## まとめ

この例では、AIGNE フレームワークを使用した逐次実行ワークフローの設定と実行方法を説明しました。一連の Agent を定義し、それらを `ProcessMode.sequential` を持つ `TeamAgent` に配置することで、複雑な多段階タスクのための堅牢で順序正しいパイプラインを構築できます。

Agent の連携に関するさらなる情報については、以下のトピックをご覧ください。

<x-cards data-columns="2">
  <x-card data-title="Team Agent" data-href="/developer-guide/agents/team-agent" data-icon="lucide:users">
    複数の Agent を逐次、並列、または自己修正モードで連携させる方法について詳しく学びます。
  </x-card>
  <x-card data-title="ワークフロー: 並行実行" data-href="/examples/workflow-concurrency" data-icon="lucide:git-fork">
    同時に実行できるタスクのパフォーマンスを最適化するために、Agent を並列実行する方法を発見します。
  </x-card>
</x-cards>