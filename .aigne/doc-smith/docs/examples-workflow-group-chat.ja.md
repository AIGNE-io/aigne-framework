# ワークフローグループチャット

このガイドでは、AIGNE フレームワークを使用してマルチエージェントグループチャットワークフローを構築し、実行する方法を説明します。マネージャーを含む複数のエージェントを連携させてタスクに取り組ませ、メッセージを共有し、共通の目標を達成するために協力するチーム環境をシミュレートする方法を学びます。

## 概要

グループチャットワークフローの例は、専門的な役割を持つさまざまなエージェントが協力してユーザーの要求を満たす、洗練されたマルチエージェントシステムを紹介します。このプロセスは、`Writer`、`Editor`、`Illustrator` などの他のエージェント間の会話とタスク実行を指示する `Group Manager` エージェントによって管理されます。

この例は、主に2つの操作モードをサポートしています。
*   **ワンショットモード**: ワークフローは、単一の入力に基づいて一度だけ実行され、完了します。
*   **インタラクティブモード**: ワークフローは継続的な会話を行い、フォローアップの質問や動的な対話を可能にします。

中心となるインタラクションモデルは次のとおりです。

```d2
direction: down

User: {
  shape: c4-person
}

GroupChat: {
  label: "グループチャットワークフロー"
  shape: rectangle

  Group-Manager: {
    label: "グループマネージャー"
    shape: rectangle
  }

  Collaborators: {
    label: "協力者"
    shape: rectangle
    grid-columns: 3

    Writer: {
      shape: rectangle
    }
    Editor: {
      shape: rectangle
    }
    Illustrator: {
      shape: rectangle
    }
  }
}

User -> GroupChat.Group-Manager: "1. ユーザーリクエスト"
GroupChat.Group-Manager -> GroupChat.Collaborators.Writer: "2. タスクを委任"
GroupChat.Collaborators.Writer <-> GroupChat.Collaborators.Editor: "3. 協力"
GroupChat.Collaborators.Editor <-> GroupChat.Collaborators.Illustrator: "4. 協力"
GroupChat.Collaborators.Writer -> GroupChat.Group-Manager: "5. 結果を送信"
GroupChat.Group-Manager -> User: "6. 最終出力"
```

## 前提条件

進める前に、開発環境が以下の要件を満たしていることを確認してください。
*   **Node.js**: バージョン 20.0 以上。
*   **npm**: Node.js に含まれています。
*   **OpenAI API キー**: デフォルトのモデル設定に必要です。[OpenAI プラットフォーム](https://platform.openai.com/api-keys)から取得できます。

## クイックスタート

`npx` を使用して、リポジトリをクローンせずにこの例を直接実行できます。

### 例を実行する

ターミナルで次のいずれかのコマンドを実行します。

デフォルトのワンショットモードでワークフローを実行するには：
```bash ワンショットモードで実行 icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat
```

インタラクティブなチャットセッションを開始するには：
```bash インタラクティブモードで実行 icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat --chat
```

パイプライン経由で直接入力を提供することもできます：
```bash パイプライン入力で実行 icon=lucide:terminal
echo "Write a short story about space exploration" | npx -y @aigne/example-workflow-group-chat
```

### AI モデルに接続する

初めて例を実行すると、API キーが設定されていないため、AI モデルプロバイダーに接続するように求められます。

![AI モデルへの接続を求める初期設定プロンプト。](../../../examples/workflow-group-chat/run-example.png)

続行するにはいくつかのオプションがあります。

#### 1. AIGNE Hub に接続する (推奨)

これは最も簡単な開始方法であり、新規ユーザー向けの無料クレジットが含まれています。

1.  最初のオプションを選択します: `Connect to the Arcblock official AIGNE Hub`。
2.  ウェブブラウザが AIGNE CLI を承認するためのページを開きます。
3.  「Approve」をクリックして必要な権限を付与します。CLI は自動的に設定されます。

![AIGNE Hub 接続の承認ダイアログ。](../../../examples/images/connect-to-aigne-hub.png)

#### 2. セルフホストの AIGNE Hub に接続する

独自の AIGNE Hub のインスタンスを実行している場合：

1.  2番目のオプションを選択します: `Connect to your self-hosted AIGNE Hub`。
2.  プロンプトが表示されたら、AIGNE Hub インスタンスの URL を入力します。
3.  ブラウザの指示に従って接続を完了します。

![セルフホストの AIGNE Hub の URL を入力するプロンプト。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 3. サードパーティのモデルプロバイダーを設定する

環境変数を設定することで、OpenAI のようなプロバイダーに直接接続できます。

1.  インタラクティブプロンプトを終了します。
2.  ターミナルで `OPENAI_API_KEY` 環境変数を設定します。

    ```bash OpenAI API キーを設定 icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key"
    ```

3.  再度、例のコマンドを実行します。

Google Gemini や DeepSeek などの他のプロバイダーについては、プロジェクト内の `.env.local.example` ファイルを参照して、正しい環境変数名を確認してください。

## ローカルでのインストールと使用方法

開発目的で、リポジトリをクローンしてローカルで例を実行することができます。

### 1. リポジトリをクローンする

```bash フレームワークリポジトリをクローン icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

例のディレクトリに移動し、`pnpm` を使用して必要なパッケージをインストールします。

```bash 依存関係をインストール icon=lucide:terminal
cd aigne-framework/examples/workflow-group-chat
pnpm install
```

### 3. 例を実行する

`pnpm start` コマンドを使用してワークフローを実行します。コマンドライン引数は `--` の後に渡す必要があります。

ワンショットモードで実行するには：
```bash ワンショットモードで実行 icon=lucide:terminal
pnpm start
```

インタラクティブチャットモードで実行するには：
```bash インタラクティブモードで実行 icon=lucide:terminal
pnpm start -- --chat
```

パイプライン入力を使用するには：
```bash パイプライン入力で実行 icon=lucide:terminal
echo "Write a short story about space exploration" | pnpm start
```

### コマンドラインオプション

この例では、その動作をカスタマイズするためにいくつかのコマンドライン引数を受け入れます。

| パラメータ | 説明 | デフォルト |
|-----------|-------------|---------|
| `--chat` | インタラクティブチャットモードで実行 | 無効 (ワンショットモード) |
| `--model <provider[:model]>` | 使用するAIモデルを 'provider\[:model]' の形式で指定します。model はオプションです。例: 'openai' または 'openai:gpt-4o-mini' | openai |
| `--temperature <value>` | モデル生成の温度 | プロバイダーのデフォルト |
| `--top-p <value>` | Top-p サンプリング値 | プロバイダーのデフォルト |
| `--presence-penalty <value>` | 存在ペナルティ値 | プロバイダーのデフォルト |
| `--frequency-penalty <value>` | 頻度ペナルティ値 | プロバイダーのデフォルト |
| `--log-level <level>` | ログレベルを設定 (ERROR, WARN, INFO, DEBUG, TRACE) | INFO |
| `--input`, `-i <input>` | 直接入力を指定 | なし |

#### 例

```bash ログレベルを設定 icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

```bash 特定のモデルを使用 icon=lucide:terminal
pnpm start -- --model openai:gpt-4o-mini
```

## AIGNE Observe でのデバッグ

エージェントの実行フローを検査し、動作をデバッグするには、`aigne observe` コマンドを使用できます。このツールは、エージェントのトレースの詳細なビューを提供するローカルウェブサーバーを起動します。

まず、別のターミナルで可観測性サーバーを起動します。
```bash 可観測性サーバーを起動 icon=lucide:terminal
aigne observe
```
![AIGNE Observe サーバーが起動する様子を示すターミナル出力。](../../../examples/images/aigne-observe-execute.png)

ワークフローの例を実行した後、ブラウザで `http://localhost:7893` を開いてトレースを表示します。実行中の各エージェントの入力、出力、および内部状態を検査できます。

![トレースのリストを示す AIGNE Observe のウェブインターフェース。](../../../examples/images/aigne-observe-list.png)

## まとめ

このガイドでは、ワークフローグループチャットの例を実行するためのステップバイステップのウォークスルーを提供しました。`npx` を使用してワークフローを実行する方法、さまざまな AI モデルプロバイダーに接続する方法、そして開発用にローカルにインストールする方法を学びました。また、エージェントのインタラクションをデバッグするために `aigne observe` を使用する方法も確認しました。

より複雑なパターンについては、AIGNE フレームワークのドキュメントにある他の例を参照してください。

<x-cards data-columns="2">
  <x-card data-title="ワークフロー: ハンドオフ" data-icon="lucide:arrow-right-left" data-href="/examples/workflow-handoff">
    複雑な問題を解決するために、専門エージェント間のシームレスな移行を作成する方法を学びます。
  </x-card>
  <x-card data-title="ワークフロー: オーケストレーション" data-icon="lucide:network" data-href="/examples/workflow-orchestration">
    洗練された処理パイプラインで連携して動作する複数のエージェントを調整する方法を発見します。
  </x-card>
</x-cards>