# ワークフローの並行処理

AI ワークフローを高速化したいとお考えですか？このガイドでは、AIGNE フレームワークを使用して並行ワークフローを構築し、複数のタスクを並列で処理する方法を解説します。`TeamAgent` を設定して異なる分析を同時に実行し、その結果を効率的に統合する方法を学びます。

## 概要

多くの実世界のシナリオでは、複雑な問題はより小さく独立したサブタスクに分解できます。これらのタスクを順次処理する代わりに、並行して実行することで時間を節約できます。この例では、製品説明という単一の入力を、異なる Agent が複数の視点から分析する一般的な並行処理パターンを示します。それぞれの個別の出力は、最終的に包括的な結果に集約されます。

ワークフローは次のように構成されています：

```d2
direction: down

Input: {
  label: "入力\n(製品説明)"
  shape: oval
}

TeamAgent: {
  label: "並列処理 (TeamAgent)"
  shape: rectangle

  Feature-Extractor: {
    label: "特徴抽出器"
    shape: rectangle
  }

  Audience-Analyzer: {
    label: "オーディエンス分析器"
    shape: rectangle
  }
}

Aggregation: {
  label: "集約"
  shape: diamond
}

Output: {
  label: "出力\n({ features, audience })"
  shape: oval
}

Input -> TeamAgent.Feature-Extractor
Input -> TeamAgent.Audience-Analyzer
TeamAgent.Feature-Extractor -> Aggregation: "features"
TeamAgent.Audience-Analyzer -> Aggregation: "audience"
Aggregation -> Output
```

-   **入力**: ワークフローに製品説明が提供されます。
-   **並列処理**:
    -   `Feature Extractor` Agent が説明を分析し、主要な製品の特徴を特定します。
    -   `Audience Analyzer` Agent が同時に同じ説明を分析し、ターゲットオーディエンスを特定します。
-   **集約**: 両方の Agent からの出力（`features` と `audience`）が収集されます。
-   **出力**: 抽出された特徴とオーディエンス分析の両方を含む、単一の構造化されたオブジェクトが返されます。

この例は、単一の入力に対するワンショット実行モードと、対話形式の分析のためのインタラクティブチャットモードの両方をサポートしています。

## 前提条件

この例を実行する前に、お使いのシステムが以下の要件を満たしていることを確認してください：

-   [Node.js](https://nodejs.org) (バージョン 20.0 以上)。
-   [OpenAI API キー](https://platform.openai.com/api-keys)。

## クイックスタート

リポジトリをクローンすることなく、`npx` を使用してコマンドラインから直接この例を実行できます。

### 例の実行

ターミナルで以下のいずれかのコマンドを実行してください。

デフォルトのワンショットモードで実行する場合：
```bash npx command icon=lucide:terminal
npx -y @aigne/example-workflow-concurrency
```

インタラクティブなチャットセッションで実行する場合：
```bash npx command icon=lucide:terminal
npx -y @aigne/example-workflow-concurrency --chat
```

パイプライン経由で入力を提供する場合：
```bash npx command icon=lucide:terminal
echo "Analyze product: Smart home assistant with voice control and AI learning capabilities" | npx -y @aigne/example-workflow-concurrency
```

### AI モデルへの接続

初めてこの例を実行する際には、AI モデルプロバイダーへの接続を求められます。

![Connect to a model provider](/media/examples/workflow-concurrency/run-example.png)

接続にはいくつかのオプションがあります：

1.  **AIGNE Hub (公式)**: 新規ユーザーにおすすめのオプションです。すぐに始められる無料のトークンが提供されます。
2.  **AIGNE Hub (セルフホスト)**: 独自の AIGNE Hub インスタンスを実行しているユーザー向けです。
3.  **サードパーティのモデルプロバイダー**: 必要な API キーを環境変数として設定することで、OpenAI などのプロバイダーに直接接続できます。

例えば、OpenAI を直接使用する場合：
```bash Set OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```
環境変数を設定した後、再度 `npx` コマンドを実行してください。

## インストールとローカルセットアップ

開発目的の場合、リポジトリをクローンしてソースコードからこの例を実行できます。

### 1. リポジトリのクローン

```bash Clone the repository icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係のインストール

例のディレクトリに移動し、`pnpm` を使用して必要なパッケージをインストールします。

```bash Install dependencies icon=lucide:terminal
cd aigne-framework/examples/workflow-concurrency
pnpm install
```

### 3. ローカルでの例の実行

`pnpm start` コマンドを使用してスクリプトを実行します。

ワンショットモードで実行する場合：
```bash Run in one-shot mode icon=lucide:terminal
pnpm start
```

インタラクティブなチャットモードで実行するには、`--chat` フラグを追加します。`pnpm start` に渡す引数は `--` の後に記述する必要があることに注意してください。
```bash Run in chat mode icon=lucide:terminal
pnpm start -- --chat
```

パイプライン入力を使用する場合：
```bash Run with pipeline input icon=lucide:terminal
echo "Analyze product: Smart home assistant with voice control and AI learning capabilities" | pnpm start
```

## コードの実装

中心的なロジックは、並列実行用に設定された `TeamAgent` を使用して実装されています。2つの `AIAgent` インスタンスがチーム内のスキルとして定義されています。1つは特徴抽出用、もう1つはオーディエンス分析用です。

```typescript index.ts icon=logos:typescript
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// OpenAI モデルを初期化
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 製品の特徴を抽出する最初の Agent を定義
const featureExtractor = AIAgent.from({
  instructions: `\
You are a product analyst. Extract and summarize the key features of the product.\n\nProduct description:\n{{product}}`,
  outputKey: "features",
});

// ターゲットオーディエンスを分析する2番目の Agent を定義
const audienceAnalyzer = AIAgent.from({
  instructions: `\
You are a market researcher. Identify the target audience for the product.\n\nProduct description:\n{{product}}`,
  outputKey: "audience",
});

// AIGNE インスタンスを初期化
const aigne = new AIGNE({ model });

// 並列ワークフローを管理する TeamAgent を作成
const teamAgent = TeamAgent.from({
  skills: [featureExtractor, audienceAnalyzer],
  mode: ProcessMode.parallel, // 実行モードを並列に設定
});

// 製品説明を渡してチームを呼び出す
const result = await aigne.invoke(teamAgent, {
  product: "AIGNE is a No-code Generative AI Apps Engine",
});

console.log(result);

/* 期待される出力:
{
  features: "**Product Name:** AIGNE\n\n**Product Type:** No-code Generative AI Apps Engine\n\n...",
  audience: "**Small to Medium Enterprises (SMEs)**: \n   - Businesses that may not have extensive IT resources or budget for app development but are looking to leverage AI to enhance their operations or customer engagement.\n\n...",
}
*/
```

### 主要な概念

-   **`AIAgent`**: 特定の指示を持つ個々の AI 搭載ワーカーを表します。ここでは、`featureExtractor` と `audienceAnalyzer` が `AIAgent` のインスタンスです。
-   **`TeamAgent`**: 他の Agent（スキル）を統括する Agent です。それらを順次または並列に実行できます。
-   **`ProcessMode.parallel`**: `TeamAgent` のこの設定は、すべてのスキルを同時に実行するように指示します。`TeamAgent` は、すべての並列タスクが完了するのを待ってから、それらの出力を集約します。
-   **`outputKey`**: 各 `AIAgent` のこのプロパティは、その結果が最終的な出力オブジェクトに格納されるキーを定義します。

## コマンドラインオプション

この例のスクリプトは、その動作をカスタマイズするためにいくつかのコマンドライン引数を受け付けます。

| パラメータ                | 説明                                                                                             | デフォルト         |
| ------------------------- | ------------------------------------------------------------------------------------------------ | ------------------ |
| `--chat`                  | Agent を単一実行ではなく、インタラクティブなチャットモードで実行します。                         | 無効               |
| `--model <provider[:model]>` | 使用する AI モデルを指定します。例：`openai` または `openai:gpt-4o-mini`。                     | `openai`           |
| `--temperature <value>`   | モデル生成の温度を設定して、創造性を制御します。                                                 | プロバイダーのデフォルト |
| `--top-p <value>`         | top-p（核サンプリング）の値を設定します。                                                        | プロバイダーのデフォルト |
| `--presence-penalty <value>` | 存在ペナルティの値を設定して、トークンの繰り返しを抑制します。                                 | プロバイダーのデフォルト |
| `--frequency-penalty <value>` | 頻度ペナルティの値を設定して、頻繁なトークンの繰り返しを抑制します。                           | プロバイダーのデフォルト |
| `--log-level <level>`     | ログの詳細度を設定します。受け入れられる値は `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE` です。      | `INFO`             |
| `--input`, `-i <input>`   | 引数として直接入力を提供します。                                                                 | なし               |

#### 使用例

特定のモデルとログレベルを指定してチャットモードで実行する場合：
```bash Command example icon=lucide:terminal
pnpm start -- --chat --model openai:gpt-4o-mini --log-level DEBUG
```

## デバッグ

AIGNE 監視サーバーを使用して、Agent の実行を監視および分析できます。このツールは、トレースの検査、各ステップの詳細情報の表示、Agent のランタイム動作の理解を可能にするウェブベースのインターフェースを提供します。

まず、別のターミナルウィンドウで監視サーバーを起動します：
```bash Start observer icon=lucide:terminal
aigne observe
```

![Start observation server](/media/examples/images/aigne-observe-execute.png)

この例を実行した後、Web インターフェース（通常は `http://localhost:3333`）を開くと、最近の実行リストが表示され、並行ワークフローの詳細をドリルダウンして確認できます。

![View execution list](/media/examples/images/aigne-observe-list.png)