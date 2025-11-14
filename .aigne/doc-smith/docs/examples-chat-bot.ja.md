# チャットボット

このガイドでは、Agentベースのチャットボットの例について包括的に解説します。さまざまなモードでチャットボットを実行する方法、さまざまなAIモデルプロバイダーに接続する方法、そしてAIGNEのオブザーバビリティツールを使用してその実行をデバッグする方法を学びます。この例は、ローカルに何もインストールすることなくすぐに始められるように設計されています。

## 概要

この例では、AIGNEフレームワークを使用して、シンプルかつ強力なAgentベースのチャットボットを作成および実行する方法を示します。主に2つの動作モードをサポートしています：
*   **ワンショットモード**: チャットボットは単一の入力を受け取り、応答を提供して終了します。
*   **インタラクティブモード**: セッションを終了することを決定するまで、チャットボットは継続的な会話を行います。

チャットボットは、さまざまなAIモデルを使用するように設定でき、コマンドラインから直接、またはパイプラインを通じて入力を受け入れることができます。

## 前提条件

この例を実行する前に、システムに以下がインストールされていることを確認してください：

*   [Node.js](https://nodejs.org) (バージョン20.0以上)
*   [OpenAI APIキー](https://platform.openai.com/api-keys)またはモデルとの対話のためのAIGNE Hubへのアクセス。

## クイックスタート

リポジトリをクローンしたり、依存関係をローカルにインストールしたりすることなく、`npx`を使用してこの例を直接実行できます。

### 例の実行

ターミナルで以下のコマンドを実行してチャットボットを起動します。

デフォルトのワンショットモードで実行：
```bash npx command icon=lucide:terminal
npx -y @aigne/example-chat-bot
```

`--chat`フラグを使用してインタラクティブなチャットモードで実行：
```bash npx command icon=lucide:terminal
npx -y @aigne/example-chat-bot --chat
```

パイプライン入力を使用してプロンプトを直接提供：
```bash npx command icon=lucide:terminal
echo "Tell me about AIGNE Framework" | npx -y @aigne/example-chat-bot
```

### AIモデルへの接続

この例を初めて実行すると、APIキーが設定されていないため、AIモデルサービスに接続するように求められます。次の図は、利用可能な接続オプションを示しています：

```d2
direction: down

Chatbot-Example: {
  label: "チャットボットの例\n(@aigne/example-chat-bot)"
  shape: rectangle
}

Connection-Options: {
  label: "接続オプション"
  shape: rectangle
  style: {
    stroke-dash: 4
  }

  Official-AIGNE-Hub: {
    label: "1. 公式AIGNE Hub\n(推奨)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Self-Hosted-Hub: {
    label: "2. セルフホストAIGNE Hub"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Third-Party-Provider: {
    label: "3. サードパーティプロバイダー\n(例: OpenAI)"
    shape: rectangle
  }
}

Blocklet-Store: {
  label: "Blocklet Store"
  icon: "https://store.blocklet.dev/assets/z8ia29UsENBg6tLZUKi2HABj38Cw1LmHZocbQ/logo.png"
}

Chatbot-Example -> Connection-Options: "AIモデルへの接続をユーザーに促す"
Connection-Options.Self-Hosted-Hub -> Blocklet-Store: "ここからインストール"
```

![AIモデル接続のための初期設定プロンプト。](../../../examples/chat-bot/run-example.png)

続行するにはいくつかのオプションがあります：

#### 1. 公式AIGNE Hubに接続する（推奨）

これが最も簡単な開始方法です。
1.  最初のオプションを選択します: `Connect to the Arcblock official AIGNE Hub`。
2.  Webブラウザが開き、AIGNE CLIを承認するページが表示されます。
3.  画面の指示に従って接続を承認します。新規ユーザーはサービスを使用するための無料トークンが付与されます。

![AIGNE CLIがAIGNE Hubに接続することを承認します。](../../../examples/images/connect-to-aigne-hub.png)

#### 2. セルフホストのAIGNE Hubに接続する

独自のAIGNE Hubインスタンスを実行している場合：
1.  2番目のオプションを選択します: `Connect to a self-hosted AIGNE Hub instance`。
2.  プロンプトが表示されたら、セルフホストAIGNE HubのURLを入力します。
3.  その後のプロンプトに従って接続を完了します。

セルフホストのAIGNE Hubをセットアップする必要がある場合は、[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ)からインストールできます。

![セルフホストのAIGNE HubのURLを入力します。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 3. サードパーティのモデルプロバイダー経由で接続する

適切な環境変数を設定することで、OpenAIなどのサードパーティAIモデルプロバイダーに直接接続することもできます。たとえば、OpenAIを使用するには、次のようにAPIキーを設定します：

```bash OpenAI APIキーを設定 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

環境変数を設定した後、再度この例を実行してください。サポートされているプロバイダーとその必要な環境変数のリストについては、例の設定ファイルを参照してください。

## ローカルでのインストールと使用

開発目的で、リポジトリをクローンしてローカルで例を実行したい場合があります。

### 1. AIGNE CLIのインストール

まず、AIGNEコマンドラインインターフェース（CLI）をグローバルにインストールします。

```bash AIGNE CLIをインストール icon=lucide:terminal
npm install -g @aigne/cli
```

### 2. リポジトリのクローン

`aigne-framework`リポジトリをクローンし、`chat-bot`の例のディレクトリに移動します。

```bash リポジトリをクローン icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
cd aigne-framework/examples/chat-bot
```

### 3. ローカルで例を実行

`pnpm start`コマンドを使用してチャットボットを実行します。

デフォルトのワンショットモードで実行：
```bash pnpm command icon=lucide:terminal
pnpm start
```

インタラクティブなチャットモードで実行：
```bash pnpm command icon=lucide:terminal
pnpm start --chat
```

パイプライン入力を使用：
```bash pnpm command icon=lucide:terminal
echo "Tell me about AIGNE Framework" | pnpm start
```

## コマンドラインオプション

チャットボットスクリプトは、その動作をカスタマイズするためにいくつかのコマンドライン引数を受け入れます。

| パラメータ | 説明 | デフォルト |
|---|---|---|
| `--chat` | インタラクティブなチャットモードで実行します。省略した場合、ワンショットモードで実行されます。 | `無効` |
| `--model <provider[:model]>` | 使用するAIモデルを指定します。形式は`provider[:model]`です。例：`openai`または`openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | モデル生成の温度を設定し、ランダム性を制御します。 | プロバイダーのデフォルト |
| `--top-p <value>` | モデル生成のためのtop-p（nucleus sampling）値を設定します。 | プロバイダーのデフォルト |
| `--presence-penalty <value>` | トピックの多様性に影響を与えるための存在ペナルティ値を設定します。 | プロバイダーのデフォルト |
| `--frequency-penalty <value>` | 繰り返し出力を減らすための頻度ペナルティ値を設定します。 | プロバイダーのデフォルト |
| `--log-level <level>` | ログレベルを設定します。オプションは`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`です。 | `INFO` |
| `--input`, `-i <input>` | 入力プロンプトを引数として直接提供します。 | `なし` |

## AIGNE Observeによるデバッグ

AIGNEには、Agentの実行をデバッグおよび分析するための強力なローカルオブザーバビリティツールが含まれています。`aigne observe`コマンドは、実行トレースを検査するためのユーザーインターフェースを提供するローカルWebサーバーを起動します。

まず、ターミナルでオブザベーションサーバーを起動します：

```bash aigne observe icon=lucide:terminal
aigne observe
```

![aigne observeサーバーが実行中であることを示すターミナル出力。](../../../examples/images/aigne-observe-execute.png)

チャットボットを実行した後、提供されたURL（通常は`http://localhost:7893`）をブラウザで開くと、最近のAgent実行のリストを表示できます。このインターフェースでは、入力、出力、モデル呼び出し、パフォーマンスメトリクスなど、各実行の詳細情報を検査でき、デバッグや最適化に非常に役立ちます。

![トレースのリストを示すAIGNEオブザーバビリティインターフェース。](../../../examples/images/aigne-observe-list.png)

## まとめ

この例は、AIGNEフレームワークを使用してAgentベースのチャットボットを構築するための実践的な基盤を提供します。この例の実行方法、さまざまなAIモデルへの接続方法、デバッグのための組み込みオブザーバビリティツールの活用方法を学びました。

より高度なトピックや例については、以下のドキュメントが役立つかもしれません：

<x-cards data-columns="2">
  <x-card data-title="メモリ" data-icon="lucide:brain-circuit" data-href="/examples/memory">
    会話全体でコンテキストを維持するために、チャットボットにメモリを追加する方法を学びます。
  </x-card>
  <x-card data-title="AIGNEのコアコンセプト" data-icon="lucide:book-open" data-href="/developer-guide/core-concepts">
    AIGNEフレームワークの基本的な構成要素についてさらに深く掘り下げます。
  </x-card>
</x-cards>