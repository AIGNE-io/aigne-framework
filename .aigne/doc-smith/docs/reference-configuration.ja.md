このガイドは AIGNE フレームワークの包括的な概要を提供し、開発者が30分以内に利用を開始できるように設計されています。コアコンセプト、プロジェクト構造、そして初めての AI Agent を設定・実行するための基本的なステップについて説明します。

### コアコンセプト

AIGNE は、AI Agent を構築、構成、実行するための強力なフレームワークです。プロジェクトの構造や個々の Agent の振る舞いを定義するために、YAML ファイルによる宣言的なアプローチを使用します。

*   **プロジェクト:** AIGNE プロジェクトは `aigne.yaml` ファイルによって定義されます。これは、Agent、スキル、デフォルト設定を指定する中央マニフェストとして機能します。
*   **Agent:** Agent は基本的な構成要素です。タスクを実行し、ツールを使用し、他の Agent と対話できるエンティティです。AIGNE は `ai`、`team`、`function` など、さまざまなタイプの Agent をサポートしています。
*   **スキル:** スキルは再利用可能なツールや関数であり、Agent にアタッチして特定の能力を与えることができます。

### プロジェクト構造

このフレームワークは `aigne.yaml` ファイルを中心に構成されています。このファイルが、プロジェクトのすべての異なるコンポーネントを統括します。

```yaml
# aigne.yaml - メインプロジェクト設定

name: test_aigne_project
description: A test project for the aigne agent
chat_model:
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
  - chat-with-prompt.yaml
  - team.yaml
skills:
  - sandbox.js
cli:
  agents:
    - chat.yaml
    - url: test-cli-agents/a.yaml
      name: a-renamed
```

#### 主な設定セクション

*   **`name` & `description`**: プロジェクトの基本的なメタデータです。
*   **`chat_model`**: プロジェクト内のすべての Agent に対するデフォルトの言語モデルとその設定（例：`temperature`）を定義します。これは個々の Agent 設定で上書き可能です。
*   **`agents`**: それぞれが Agent を定義する YAML または JS ファイルのリストです。
*   **`skills`**: 再利用可能なスキルを定義するファイルのリストです。これらは多くの場合、関数をエクスポートする JavaScript ファイルです。
*   **`cli`**: コマンドラインインターフェースでコマンドとして公開される Agent を設定し、ターミナルから直接実行できるようにします。

### ロードプロセス

AIGNE プロジェクトを実行すると、フレームワークは以下の手順で Agent をロードし、初期化します。

1.  **`aigne.yaml` の検索**: 指定されたディレクトリで `aigne.yaml` または `aigne.yml` ファイルを検索します。
2.  **設定のパース**: メインの `aigne.yaml` ファイルをパースして、プロジェクト設定と Agent およびスキルのリストを取得します。
3.  **Agent とスキルのロード**: フレームワークは `agents` および `skills` セクションで定義されたパスを反復処理します。各ファイルを読み込み、その拡張子（`.yaml` または `.js`）に基づいて Agent/スキルの定義をパースします。
4.  **Agent の構築**: パースされた定義を使用して Agent インスタンスを構築し、指定されたモデル、スキル、その他の設定とリンクさせます。
5.  **Agent の公開**: 最後に、`aigne.yaml` で定義されているように、`cli` や `mcp_server` などのインターフェースを通じて Agent を利用可能にします。

このロードメカニズムは非常に柔軟で、シンプルで再利用可能なパーツから複雑な Agent の振る舞いを構成することができます。このプロセスのコアロジックは `packages/core/src/loader/index.ts` にあります。

```d2
direction: down

Developer: {
  shape: c4-person
}

Project-Files: {
  label: "プロジェクト設定"
  style.stroke-dash: 2
  shape: rectangle

  aigne-yaml: {
    label: "aigne.yaml\n(プロジェクトマニフェスト)"
    shape: rectangle
  }

  Agent-Definitions: {
    label: "Agent 定義"
    shape: rectangle
    agent1: "chat.yaml"
    agent2: "team.yaml"
  }

  Skill-Definitions: {
    label: "スキル定義"
    shape: rectangle
    skill1: "sandbox.js"
  }
}

AIGNE-Loader: {
  label: "AIGNE コアローダー"
  shape: rectangle
}

Constructed-Agents: {
  label: "構築された Agent インスタンス\n(インメモリ)"
  shape: rectangle
}

Execution-Interfaces: {
  label: "実行インターフェース"
  style.stroke-dash: 2
  shape: rectangle
  CLI
  MCP-Server
}


AIGNE-Loader -> Project-Files.aigne-yaml: "1. マニフェストを検索 & パース"
Project-Files.aigne-yaml -> Project-Files.Agent-Definitions: "参照" {
  style.stroke-dash: 2
}
Project-Files.aigne-yaml -> Project-Files.Skill-Definitions: "参照" {
  style.stroke-dash: 2
}
AIGNE-Loader -> Project-Files.Agent-Definitions: "2. 定義をロード"
AIGNE-Loader -> Project-Files.Skill-Definitions: "2. 定義をロード"
AIGNE-Loader -> Constructed-Agents: "3. Agent を構築 & スキルをリンク"
Constructed-Agents -> Execution-Interfaces: "4. Agent を公開"
Developer -> Execution-Interfaces.CLI: "コマンド経由で Agent を実行"
```

### Agent の定義

Agent は通常、独自の YAML ファイルで定義されます。`type` プロパティが Agent のコアな振る舞いを決定します。

#### Agent の種類

AIGNE は、それぞれ異なる目的のためにいくつかの Agent タイプをサポートしています。

*   **`ai`**: 最も一般的なタイプ。言語モデルを使用して指示を処理し、応答を生成する AI Agent です。スキル（ツール）を使用してアクションを実行できます。
*   **`image`**: プロンプトに基づいて画像を生成することに特化した Agent です。
*   **`team`**: 複雑なタスクを達成するために、他の Agent のグループを統括する強力な Agent です。
*   **`mcp`**: シェルコマンドを実行したり、リモートの MCP サーバーに接続したりできる Agent です。
*   **`transform`**: JSONata 式を使用して入力データを変換する Agent です。
*   **`function`**: JavaScript 関数を実行する Agent です。

#### AI Agent の例

以下は `chat.yaml` で定義された `ai` Agent の基本的な例です。

```yaml
# chat.yaml

type: ai
name: "Chat Agent"
description: "A simple conversational agent."

# AIモデルのプロンプトとコンテキストを定義
instructions:
  - role: system
    content: "You are a helpful assistant."
  - role: user
    content: "Hi, I need help with my task."

# aigne.yaml のデフォルトモデルを上書き
model:
  name: gpt-4
  temperature: 0.7

# Agent にスキルをアタッチ
skills:
  - "sandbox.js"
```

*   **`type: ai`**: これが AI Agent であることを指定します。省略された場合、デフォルトで `ai` になります。
*   **`instructions`**: 言語モデルにコンテキストとプロンプトを提供します。単純な文字列、または `role` と `content` を持つメッセージオブジェクトのリストにすることができます。`url` を使用して外部ファイルから指示をロードすることもできます。
*   **`model`**: この特定の Agent に対して異なるモデルや設定を指定し、プロジェクトレベルのデフォルトを上書きできます。
*   **`skills`**: Agent がツールとして使用できるスキルファイルのリストです。

### クイックスタート：初めての "Greeter" Agent

すべてが実際にどのように機能するかを確認するために、簡単なプロジェクトを作成してみましょう。

#### ステップ1：プロジェクトファイルの作成

まず、新しいディレクトリに `aigne.yaml` という名前のファイルを作成します。

```yaml
# aigne.yaml
name: "Greeter Project"
description: "A simple project to demonstrate AIGNE."

# このプロジェクトの一部である Agent を定義
agents:
  - "greeter.yaml"

# 'greeter' Agent をコマンドラインから実行可能にする
cli:
  agents:
    - "greeter.yaml"
```

#### ステップ2：Agent 定義の作成

次に、同じディレクトリに Agent ファイル `greeter.yaml` を作成します。

```yaml
# greeter.yaml
name: "Greeter"
description: "A friendly agent that greets the user."

# AIへの指示
instructions: "You are a friendly agent. Greet the user based on their name."

# この Agent が期待する入力を定義
inputSchema:
  type: object
  properties:
    name:
      type: string
      description: "The name of the person to greet."
  required:
  - name
```

*   **`instructions`**: Agent に簡単なペルソナと目標を与えます。
*   **`inputSchema`**: この Agent が入力として `name` を要求することを定義します。AIGNE は、これが提供されない場合、自動的にユーザーに入力を促します。

#### ステップ3：Agent の実行

これで、AIGNE CLI を使用してターミナルから Agent を実行できます。

```bash
aigne run greeter --name "World"
```

**期待される出力：**

```
> Hello, World! It's a pleasure to meet you.
```

名前を指定せずに実行することもでき、その場合は入力を求められます。

```bash
aigne run greeter
```

**期待される対話：**

```
? What is the name of the person to greet? › World
> Hello, World! It's a pleasure to meet you.
```

### 次のステップ

おめでとうございます！初めての AIGNE Agent の作成と実行に成功しました。ここから、さらに高度なトピックを探求できます。

*   **スキルの作成**: カスタムの JavaScript 関数を作成して、Agent に新しい機能を与えます。
*   **チームの構築**: 複数の Agent を統括して、複雑で多段階の問題を解決します。
*   **メモリの使用**: Agent に長期記憶を提供して、過去の対話を思い出させます。