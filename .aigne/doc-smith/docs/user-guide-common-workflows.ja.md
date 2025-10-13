このガイドでは、AIGNE フレームワークをインストールし、わずか数分で最初の AI アプリケーションを実行するために必要なすべてを説明します。環境のセットアップ、必要なパッケージのインストール、そしてシンプルかつ強力なマルチ Agent ワークフローの構築手順を順を追って説明します。

## 1. 前提条件

開始する前に、お使いのシステムに Node.js がインストールされていることを確認してください。AIGNE フレームワークが正しく機能するには、最新バージョンの Node.js が必要です。

*   **Node.js**: バージョン 20.0 以上

ターミナルで次のコマンドを実行すると、Node.js のバージョンを確認できます。

```bash
node -v
```

Node.js をインストールしていない、またはアップグレードが必要な場合は、`nvm` のようなバージョン管理ツールを使用するか、公式の [Node.js ウェブサイト](https://nodejs.org/) からダウンロードすることをお勧めします。

## 2. インストール

お好みのパッケージマネージャー (`npm`、`yarn`、または `pnpm`) を使用して、AIGNE フレームワークをプロジェクトに追加できます。

### npm を使用する場合

```bash
npm install @aigne/core
```

### yarn を使用する場合

```bash
yarn add @aigne/core
```

### pnpm を使用する場合

```bash
pnpm add @aigne/core
```

このコマンドは、AI Agent とワークフローを作成するための基本的な構成要素を提供するコアパッケージをインストールします。

## 3. 初めての AIGNE アプリケーション

「ハンドオフ」ワークフローパターンを実証する簡単なアプリケーションを構築してみましょう。この例では、`AgentA` が最初のプロンプトを受け取り、その後、異なる個性を持つ `AgentB` に会話を引き継ぎます。

この例では、Agent を動かすためのモデルプロバイダーも必要です。このガイドでは OpenAI を使用します。

まず、OpenAI モデルパッケージをインストールします。

```bash
npm install @aigne/openai
```

次に、新しい TypeScript ファイル (例: `index.ts`) を作成し、次のコードを追加します。

```ts
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 環境変数を読み込むため
import * as dotenv from "dotenv";
dotenv.config();

// 1. AI モデルの設定
// .env ファイルに OPENAI_API_KEY が設定されていることを確認してください
const { OPENAI_API_KEY } = process.env;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in the environment variables.");
}

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 「ハンドオフ」スキルを定義
// この関数は、AgentA から AgentB へ制御を移すための条件を定義します。
function transferToB() {
  return agentB;
}

// 3. Agent の定義
const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent. When the user asks to talk to agent b, use the transferToB skill.",
  outputKey: "A",
  skills: [transferToB], // ハンドオフスキルをアタッチ
  inputKey: "message",
});

const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
  inputKey: "message",
});

// 4. AIGNE フレームワークの初期化
const aigne = new AIGNE({ model });

// アプリケーションを実行するメイン関数
async function main() {
  // 5. AgentA とのセッションを開始
  const userAgent = aigne.invoke(agentA);

  // 6. 最初の対話: ハンドオフをトリガー
  console.log("User: transfer to agent b");
  const result1 = await userAgent.invoke({ message: "transfer to agent b" });
  console.log("Agent:", result1);
  // 期待される出力:
  // {
  //   B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?",
  // }

  // 7. 2回目の対話: AgentB とチャット
  // これでセッションは恒久的に AgentB とのものになります
  console.log("\nUser: It's a beautiful day");
  const result2 = await userAgent.invoke({ message: "It's a beautiful day" });
  console.log("Agent:", result2);
  // 期待される出力:
  // {
  //   B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy.  ",
  // }
}

main().catch(console.error);
```

### コードの解説

1.  **AI モデルの設定**: `OpenAIChatModel` をインポートし、API キーで初期化します。API キーのような機密情報は、環境変数から読み込むのがベストプラクティスです。
2.  **「ハンドオフ」スキルの定義**: `transferToB` 関数は *スキル* です。実行されると `agentB` の定義を返し、AIGNE にその Agent へ制御を移すべきであることを伝えます。
3.  **Agent の定義**: `AIAgent.from()` を使用して、2つの異なる Agent を作成します。
    *   `agentA` は最初の接点です。その `skills` 配列には `transferToB` 関数が含まれており、ハンドオフを実行できます。
    *   `agentB` は特定の個性を持っています—俳句でのみ話します。
4.  **AIGNE フレームワークの初期化**: `AIGNE` のインスタンスを作成し、Agent を動かすために使用するモデルを渡します。
5.  **セッションの開始**: `aigne.invoke(agentA)` は、`agentA` から始まるステートフルなユーザーセッションを作成します。
6.  **ハンドオフのトリガー**: 最初のメッセージ「transfer to agent b」は `agentA` の指示と一致し、`transferToB` スキルが実行されます。これにより、会話は恒久的に `agentB` に引き継がれます。出力キーは `B` であり、応答が `agentB` から来たことを示しています。
7.  **AgentB とのチャット**: 2番目のメッセージは同じ `userAgent` セッションに送信されます。ハンドオフは既に発生しているため、`agentB` がメッセージを受け取り、指示に従って俳句で応答します。

## 4. コードの実行

この例を実行するには、次の手順に従ってください。

1.  **`.env` ファイルの作成**：プロジェクトのルートディレクトリに、OpenAI API キーを保存するための `.env` ファイルを作成します。
    ```
    OPENAI_API_KEY="your_openai_api_key_here"
    ```

2.  **`dotenv` と `ts-node` のインストール**：環境変数を管理し、TypeScript を直接実行するために、`dotenv` と `ts-node` をインストールします。
    ```bash
    npm install dotenv ts-node typescript
    ```

3.  **スクリプトの実行**：`ts-node` を使用してスクリプトを実行します。
    ```bash
    npx ts-node index.ts
    ```

Agent が対話し、ハンドオフを実行する様子がコンソールに出力されます。

## 次のステップ

おめでとうございます！これで、最初の AIGNE アプリケーションの構築と実行に成功しました。

ここから、フレームワークのより高度な機能を探求できます。

*   **主要な機能を発見する**: モジュール設計、マルチモデルサポート、コード実行機能について学びます。
*   **ワークフローパターンを探る**: Sequential、Router、Concurrency のような他の強力なパターンを深く掘り下げ、より洗練されたアプリケーションを構築します。
*   **API リファレンスを参照する**: 利用可能なすべてのクラス、メソッド、設定に関する詳細な情報を取得します。