# AIGNE フレームワーク入門

AIGNE フレームワークへようこそ！このガイドは、最初の AI アプリケーションを 30 分以内に立ち上げて実行できるように設計されています。環境のセットアップ、必要なパッケージのインストール、そしてシンプルな AI Agent の作成について順を追って説明します。

このガイドは、AIGNE を自身のプロジェクトに統合したい開発者向けです。コードファーストで、コピー＆ペーストしてすぐに使えるサンプルに焦点を当て、できるだけ早く始められるようにします。

## 前提条件

始める前に、お使いのシステムに以下がインストールされていることを確認してください：

*   **Node.js**: AIGNE フレームワークには Node.js バージョン 20.0 以降が必要です。

ターミナルで次のコマンドを実行して、Node.js のバージョンを確認できます：

```bash
node -v
```

## 1. インストール

まず、新しいプロジェクトディレクトリを作成し、Node.js プロジェクトを初期化します：

```bash
mkdir aigne-quickstart
cd aigne-quickstart
npm init -y
```

次に、お好みのパッケージマネージャー（npm, yarn, または pnpm）を使用して、AIGNE コアパッケージと OpenAI モデルプロバイダーをインストールします。

<tabs>
<tab-item label="npm">

```bash
npm install @aigne/core @aigne/openai dotenv
```

</tab-item>
<tab-item label="yarn">

```bash
yarn add @aigne/core @aigne/openai dotenv
```

</tab-item>
<tab-item label="pnpm">

```bash
pnpm add @aigne/core @aigne/openai dotenv
```

</tab-item>
</tabs>

## 2. 最初の AI Agent のセットアップ

フレームワークをインストールしたら、最初の AI アプリケーションを作成しましょう。この例では OpenAI API を使用して Agent を動かすため、OpenAI API キーが必要になります。

### a. 環境変数の設定

API キーは環境変数を使用して管理するのがベストプラクティスです。プロジェクトのルートディレクトリに `.env` という名前のファイルを作成し、OpenAI API キーを追加します：

```bash
# .env
OPENAI_API_KEY="your_openai_api_key_here"
```

すでに `dotenv` パッケージをインストールしているので、この変数はアプリケーションの環境に読み込まれます。

### b. アプリケーションファイルの作成

`index.js` という名前のファイルを作成し、次のコードを追加します。このスクリプトは、フレームワークを初期化し、シンプルな Agent を定義し、プロンプトを送信します。

```javascript
// index.js
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import "dotenv/config";

// 1. AI モデルのインスタンスを作成
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// 2. 指示付きで AI Agent を作成
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant who is an expert in creative writing.",
});

// 3. AIGNE の実行エンジンを初期化
const aigne = new AIGNE({ model });

// 4. Agent を実行するための非同期関数を定義
async function main() {
  // AIGNE を使用して Agent を呼び出す
  const userAgent = await aigne.invoke(agent);

  // Agent にメッセージを送信し、レスポンスを取得
  const response = await userAgent.invoke(
    "Hello, can you help me write a short poem about the sunrise?",
  );
  
  console.log(response);
}

// 5. アプリケーションを実行
main();
```

### c. コードの解説

`index.js` ファイルをステップごとに見ていきましょう：

1.  **モデルの初期化**: 環境変数から API キーを渡して `OpenAIChatModel` のインスタンスを作成します。このオブジェクトは OpenAI API との通信を担当します。
2.  **Agent の作成**: `AIAgent` を定義します。Agent には `name` と `instructions` があり、AI モデルにどのように振る舞うべきかを伝えます。このケースでは、創作文の専門家である親切なアシスタントです。
3.  **エンジンの初期化**: `AIGNE` クラスは主要な実行エンジンです。`model` をパラメータとして受け取り、異なるコンポーネント間の通信を管理します。
4.  **Agent の呼び出し**: `aigne.invoke(agent)` を使用して、Agent が対話できるように準備します。その後、`userAgent.invoke(...)` がプロンプトを Agent に送信し、レスポンスを待ちます。
5.  **実行**: `main` 関数が呼び出され、プロセス全体が実行されます。

### d. アプリケーションの実行

ターミナルからファイルを実行します。ES モジュール構文を使用するには、`package.json` に `"type": "module"` が含まれていることを確認してください。

```bash
node index.js
```

コンソールに、AI Agent によって生成された日の出に関する創作詩が表示されるはずです。

## 中核となる概念の相互作用

この入門例は、AIGNE フレームワークの基本的なワークフローを示しています。ユーザーのプロンプトは AIGNE によって処理され、定義された Agent と基盤となる AI モデルを活用して最終的なレスポンスを生成します。

<d2>
direction: down

User-Prompt: {
  label: "ユーザープロンプト\n'詩を書いて…'"
  shape: rectangle
}

AIGNE-Engine: {
  label: "AIGNE"
  shape: rectangle
}

AIAgent: {
  label: "AIAgent\n(指示)"
  shape: rectangle
}

AI-Model: {
  label: "AI モデル\n(例: OpenAIChatModel)"
  shape: rectangle
}

OpenAI-API: {
  label: "外部 LLM API\n(例: OpenAI)"
  shape: cylinder
}

Final-Response: {
  label: "最終レスポンス\n(生成された詩)"
  shape: rectangle
}

User-Prompt -> AIGNE-Engine: "1. 入力"
AIAgent -> AIGNE-Engine: "2. と結合"
AIGNE-Engine -> AI-Model: "3. 結合されたプロンプトを渡す"
AI-Model -> OpenAI-API: "4. API コールを行う"
OpenAI-API -> AI-Model: "5. 結果を受信"
AI-Model -> AIGNE-Engine: "6. 結果を返す"
AIGNE-Engine -> Final-Response: "7. 出力"

</d2>