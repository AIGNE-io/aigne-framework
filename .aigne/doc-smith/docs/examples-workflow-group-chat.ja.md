# ワークフロー グループチャット

このドキュメントでは、AIGNE フレームワークを使用してマルチ Agent グループチャットアプリケーションを構築し、実行するためのステップバイステップガイドを提供します。マネージャー、ライター、エディター、イラストレーターといった複数の AI Agent を連携させてタスクで協業させる方法を学び、複雑な Agent ワークフローの実用的な応用を示します。

## 概要

このワークフローでは、`Group Manager` Agent が中心的なコーディネーターとして機能します。ユーザーが指示を出すと、マネージャーはリクエストを適切な専門 Agent に指示します。その後、Agent はグループ内でメッセージを共有して協業し、タスクを完了させます。

以下の図は、このインタラクションフローを示しています。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle

  Group-Manager: {
    label: "グループマネージャー"
  }

  Writer: {
    label: "ライター"
  }

  Editor: {
    label: "エディター"
  }

  Illustrator: {
    label: "イラストレーター"
  }

}

User -> AIGNE-Framework.Group-Manager: "1. 指示を送信"
AIGNE-Framework.Group-Manager -> AIGNE-Framework.Writer: "2. タスクを委任"
AIGNE-Framework.Writer -> AIGNE-Framework.Editor: "3. 下書きを共有（グループメッセージ）"
AIGNE-Framework.Writer -> AIGNE-Framework.Illustrator: "3. 下書きを共有（グループメッセージ）"
AIGNE-Framework.Writer -> User: "3. 下書きを共有（グループメッセージ）"
AIGNE-Framework.Group-Manager -> AIGNE-Framework.Illustrator: "4. 画像作成をリクエスト"
```

インタラクションフローは以下の通りです。

1.  **ユーザー**が**グループマネージャー**に指示を送信します。
2.  **グループマネージャー**は最初のタスクを**ライター** Agent に委任します。
3.  **ライター** Agent がコンテンツの下書きを作成し、グループメッセージとして共有します。これにより、**エディター**、**イラストレーター**、**ユーザー**が利用できるようになります。
4.  次に**マネージャー**は、ストーリーに基づいて画像を制作するよう**イラストレーター**にリクエストします。
5.  この協業プロセスは、最初の指示が完了するまで続きます。

## 前提条件

進める前に、開発環境が以下の要件を満たしていることを確認してください。

*   **Node.js**: バージョン 20.0 以上
*   **npm**: Node.js のインストールに含まれています
*   **OpenAI API キー**: Agent が OpenAI の言語モデルと対話するために必要です。[OpenAI プラットフォーム](https://platform.openai.com/api-keys)からキーを取得してください。

## クイックスタート

リポジトリをクローンすることなく、`npx` を使ってこのサンプルを直接実行できます。

### サンプルの実行

このアプリケーションは、いくつかの実行モードをサポートしています。

#### ワンショットモード

デフォルトモードでは、アプリケーションは単一の入力指示を処理した後に終了します。

```bash ワンショットモードで実行 icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat
```

#### 対話型チャットモード

`--chat` フラグを使用すると、アプリケーションを対話モードで実行し、継続的な会話ができます。

```bash 対話型チャットモードで実行 icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat --chat
```

#### パイプライン入力

ターミナルから直接入力をパイプすることもできます。

```bash パイプライン入力を使用 icon=lucide:terminal
echo "Write a short story about space exploration" | npx -y @aigne/example-workflow-group-chat
```

### AI モデルに接続

初めてサンプルを実行すると、AI モデルプロバイダーへの接続を求められます。

![Connect to an AI model](/sources/examples/workflow-group-chat/run-example.png)

いくつかの選択肢があります。

1.  **AIGNE Hub (公式)**: 推奨される方法です。公式ハブでは新規ユーザー向けに無料トークンを提供しています。
2.  **セルフホスト AIGNE Hub**: URL を提供して、自身の AIGNE Hub インスタンスに接続します。
3.  **サードパーティモデルプロバイダー**: 適切な環境変数を設定して、OpenAI などのプロバイダーに直接接続します。OpenAI の場合は、以下のように API キーを設定します。

    ```bash OpenAI API キーを設定 icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key-here"
    ```

設定後、再度 `npx` コマンドを実行してください。

## ソースからの実行

コードを調査または変更するには、リポジトリをクローンしてサンプルをローカルで実行できます。

### 1. リポジトリのクローン

```bash リポジトリをクローン icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係のインストール

サンプルディレクトリに移動し、`pnpm` を使用して必要なパッケージをインストールします。

```bash 依存関係をインストール icon=lucide:terminal
cd aigne-framework/examples/workflow-group-chat
pnpm install
```

### 3. サンプルの実行

`pnpm start` コマンドを使用してアプリケーションを実行します。コマンドライン引数は `--` の後に渡す必要があります。

```bash ワンショットモードで実行 icon=lucide:terminal
pnpm start
```

```bash 対話型チャットモードで実行 icon=lucide:terminal
pnpm start -- --chat
```

```bash パイプライン入力を使用 icon=lucide:terminal
echo "Write a short story about space exploration" | pnpm start
```

## コマンドラインオプション

アプリケーションの動作は、以下のコマンドラインパラメータを使用してカスタマイズできます。

| パラメータ | 説明 | デフォルト |
|---|---|---|
| `--chat` | 対話型チャットモードで実行 | 無効（ワンショットモード） |
| `--model <provider[:model]>` | 使用する AI モデルを 'provider\[:model]' 形式で指定します。model はオプションです。例: 'openai' または 'openai:gpt-4o-mini' | openai |
| `--temperature <value>` | モデル生成時の Temperature | プロバイダーのデフォルト |
| `--top-p <value>` | Top-p サンプリング値 | プロバイダーのデフォルト |
| `--presence-penalty <value>` | Presence penalty 値 | プロバイダーのデフォルト |
| `--frequency-penalty <value>` | Frequency penalty 値 | プロバイダーのデフォルト |
| `--log-level <level>` | ログレベルを設定（ERROR, WARN, INFO, DEBUG, TRACE） | INFO |
| `--input`, `-i <input>` | 直接入力を指定 | なし |

### 使用例

次のコマンドは、ログレベルを `DEBUG` に設定してアプリケーションを実行します。

```bash ログレベルを設定 icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

## デバッグ

Agent の動作を調査・分析するには、`aigne observe` コマンドを使用します。このツールは、実行トレース、コール詳細、その他のランタイムデータを表示するためのインターフェースを備えたローカル Web サーバーを起動します。これは、Agent ワークフローのデバッグに不可欠です。

監視サーバーを起動するには、以下を実行します。

```bash 監視サーバーを起動 icon=lucide:terminal
aigne observe
```

![Start aigne observe](/sources/examples/images/aigne-observe-execute.png)

実行されると、Web インターフェースに最近の Agent 実行リストが表示され、各実行の詳細をドリルダウンして確認できます。

![View recent executions](/sources/examples/images/aigne-observe-list.png)

## まとめ

このガイドでは、協調的なマルチ Agent グループチャットを実行し、設定する方法を説明しました。その他の高度なワークフローパターンを探るには、以下のサンプルを参照してください。

<x-cards data-columns="2">
  <x-card data-title="ワークフロー：ハンドオフ" data-href="/examples/workflow-handoff" data-icon="lucide:arrow-right-left">
  専門 Agent 間でシームレスな移行を作成し、複雑な問題を解決する方法を学びます。
  </x-card>
  <x-card data-title="ワークフロー：オーケストレーション" data-href="/examples/workflow-orchestration" data-icon="lucide:network">
  洗練された処理パイプラインで連携して動作する複数の Agent を調整します。
  </x-card>
</x-cards>