このドキュメントでは、AIGNE Framework を使用して Agent ベースのチャットボットを作成し、実行するための包括的なガイドを提供します。インストールせずにチャットボットを即座に実行し、さまざまな AI モデルプロバイダーに接続し、ローカル開発用にセットアップする方法を学びます。この例では、単一応答 (ワンショット) モードと連続会話 (インタラクティブ) モードの両方をサポートしています。

## 概要

この例では、[AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) と [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md) の機能を、機能的なチャットボットを構築することで示します。Agent は、主に 2 つのモードで操作できます。

*   **ワンショットモード**: チャットボットは単一の入力を処理し、終了する前に単一の応答を提供します。これは、直接的な質問やコマンドラインのパイピングに最適です。
*   **インタラクティブモード**: チャットボットは、ユーザーがセッションを終了するまでターンの間でコンテキストを維持しながら、連続的な会話を行います。

## 前提条件

進める前に、お使いの環境が次の要件を満たしていることを確認してください。

*   **Node.js**: バージョン 20.0 以上。
*   **npm**: Node.js のインストールに含まれています。
*   **AI モデルへのアクセス**: OpenAI のようなプロバイダーからの API キーが必要です。または、AIGNE Hub に接続することもできます。

## クイックスタート (インストール不要)

`npx` を使用して、ローカルでのインストール手順なしで、ターミナルから直接チャットボットの例を実行できます。

### チャットボットの実行

チャットボットは、ニーズに合わせてさまざまなモードで実行できます。

*   **ワンショットモード (デフォルト)**: 単一の質問と回答用。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-chat-bot
    ```

*   **インタラクティブチャットモード**: 連続的な会話を開始する場合。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-chat-bot --chat
    ```

*   **パイプライン入力**: ワンショットモードでチャットボットに直接入力をパイプできます。

    ```bash icon=lucide:terminal
    echo "Tell me about the AIGNE Framework" | npx -y @aigne/example-chat-bot
    ```

### AI モデルへの接続

初回実行時に、CLI は AI モデルサービスへの接続を促します。いくつかのオプションが利用可能です。
```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

Connection-Options: {
  label: "接続オプション"
  shape: rectangle
  grid-columns: 3

  AIGNE-Hub-Official: {
    label: "AIGNE Hub\n(公式)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  AIGNE-Hub-Self-Hosted: {
    label: "AIGNE Hub\n(セルフホスト)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Third-Party-Provider: {
    label: "サードパーティプロバイダー\n(例: OpenAI)"
    shape: rectangle
  }
}

Blocklet-Store: {
  label: "Blocklet Store"
  icon: "https://store.blocklet.dev/assets/z8ia29UsENBg6tLZUKi2HABj38Cw1LmHZocbQ/logo.png"
}

User -> AIGNE-CLI: "1. チャットボットを実行"
AIGNE-CLI -> User: "2. AI モデル接続のプロンプト"
User -> Connection-Options: "3. オプションを選択"

Connection-Options.AIGNE-Hub-Official -> AIGNE-CLI: "ブラウザ認証経由で接続"
Connection-Options.AIGNE-Hub-Self-Hosted -> AIGNE-CLI: "サービス URL 経由で接続"
Connection-Options.AIGNE-Hub-Self-Hosted <- Blocklet-Store: "からデプロイ"
Connection-Options.Third-Party-Provider -> AIGNE-CLI: "環境変数経由で接続"
```
1.  **AIGNE Hub (公式) 経由で接続**
    これは新規ユーザーに推奨される方法です。このオプションを選択すると、Web ブラウザが公式の AIGNE Hub に開きます。画面の指示に従って接続してください。新規ユーザーは、開始するための無料トークン残高を自動的に受け取ります。

2.  **AIGNE Hub (セルフホスト) 経由で接続**
    独自の AIGNE Hub インスタンスを運用している場合は、このオプションを選択し、サービスの URL を入力して接続を完了します。[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) からセルフホストの AIGNE Hub をデプロイできます。

3.  **サードパーティモデルプロバイダー経由で接続**
    必要な環境変数を設定することで、OpenAI などのプロバイダーに直接接続できます。OpenAI の場合、API キーを次のように設定します。

    ```bash icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key"
    ```

    環境変数を設定した後、再度チャットボットコマンドを実行してください。他のプロバイダー (例: DeepSeek, Google Gemini) でサポートされている変数の一覧については、リポジトリ内の `.env.local.example` ファイルを参照してください。

## ローカルでのインストールとセットアップ

開発やカスタマイズのために、リポジトリをクローンしてローカルマシンからサンプルを実行できます。

### 1. AIGNE CLI のインストール

まず、AIGNE コマンドラインインターフェースをグローバルにインストールします。

```bash icon=lucide:terminal
npm install -g @aigne/cli
```

### 2. リポジトリのクローン

AIGNE Framework リポジトリをクローンし、チャットボットの例のディレクトリに移動します。

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
cd aigne-framework/examples/chat-bot
```

### 3. ローカルでサンプルを実行

`chat-bot` ディレクトリ内から `pnpm` を使用して開始スクリプトを実行します。

*   **ワンショットモード (デフォルト)**:

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **インタラクティブチャットモード**:

    ```bash icon=lucide:terminal
    pnpm start --chat
    ```

*   **パイプライン入力**:

    ```bash icon=lucide:terminal
    echo "Tell me about the AIGNE Framework" | pnpm start
    ```

## コマンドラインオプション

チャットボットスクリプトは、その動作と設定をカスタマイズするためにいくつかのコマンドライン引数を受け入れます。

| パラメータ | 説明 | デフォルト |
|---|---|---|
| `--chat` | チャットボットをインタラクティブモードで実行し、連続的な会話を行います。 | 無効 (ワンショットモード) |
| `--model <provider[:model]>` | 使用する AI モデルを指定します。フォーマットは `provider[:model]` です。例: `openai` または `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | モデル生成の温度を設定して、ランダム性を制御します。 | プロバイダーのデフォルト |
| `--top-p <value>` | トークン選択のための top-p (nucleus sampling) 値を設定します。 | プロバイダーのデフォルト |
| `--presence-penalty <value>` | テキスト内での存在に基づいて新しいトークンのペナルティを調整します。 | プロバイダーのデフォルト |
| `--frequency-penalty <value>` | テキスト内での頻度に基づいて新しいトークンのペナルティを調整します。 | プロバイダーのデフォルト |
| `--log-level <level>` | ロギングの詳細度を設定します。オプション: `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 入力クエリを引数として直接提供します。 | なし |

## デバッグ

AIGNE Framework には、Agent の実行を監視および分析するための強力な観測ツールが含まれており、これはデバッグとパフォーマンスチューニングに不可欠です。

1.  **観測サーバーの開始**
    ターミナルで `aigne observe` コマンドを実行します。これにより、Agent からの実行データを受け取るローカル Web サーバーが起動します。

2.  **実行の表示**
    ブラウザで Web インターフェースを開き、最近の Agent の実行リストを表示します。実行を選択してそのトレースを検査し、詳細な呼び出し情報を表示し、Agent が情報を処理しモデルと対話する方法を理解できます。

## まとめ

この例は、AIGNE Framework を使用して Agent ベースのチャットボットを構築するための実践的な基盤を提供します。チャットボットをさまざまなモードで実行し、AI モデルに接続し、その実行をデバッグする方法を学びました。

より高度な例や機能については、以下のトピックを探索することをお勧めします。

<x-cards data-columns="2">
  <x-card data-title="メモリ" data-icon="lucide:brain-circuit" data-href="/examples/memory">チャットボットに過去の対話を記憶させる方法を学びます。</x-card>
  <x-card data-title="AIGNE ファイルシステム (AFS)" data-icon="lucide:folder-tree" data-href="/examples/afs-system-fs">ローカルファイルシステムと対話できるチャットボットを構築します。</x-card>
  <x-card data-title="ワークフローオーケストレーション" data-icon="lucide:workflow" data-href="/examples/workflow-orchestration">複雑なタスクで複数の Agent を連携させます。</x-card>
  <x-card data-title="コアコンセプト" data-icon="lucide:book-open" data-href="/developer-guide/core-concepts">AIGNE Framework の基本的な構成要素について深く掘り下げます。</x-card>
</x-cards>