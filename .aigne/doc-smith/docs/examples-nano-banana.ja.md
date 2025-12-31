# Nano Banana

このガイドでは、画像を生成できるチャットボットを構築して実行する方法を説明します。これらの手順に従うことで、事前に構築された AIGNE のサンプルを実行し、AI モデルに接続し、フレームワークの可観測性ツールを使用してその動作を検査する方法を学びます。

## 前提条件

続行する前に、以下の要件が満たされていることを確認してください。

*   **Node.js:** バージョン 20.0 以上がインストールされている必要があります。[nodejs.org](https://nodejs.org) からダウンロードできます。
*   **OpenAI API キー:** 画像生成モデルと対話するには、[OpenAI](https://platform.openai.com/api-keys) の API キーが必要です。

## クイックスタート

`npx` を使用すると、ローカルにインストールすることなく、このサンプルを直接実行できます。

### サンプルの実行

ターミナルで以下のコマンドを実行し、単一の入力でチャットボットを実行します。このコマンドはサンプルパッケージをダウンロードして実行します。

```bash 単一の入力で実行 icon=lucide:terminal
npx -y @aigne/example-nano-banana --input 'Draw an image of a lovely cat'
```

チャットボットと対話できるインタラクティブセッションを開始するには、`--interactive` フラグを使用します。

```bash インタラクティブモードで実行 icon=lucide:terminal
npx -y @aigne/example-nano-banana --interactive
```

### AI モデルへの接続

初回実行時、アプリケーションは AI モデルが設定されていないことを検出し、接続を促すプロンプトを表示します。

![AI モデル接続のための初期設定プロンプト。](../../../examples/nano-banana/run-example.png)

AI モデルに接続するには、主に 3 つのオプションがあります。

#### 1. 公式 AIGNE Hub 経由で接続する (推奨)

これが最も簡単な方法です。このオプションを選択すると、Web ブラウザが開き、公式 AIGNE Hub での認証プロセスが案内されます。新規ユーザーは無料のトークン割り当てを受け取り、すぐに開始できます。

![AIGNE Hub 認証画面。](../../../examples/images/connect-to-aigne-hub.png)

#### 2. セルフホストの AIGNE Hub 経由で接続する

独自の AIGNE Hub インスタンスを運用している場合は、このオプションを選択します。接続を完了するために、セルフホストされた Hub の URL を入力するよう求められます。[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) から独自の AIGNE Hub をデプロイできます。

![セルフホストの AIGNE Hub の URL を入力するプロンプト。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 3. サードパーティのモデルプロバイダー経由で接続する

必要な API キーを環境変数として設定することで、OpenAI などのサードパーティプロバイダーに直接接続できます。例えば、OpenAI を使用するには、ターミナルで `OPENAI_API_KEY` 変数を設定します。

```bash OpenAI API キーを設定 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key-here"
```

環境変数を設定した後、再度 `npx` コマンドを実行します。さまざまなモデルプロバイダーでサポートされている変数の完全なリストについては、ソースリポジトリ内のサンプル環境ファイルを参照してください。

### 可観測性 UI を使用したデバッグ

AIGNE Framework には、Agent の監視とデバッグを支援する組み込みの可観測性ツールが含まれています。`aigne observe` コマンドは、Agent の実行トレースの詳細なビューを提供するローカル Web サーバーを起動します。

まず、ターミナルで以下のコマンドを実行して、観測サーバーを起動します。

```bash 可観測性サーバーを起動 icon=lucide:terminal
aigne observe
```

![aigne observe コマンドがサーバーを正常に起動したことを示すターミナル出力。](../../../examples/images/aigne-observe-execute.png)

サーバーが実行されると、提供された URL (通常は `http://localhost:7893`) をブラウザで開き、最近の Agent 実行のリストを表示できます。このインターフェースでは、各トレースの入力、出力、レイテンシ、トークン使用量を検査でき、デバッグと最適化のための重要な洞察を得ることができます。

![Agent 実行トレースのリストを表示する AIGNE 可観測性 UI。](../../../examples/images/aigne-observe-list.png)

## ローカルでのインストールと実行

開発目的の場合、リポジトリをクローンしてサンプルをローカルで実行することをお勧めします。

### 1. リポジトリのクローン

GitHub から公式の AIGNE Framework リポジトリをクローンします。

```bash リポジトリをクローン icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係のインストール

サンプルのディレクトリに移動し、`pnpm` を使用して必要な依存関係をインストールします。

```bash 依存関係をインストール icon=lucide:terminal
cd aigne-framework/examples/nano-banana
pnpm install
```

### 3. サンプルの実行

インストールが完了したら、プロジェクトの `package.json` で定義されている `start` スクリプトを使用してサンプルを実行できます。

```bash ローカルサンプルを実行 icon=lucide:terminal
pnpm start
```

## まとめ

このドキュメントでは、画像生成機能を備えた AI チャットボットを実証する「Nano Banana」サンプルの実行に関するステップバイステップガイドを提供しました。`npx` を使用して直接サンプルを実行する方法、さまざまな AI モデルプロバイダーに接続する方法、そして `aigne observe` コマンドを使用して Agent の動作をデバッグする方法を学びました。

より高度なユースケースやフレームワークの機能について深く理解するには、以下のセクションを参照してください。

<x-cards data-columns="2">
  <x-card data-title="Image Agent" data-icon="lucide:image" data-href="/developer-guide/agents/image-agent">
    画像生成のための Agent の設定と使用方法を学びます。
  </x-card>
  <x-card data-title="AI Agent" data-icon="lucide:bot" data-href="/developer-guide/agents/ai-agent">
    言語モデルと対話するための主要な Agent について探ります。
  </x-card>
</x-cards>
