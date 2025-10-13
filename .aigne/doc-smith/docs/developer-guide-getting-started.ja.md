# はじめに

このガイドでは、AIGNE フレームワークをインストールし、わずか数分で実行するために必要なすべてを提供します。最後まで読み終える頃には、最初の AI 搭載 Agent を構築し、実行できるようになります。

## AIGNE フレームワークとは？

AIGNE フレームワーク \[ˈei dʒən] は、最新の AI 搭載アプリケーションの構築プロセスを簡素化し、加速させるために設計された関数型 AI アプリケーション開発フレームワークです。関数型プログラミング、強力な AI 機能、モジュール設計を組み合わせることで、スケーラブルで保守性の高いソリューションの作成を支援します。

**主な特徴：**

*   **モジュール設計**: 開発効率を向上させ、メンテナンスを簡素化する明確な構造。
*   **TypeScript サポート**: より良く、より安全な開発体験のための包括的な型定義。
*   **複数の AI モデルのサポート**: OpenAI、Gemini、Claude などの主要な AI モデルを組み込みでサポートし、容易に拡張可能。
*   **柔軟なワークフローパターン**: シーケンシャル、コンカレント、ルーティング、ハンドオフのワークフローパターンで複雑な操作を簡素化。
*   **MCP プロトコルとの統合**: モデルコンテキストプロトコルを通じて外部システムとシームレスに統合。

## 1. 前提条件

始める前に、お使いのシステムに Node.js がインストールされていることを確認してください。

*   **Node.js**: バージョン 20.0 以降。

ターミナルで次のコマンドを実行して、Node.js のバージョンを確認できます：

```bash
node -v
```

## 2. インストール

お好みのパッケージマネージャーを使用して、コア AIGNE パッケージをインストールできます。

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

## 3. 初めての AIGNE アプリケーション

役立つアシスタント Agent を使って、シンプルな「Hello, World!」スタイルのアプリケーションを作成しましょう。

#### ステップ 1: プロジェクトファイルの設定

`index.ts` という名前の新しいファイルを作成します。

#### ステップ 2: コードの追加

この例では、AIGNE フレームワークの 3 つのコアコンポーネントである**モデル**、**Agent**、そして **AIGNE** を示します。

*   **モデル**: Agent にパワーを供給する AI モデルのインスタンス（例：`OpenAIChatModel`）。
*   **Agent**: AI の個性と指示の定義（例：`AIAgent`）。
*   **AIGNE**: Agent を実行し、通信を処理するメインエグゼキューター。

次のコードをコピーして `index.ts` ファイルに貼り付けます：

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

async function main() {
  // 1. AI モデルインスタンスを作成
  // これにより、AI プロバイダー（例：OpenAI）に接続します。
  // API キーが環境変数として設定されていることを確認してください。
  const model = new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
  });

  // 2. AI Agent を作成
  // これにより、Agent のアイデンティティと目的を定義します。
  const agent = AIAgent.from({
    name: "Assistant",
    instructions: "You are a helpful assistant.",
  });

  // 3. AIGNE を初期化
  // これはすべてを統合するメインの実行エンジンです。
  const aigne = new AIGNE({ model });

  // 4. Agent との対話セッションを開始
  const userAgent = aigne.invoke(agent);

  // 5. Agent にメッセージを送信し、応答を取得
  const response = await userAgent.invoke(
    "Hello, can you help me write a short article?",
  );

  console.log(response);
}

main();
```

#### ステップ 3: API キーの設定

スクリプトを実行する前に、OpenAI API キーを提供する必要があります。ターミナルで環境変数を設定することでこれを行うことができます。

```bash
export OPENAI_API_KEY="your-api-key-here"
```

#### ステップ 4: アプリケーションの実行

`ts-node` のような TypeScript ランナーを使用してファイルを実行します。

```bash
npx ts-node index.ts
```

コンソールにアシスタント Agent からの役立つ応答が出力されるはずです！

## 仕組み：簡単な概要

AIGNE フレームワークは、モジュール式で拡張可能に設計されています。`AIGNE` は、ユーザー、Agent、AI モデル間のインタラクションをオーケストレーションします。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne.png" alt="AIGNE アーキテクチャ図" />
</picture>

## 次のステップ

これで、最初の AIGNE アプリケーションの構築と実行に成功しました。 अब आप और उन्नत सुविधाओं का पता लगाने के लिए तैयार हैं।

*   **コアコンセプトを深く理解する**: [AIGNE、Agent、モデル](./developer-guide-core-concepts.md) について深く理解します。
*   **Agent の種類を探る**: [Agent の種類](./developer-guide-agents.md) セクションで構築できるさまざまな種類の特化された Agent について学びます。
*   **ワークフローを簡素化する**: [シーケンシャルおよびパラレル](./developer-guide-agents-team-agent.md) 実行などのパターンをレビューして、複雑なマルチ Agent タスクをどのようにオーケストレーションするかを発見します。
*   **完全なドキュメントを閲覧する**: 詳細なガイドと API リファレンスについては、完全な [AIGNE フレームワークドキュメント](https://www.arcblock.io/docs/aigne-framework) をご覧ください。