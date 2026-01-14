# はじめに

このガイドでは、AIGNE フレームワークを使用して開発環境をセットアップし、最初の AI Agent を実行するために必要な手順を説明します。このプロセスは30分以内に完了するように設計されており、フレームワークの基本的なワークフローを実践的かつハンズオンで紹介します。

システムの前提条件、必要なパッケージのインストール、そして基本的な AI Agent の定義、設定、実行方法を示す、コピー＆ペーストですぐに使える完全な例について説明します。

## 前提条件

先に進む前に、お使いの開発環境が以下の要件を満たしていることを確認してください：

*   **Node.js**: バージョン 20.0 以上が必要です。

お使いの Node.js のバージョンは、ターミナルで次のコマンドを実行して確認できます：

```bash
node -v
```

## インストール

まず、AIGNE のコアパッケージとモデルプロバイダーパッケージをインストールする必要があります。このガイドでは、公式の OpenAI モデルプロバイダーを使用します。

お好みのパッケージマネージャーを使用して、必要なパッケージをインストールしてください：

<x-cards data-columns="3">
  <x-card data-title="npm" data-icon="logos:npm-icon">
    ```bash
    npm install @aigne/core @aigne/openai
    ```
  </x-card>
  <x-card data-title="yarn" data-icon="logos:yarn">
    ```bash
    yarn add @aigne/core @aigne/openai
    ```
  </x-card>
  <x-card data-title="pnpm" data-icon="logos:pnpm">
    ```bash
    pnpm add @aigne/core @aigne/openai
    ```
  </x-card>
</x-cards>

さらに、OpenAI API キーが必要です。それを `OPENAI_API_KEY` という名前の環境変数として設定してください。

```bash title=".env"
OPENAI_API_KEY="sk-..."
```

## クイックスタートの例

この例では、シンプルな「アシスタント」Agent を作成して実行するまでの完全なプロセスを示します。

1.  `index.ts` という名前で新しい TypeScript ファイルを作成します。
2.  次のコードをコピーしてファイルに貼り付けます。

```typescript index.ts icon=logos:typescript-icon
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 1. AI モデルのインスタンス化
// これにより、指定されたモデルを使用して OpenAI API への接続が作成されます。
// API キーは OPENAI_API_KEY 環境変数から読み取られます。
const model = new OpenAIChatModel({
  model: "gpt-4o-mini",
});

// 2. AI Agent の定義
// Agent は作業の単位です。この AIAgent は、
// その人格とタスクを定義する指示で設定されます。
const assistantAgent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful and friendly assistant.",
});

// 3. AIGNE のインスタンス化
// AIGNE クラスは、Agent を管理・実行する中心的なオーケストレーターです。
// Agent が使用するモデルで設定されます。
const aigne = new AIGNE({ model });

async function main() {
  // 4. Agent の呼び出し
  // invoke メソッドは、与えられた入力で Agent を実行します。
  // フレームワークがモデルとのインタラクションを処理します。
  const response = await aigne.invoke(
    assistantAgent,
    "Why is the sky blue?"
  );

  // 5. レスポンスの出力
  console.log(response);
}

main();
```

### 例の実行

ターミナルからスクリプトを実行します。TypeScript を使用している場合は、`ts-node` のようなツールを使用できます。

```bash
npx ts-node index.ts
```

### 期待される出力

出力は、質問に対する Agent の応答が JSON オブジェクト形式で返されます。`message` フィールドの内容は、AI モデルによって生成されるため、毎回異なります。

```json
{
  "message": "The sky appears blue because of a phenomenon called Rayleigh scattering..."
}
```

## コードの解説

この例は、AIGNE フレームワークのコアワークフローを表す4つの主要なステップで構成されています。

1.  **モデルの初期化**: `OpenAIChatModel` のインスタンスが作成されます。このオブジェクトは、指定された OpenAI モデル（例：`gpt-4o-mini`）への直接のインターフェースとして機能します。認証には API キーが必要で、これは `OPENAI_API_KEY` 環境変数から自動的に取得されます。

2.  **Agent の定義**: 静的な `from` メソッドを使用して `AIAgent` が定義されます。これはフレームワークにおける基本的な作業単位です。その動作は `instructions` プロパティによって定義され、これはシステムプロンプトとして機能し、AI モデルの応答を誘導します。

3.  **AIGNE のインスタンス化**: `AIGNE` クラスがインスタンス化されます。これはすべての Agent の実行エンジンおよびオーケストレーターとして機能します。コンストラクタに `model` インスタンスを渡すことで、この AIGNE インスタンスによって管理されるすべての Agent のデフォルトモデルを設定します。

4.  **Agent の呼び出し**: `aigne.invoke()` メソッドが呼び出され、`assistantAgent` を実行します。最初の引数は実行する Agent、2番目の引数は入力メッセージです。フレームワークは、プロンプトと指示をモデルに送信し、応答を受信し、それを構造化された出力として返すという、リクエストの完全なライフサイクルを管理します。

このシンプルな例は、モデル、Agent、および実行エンジンを設定・構成して強力な AI 駆動のアプリケーションを構築するという、フレームワークのモジュール性と宣言的な性質を示しています。

## まとめ

このガイドでは、環境のセットアップ、必要な AIGNE パッケージのインストール、そして機能する AI Agent の構築と実行を成功させました。モデルの定義、特定の指示を持つ Agent の作成、そして AIGNE を使用してユーザープロンプトでそれを呼び出すという基本的なワークフローを学びました。

この基礎をもとに、より高度なトピックを探求する準備ができました。

*   フレームワークの基本的な構成要素をより詳細に理解するには、[コアコンセプト](./developer-guide-core-concepts.md) のドキュメントに進んでください。
*   さまざまな種類の特化された Agent とそのユースケースについて学ぶには、[Agent の種類](./developer-guide-agents.md) のセクションを参照してください。