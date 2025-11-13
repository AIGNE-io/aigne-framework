# Nano Banana

このドキュメントでは、AIGNE フレームワークを使用して画像生成機能を備えたチャットボットを作成し、実行するためのステップバイステップガイドを提供します。コマンドラインから直接サンプルを実行する方法、さまざまな AI モデルプロバイダーに接続する方法、そしてその操作をデバッグする方法を学びます。

## 概要

「Nano Banana」のサンプルは、言語モデルと画像生成モデルを組み合わせることで、AIGNE フレームワークの実用的な応用例を示しています。AI Agent は、ユーザーのテキストプロンプトを解釈し、対応する画像を生成するように設定されています。このサンプルは、すぐに始められるように設計されており、ローカルにインストールすることなく実行できます。

以下の図は、ユーザーの入力から画像生成までの Nano Banana サンプルのワークフローを示しています。

```d2
direction: down

User: {
  shape: c4-person
}

CLI: {
  label: "CLI"
}

Nano-Banana-Example: {
  label: "Nano Banana サンプル\n(AI Agent)"
  shape: rectangle

  Language-Model: {
    label: "言語モデル\n(プロンプト解釈)"
    shape: rectangle
  }

  Image-Generation-Model: {
    label: "画像生成モデル\n(画像作成)"
    shape: rectangle
  }
}

AI-Model-Provider: {
  label: "AI モデルプロバイダー\n(例: OpenAI)"
  shape: cylinder
}

User -> CLI: "1. コマンドを実行\n(例: npx ... --input '...a cat')"
CLI -> Nano-Banana-Example: "2. テキストプロンプトで Agent を実行"
Nano-Banana-Example.Language-Model -> AI-Model-Provider: "3. プロンプトを処理"
AI-Model-Provider -> Nano-Banana-Example.Image-Generation-Model: "4. 処理されたプロンプトに基づき画像を生成"
Nano-Banana-Example -> User: "5. 生成された画像を返す"

```

## 前提条件

このサンプルを正常に実行するには、お使いのシステムで以下のコンポーネントが利用可能である必要があります。

*   **Node.js**: バージョン 20.0 以降。[nodejs.org](https://nodejs.org) からダウンロードしてください。
*   **npm**: Node Package Manager。Node.js のインストールに含まれています。
*   **AI モデルプロバイダー API キー**: AI サービスと対話するために必要です。[OpenAI](https://platform.openai.com/api-keys) などのプロバイダーからの API キーが必要です。

## クイックスタート (インストール不要)

このサンプルは、`npx` を使用してターミナルから直接実行できます。これにより、ローカルへのインストールは不要です。

### 単一の入力で実行

特定のテキストプロンプトに基づいて画像を生成するには、`--input` フラグを使用します。コマンドは一度実行され、結果を出力します。

```bash 単一の入力で実行 icon=lucide:terminal
npx -y @aigne/example-nano-banana --input 'Draw an image of a lovely cat'
```

### 対話型チャットモードで実行

継続的な対話セッションを行うには、`--chat` フラグを使用します。これにより、複数のプロンプトを送信できる対話モードが開始されます。

```bash 対話モードで実行 icon=lucide:terminal
npx -y @aigne/example-nano-banana --chat
```

## AI モデルへの接続

初回実行時、アプリケーションは AI モデルへの接続を促します。この接続を確立するには、いくつかの方法があります。

![ターミナルで、ユーザーに AI モデルの接続方法を選択するよう求められます。](/media/examples/nano-banana/run-example.png)

### 1. AIGNE Hub (公式) 経由で接続

これは新規ユーザーに推奨される方法です。

1.  最初のオプションを選択して、公式の AIGNE Hub 経由で接続します。
2.  デフォルトのウェブブラウザで AIGNE Hub の接続ページが開きます。
3.  画面の指示に従って接続を完了します。新規ユーザーには、試用目的で多数の無料トークンが付与されます。

![ウェブブラウザに AIGNE Hub の接続ページが表示されています。](/media/examples/images/connect-to-aigne-hub.png)

### 2. セルフホストの AIGNE Hub 経由で接続

あなたやあなたの組織がプライベートな AIGNE Hub インスタンスを運用している場合は、このオプションを使用してください。

1.  ターミナルで 2 番目のオプションを選択します。
2.  プロンプトが表示されたら、セルフホストの AIGNE Hub の URL を入力します。
3.  その後のプロンプトに従って接続を完了します。

セルフホストの AIGNE Hub をデプロイするには、[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) からインストールできます。

![ターミナルでセルフホストの AIGNE Hub の URL を求められています。](/media/examples/images/connect-to-self-hosted-aigne-hub.png)

### 3. サードパーティのモデルプロバイダー経由で接続

API キーを環境変数として設定することで、OpenAI などのサードパーティのモデルプロバイダーに直接接続できます。

例えば、OpenAI を使用するには、シェルで `OPENAI_API_KEY` 変数を設定します。

```bash OpenAI API キーを設定 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key-here"
```

環境変数を設定した後、再度実行コマンドを実行してください。他のプロバイダーの設定に関する詳細は、[モデル設定](./models-configuration.md) ガイドを参照してください。

## インストールとローカルでの実行

ソースコードを調査したり変更したりしたいユーザーのために、リポジトリのローカルコピーからサンプルを実行することができます。

### 1. リポジトリをクローンする

`git` を使用して AIGNE Framework のリポジトリをローカルマシンにクローンします。

```bash リポジトリをクローン icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

サンプルのディレクトリに移動し、`pnpm` を使用して必要な依存関係をインストールします。

```bash 依存関係をインストール icon=lucide:terminal
cd aigne-framework/examples/nano-banana
pnpm install
```

### 3. サンプルを実行する

プロジェクトで定義されている `start` スクリプトを実行して、アプリケーションを起動します。

```bash ローカルのサンプルを実行 icon=lucide:terminal
pnpm start
```

## デバッグ

AIGNE フレームワークには、Agent の実行を監視・分析するためのローカルウェブサーバーを起動するコマンドラインツール `aigne observe` が含まれています。

1.  **監視サーバーを起動する**: ターミナルで `aigne observe` コマンドを実行します。

    ![ターミナルで 'aigne observe' コマンドが実行されています。](/media/examples/images/aigne-observe-execute.png)

2.  **実行履歴を表示する**: コマンドは URL を出力します。ブラウザでこの URL を開くと、最近の Agent 実行が一覧表示される監視インターフェースにアクセスできます。

    ![AIGNE Observe のウェブインターフェースに、最近の Agent 実行のリストが表示されています。](/media/examples/images/aigne-observe-list.png)

3.  **実行詳細を調査する**: 実行をクリックすると、モデルやツールへの呼び出しを含む詳細なトレースが表示されます。このインターフェースは、デバッグ、パフォーマンス分析、Agent の動作理解に非常に役立ちます。

## まとめ

このガイドでは、AIGNE フレームワークを使用して画像生成チャットボットを実行するプロセスを詳述しました。`npx` でサンプルを実行する方法、AI モデルに接続する方法、ソースから実行する方法、そしてデバッグのために `aigne observe` ツールを利用する方法を学びました。

関連トピックに関する詳細については、以下のドキュメントを参照してください。

<x-cards data-columns="2">
  <x-card data-title="Image Agent" data-icon="lucide:image" data-href="/developer-guide/agents/image-agent">
    画像生成のための特定の設定について詳しく学びます。
  </x-card>
  <x-card data-title="AIGNE CLI" data-icon="lucide:terminal" data-href="https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md">
    AIGNE コマンドラインインターフェースの全機能を探ります。
  </x-card>
</x-cards>