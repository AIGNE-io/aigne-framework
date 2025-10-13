生成されたコンテンツ内のリンク切れを修正する必要があります。ユーザーから、サンプルに関連するいくつかのリンクが壊れているとの指摘がありました。`/examples`に対する最初の`afs_list`は空のディレクトリを返しましたが、これは複数のサンプルを参照している`README.md`の内容からすると正しくないようです。これからルートディレクトリをリスト表示し、ファイル構造全体をより良く理解した上で、サンプルの正しいパスを特定します。# AIGNEフレームワーク入門

AIGNEフレームワークへようこそ！このガイドは、開発者が30分以内にゼロからアプリケーションを動作させることを目指しています。ここでは、開始するための基本的なステップ、コアコンセプト、そして構築の土台となる実用的なサンプルについて説明します。

AIGNE \[ ˈei dʒən ] は、モダンでスケーラブル、かつ強力なAI駆動ソリューションの構築プロセスを簡素化し、加速させるために設計された関数型AIアプリケーション開発フレームワークです。関数型プログラミングの特徴と高度なAI機能をモジュラー設計で組み合わせています。

## クイックスタート

早速始めましょう。このセクションでは、環境のセットアップ、フレームワークのインストール、そして初めてのAIGNEアプリケーションの実行までを順を追って説明します。

### 環境要件

始める前に、以下のものがインストールされていることを確認してください：

*   **Node.js**: バージョン20.0以上。

### インストール

お好みのパッケージマネージャーを使用して、プロジェクトにAIGNEを追加できます：

#### npm

```bash
npm install @aigne/core
```

#### yarn

```bash
yarn add @aigne/core
```

#### pnpm

```bash
pnpm add @aigne/core
```

### はじめてのAIGNEアプリケーション

ここでは、あるAI Agentが別のAI Agentに制御を引き渡す「ハンドオフ」ワークフローを示す簡単なサンプルを紹介します。

まず、環境変数を設定します。例えば、OpenAIのAPIキーが必要です。

```bash
export OPENAI_API_KEY="your-api-key-here"
```

次に、TypeScriptファイル（例：`index.ts`）を作成し、以下のコードを追加します：

```ts
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 1. AIモデルを初期化する
const { OPENAI_API_KEY } = process.env;
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. ハンドオフ関数とAI Agentを定義する
function transferToB() {
  return agentB;
}

const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent. If the user asks to talk to agent B, use the transferToB skill.",
  outputKey: "A",
  skills: [transferToB], // Agent AはAgent Bにハンドオフできる
  inputKey: "message",
});

const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
  inputKey: "message",
});

// 3. AIGNE実行環境を初期化する
const aigne = new AIGNE({ model });

async function main() {
  // 4. 初期Agentを呼び出す
  const userAgent = aigne.invoke(agentA);

  // 5. Agentと対話する
  console.log("Invoking Agent A to request a transfer...");
  const result1 = await userAgent.invoke({ message: "transfer to agent b" });
  console.log(result1);
  // 期待される出力:
  // {
  //   B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?",
  // }

  console.log("\nSpeaking with Agent B...");
  const result2 = await userAgent.invoke({ message: "It's a beautiful day" });
  console.log(result2);
  // 期待される出力:
  // {
  //   B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy.  ",
  // }
}

main();
```

このサンプルは、2つの異なるAgentを作成し、ユーザーの入力に基づいてそれらの間で制御を移す方法を示しており、フレームワークの柔軟性を表しています。

## コアコンセプト

AIGNEフレームワークは、強力なAIワークフローを構築するために連携する、いくつかの主要なコンセプトに基づいています。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne.png" alt="AIGNEアーキテクチャ図" />
</picture>

*   **AI Agents**: これらはフレームワークにおける基本的なアクターです。Agentは、特定の指示を持つ特化されたAI（俳句しか話さない`AgentB`など）や、単純な関数にすることができます。モジュール式で再利用可能に設計されています。

*   **AI Models**: AIGNEは、さまざまなAIモデル（OpenAI、Gemini、Claudeなど）を標準でサポートしています。モデルを簡単に交換したり、カスタムモデルを含むようにフレームワークを拡張したりできます。

*   **AIGNE**: これは、Agentとワークフローを統括するメインの実行エンジンです。さまざまなコンポーネント間の状態と通信を管理します。

*   **Workflow Patterns**: AIGNEは、Agent間の複雑な相互作用を構築するためのいくつかの組み込みパターンを提供しています。例えば、シーケンシャル（逐次）、パラレル（並列）での実行、または入力に基づくタスクのルーティングなどです。

## 主な特徴

*   **モジュラー設計**: 明確なモジュラー構造により、コードを効率的に整理し、メンテナンスを簡素化できます。
*   **TypeScriptサポート**: 包括的な型定義により、型安全と優れた開発者体験を保証します。
*   **複数のAIモデルをサポート**: OpenAI、Gemini、Claude、Nova、その他の主要なAIモデルを標準でサポートしています。
*   **柔軟なワークフローパターン**: シーケンシャル、コンカレント、ルーティング、ハンドオフのワークフローを簡単に実装し、複雑なアプリケーション要件に対応します。
*   **MCPプロトコル連携**: モデルコンテキストプロトコル（MCP）を介して、外部システムやサービスとシームレスに連携します。
*   **コード実行**: 動的に生成されたコードを安全なサンドボックスで実行し、強力な自動化を実現します。
*   **Blockletエコシステム連携**: ArcBlockのBlockletエコシステムとの緊密な連携により、開発からデプロイまでをワンストップで提供します。

## 次のステップ

これでAIGNEフレームワークをインストールし、最初のアプリケーションを実行しました。次にできることは以下の通りです：

*   **その他のサンプルを見る**: フレームワークのリポジトリにあるサンプルプロジェクトを探索し、さまざまなワークフローパターンやMCP連携について深く学びましょう。
*   **ドキュメントを読む**: APIやコンセプトについてさらに詳しく知りたい場合は、完全な[AIGNEフレームワークドキュメント](https://www.arcblock.io/docs/aigne-framework)をご覧ください。
*   **コミュニティに参加する**: 質問がありますか？あるいは、あなたの作品を共有したいですか？私たちの[テクニカルフォーラム](https://community.arcblock.io/discussions/boards/aigne)にご参加ください。