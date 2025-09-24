---
labels: ["Reference"]
---

---
labels: ["リファレンス"]
---

# aigne run

`aigne run`コマンドは、AIGNE agentを実行する主な方法です。ローカルのプロジェクトディレクトリから、またはリモートURLから直接agentを実行できます。入力の提供、AIモデルの設定、出力の処理など、柔軟なオプションセットを提供し、対話型agentのためのインタラクティブなチャットモードも含まれています。

## 使用方法

```bash 基本構文
aigne run [path] [agent_name] [options]
```

### 引数

-   `[path]` (任意): AIGNEプロジェクトディレクトリへのパス、またはリモートURL（例: Gitリポジトリ）。省略した場合、現在のディレクトリ（`.`）がデフォルトになります。
-   `[agent_name]` (任意): プロジェクトから実行する特定のagent。指定しない場合、CLIは`aigne.yaml`で定義された`entry-agent`またはデフォルトの`chat` agentを使用し、それらがない場合はリストされている最初のagentにフォールバックします。

## 仕組み

`run`コマンドはまずAIGNEアプリケーションをロードします。リモートURLが提供された場合、プロジェクトをローカルにダウンロードしてキャッシュしてから処理を進めます。その後、コマンドライン引数を解析し、指定された入力とモデル設定で指定されたagentを実行します。

```d2 リモート実行フロー icon=lucide:workflow
direction: down

User: {
  shape: c4-person
}

CLI: {
  label: "@aigne/cli"
  
  Download: {
    label: "パッケージのダウンロード"
  }

  Extract: {
    label: "パッケージの展開"
  }

  Load: {
    label: "アプリケーションのロード"
  }

  Execute: {
    label: "Agentの実行"
  }
}

Remote-URL: {
  label: "リモートURL\n(例: GitHub)"
  shape: cylinder
}

Cache-Dir: {
  label: "キャッシュディレクトリ\n(~/.aigne/.download)"
  shape: cylinder
}

Local-Dir: {
  label: "ローカルディレクトリ\n(~/.aigne/<hostname>/...)"
  shape: cylinder
}

User -> CLI: "aigne run <url>"
CLI.Download -> Remote-URL: "1. プロジェクトの取得"
Remote-URL -> CLI.Download: "2. tarballの返却"
CLI.Download -> Cache-Dir: "3. tarballの保存"
CLI.Extract -> Cache-Dir: "4. tarballの読み込み"
CLI.Extract -> Local-Dir: "5. プロジェクトファイルの展開"
CLI.Load -> Local-Dir: "6. aigne.yaml と .env のロード"
CLI.Execute -> CLI.Load: "7. Agentの実行"
CLI.Execute -> User: "8. 出力の表示"
```

## 例

### ローカルAgentの実行

ローカルファイルシステム上のプロジェクトからagentを実行します。

```bash 現在のディレクトリから実行 icon=lucide:folder-dot
# 現在のディレクトリでデフォルトのAgentを実行
aigne run
```

```bash 特定のAgentを実行 icon=lucide:locate-fixed
# 特定のプロジェクトパスにある'translator' Agentを実行
aigne run path/to/my-project translator
```

### リモートAgentの実行

Gitリポジトリやtarball URLから直接agentを実行できます。CLIはプロジェクトのダウンロードとキャッシュをホームディレクトリ（`~/.aigne`）で処理します。

```bash GitHubリポジトリから実行 icon=lucide:github
aigne run https://github.com/AIGNE-io/aigne-framework/tree/main/examples/default
```

### インタラクティブチャットモードでの実行

対話型agentの場合、`--chat`フラグを使用してインタラクティブなターミナルセッションを開始します。

![チャットモードでAgentを実行する](../assets/run/run-default-template-project-in-chat-mode.png)

```bash チャットセッションを開始する icon=lucide:messages-square
aigne run --chat
```

チャットループ内では、`/exit`で終了し、`/help`でヘルプを表示するなどのコマンドを使用できます。また、パスの前に`@`を付けることで、ローカルファイルをメッセージに添付することもできます。

```
💬 このファイルについて教えてください: @/path/to/my-document.pdf
```

## Agentへの入力

`aigne.yaml`で定義された入力スキーマに応じて、agentに入力を提供する方法は複数あります。

#### コマンドラインオプションとして

agentの入力スキーマが特定のパラメータ（例: `text`, `targetLanguage`）を定義している場合、それらをコマンドラインオプションとして渡すことができます。

```bash Agent固有のパラメータを渡す icon=lucide:terminal
# 'translator' Agentが'text'と'targetLanguage'の入力を持つと仮定
aigne run translator --text "Hello, world!" --targetLanguage "Spanish"
```

#### 標準入力(stdin)から

コンテンツを`run`コマンドに直接パイプすることができます。これはコマンドを連結するのに便利です。

```bash Agentに入力をパイプする icon=lucide:pipe
echo "この重要な更新を要約してください。" | aigne run summarizer
```

#### ファイルから

`@`プレフィックスを使用してファイルからコンテンツを読み込み、入力として渡します。

-   **`--input @<file>`**: ファイル全体の内容をプライマリ入力として読み込みます。
-   **`--<param> @<file>`**: 特定のAgentパラメータのファイル内容を読み込みます。

```bash ファイルから入力を読み込む icon=lucide:file-text
# document.txtの内容をメインの入力として使用
aigne run summarizer --input @document.txt

# 複数のパラメータに対して構造化されたJSON入力を提供
aigne run translator --input @request-data.json --format json
```

#### マルチメディアファイルの入力

画像やドキュメントなどのファイルを処理するagent（例: ビジョンモデル）の場合、`--input-file`オプションを使用します。

```bash ビジョンAgentにファイルを添付する icon=lucide:image-plus
aigne run image-describer --input-file cat.png --input "この画像には何が写っていますか？"
```

## オプションリファレンス

### 一般オプション

| Option | Description |
|---|---|
| `--chat` | ターミナルでAgentをインタラクティブなチャットループで実行します。 |
| `--log-level <level>` | ロギングレベルを設定します。利用可能なレベル: `debug`, `info`, `warn`, `error`, `silent`。デフォルト: `silent`。 |

### モデルオプション

これらのオプションを使用すると、`aigne.yaml`で定義されたモデル設定を上書きできます。

| Option | Description |
|---|---|
| `--model <provider[:model]>` | 使用するAIモデルを指定します（例: 'openai' または 'openai:gpt-4o-mini'）。 |
| `--temperature <value>` | モデルの温度（0.0-2.0）。値が高いほどランダム性が増します。 |
| `--top-p <value>` | モデルのtop-p / nucleusサンプリング（0.0-1.0）。応答の多様性を制御します。 |
| `--presence-penalty <value>` | Presence penalty（-2.0から2.0）。トークンの繰り返しを抑制します。 |
| `--frequency-penalty <value>` | Frequency penalty（-2.0から2.0）。頻繁に出現するトークンを抑制します。 |
| `--aigne-hub-url <url>` | リモートモデルやAgentを取得するためのカスタムAIGNE HubサービスURL。 |

### 入出力オプション

| Option | Alias | Description |
|---|---|---|
| `--input <value>` | `-i` | Agentへの入力。複数回指定できます。ファイルから読み込むには`@<file>`を使用します。 |
| `--input-file <path>` | | Agentへの入力ファイルのパス（例: ビジョンモデル用）。複数回指定できます。 |
| `--format <format>` | | `--input @<file>`を使用する場合の入力形式。選択肢: `text`, `json`, `yaml`。 |
| `--output <file>` | `-o` | 結果を保存するファイルへのパス。デフォルトでは標準出力に出力されます。 |
| `--output-key <key>` | | Agentの結果オブジェクト内で出力ファイルに保存するキー。デフォルトは`output`です。 |
| `--force` | | 出力ファイルが既に存在する場合に上書きします。親ディレクトリが存在しない場合は作成します。 |

---

## 次のステップ

<x-cards>
  <x-card data-title="aigne observe" data-icon="lucide:monitor-dot" data-href="/command-reference/observe">
    観測可能性サーバーを起動して、Agentの実行の詳細なトレースを表示する方法を学びます。
  </x-card>
  <x-card data-title="リモートAgentの実行" data-icon="lucide:cloudy" data-href="/guides/running-remote-agents">
    リモートURLから直接Agentを実行する詳細について深く掘り下げます。
  </x-card>
  <x-card data-title="カスタムAgentの作成" data-icon="lucide:bot" data-href="/guides/creating-a-custom-agent">
    AIGNE CLIで使用する独自のAgentとスキルの構築を始めましょう。
  </x-card>
</x-cards>