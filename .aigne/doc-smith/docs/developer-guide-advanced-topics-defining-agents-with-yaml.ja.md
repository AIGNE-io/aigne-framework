このドキュメントでは、AIGNE ローダーシステムについて詳しく解説します。このシステムは、設定ファイルをロード・解析して Agent を構築・初期化する役割を担います。ローダーは、AI Agent の振る舞いや相互作用を定義・設定するための主要なエントリーポイントです。

## 概要

AIGNE ローダーシステムは、ルートの `aigne.yaml` ファイルから始まる一連の設定ファイルを解釈し、完全なランタイム環境を構築するように設計されています。このプロセスには、プロジェクトレベルの設定の解析、指定されたすべての Agent とスキルの検出、そしてそれらを実行可能なオブジェクトとしてインスタンス化することが含まれます。ローダーは、シンプルな YAML 形式と、より複雑でプログラム的なロジックを記述できる JavaScript/TypeScript の両方で Agent を定義することをサポートしています。

ロードプロセスは次のように視覚化できます。

```d2
direction: down

Config-Sources: {
  label: "設定ソース"
  shape: rectangle

  aigne-yaml: "aigne.yaml\n(ルートエントリポイント)"

  definitions: {
    label: "Agent とスキルの定義"
    shape: rectangle
    grid-columns: 2

    yaml-files: "YAML ファイル\n(.yml)"
    ts-js-files: "TypeScript/JavaScript\n(.ts, .js)"
  }
}

Loader: {
  label: "AIGNE ローダーシステム"
  shape: rectangle
}

Runtime: {
  label: "初期化されたランタイム環境"
  shape: rectangle

  Objects: {
    label: "メモリ上のライブオブジェクト"
    shape: rectangle
    grid-columns: 2

    Agent-Instances: "Agent インスタンス"
    Skill-Instances: "スキルインスタンス"
  }
}

Config-Sources.aigne-yaml -> Loader: "1. 読み込み"
Config-Sources.definitions -> Loader: "2. 検出"
Loader -> Loader: "3. 解析と構築"
Loader -> Runtime.Objects: "4. インスタンス化"
```

## コア機能

ローダーシステムは、プロジェクト設定の検出、解析、インスタンス化を処理するいくつかの主要な関数によって構成されています。

### `load` 関数

これはローダーシステムのメインエントリポイントです。プロジェクトディレクトリ（または特定の `aigne.yaml` ファイル）へのパスとオプションオブジェクトを受け取り、完全に解決された `AIGNEOptions` オブジェクトを返します。このオブジェクトはすぐに使用できます。

```typescript
// From: packages/core/src/loader/index.ts

export async function load(path: string, options: LoadOptions = {}): Promise<AIGNEOptions> {
  // ... implementation
}
```

### `loadAgent` 関数

この関数は、単一の Agent をファイルからロードする役割を担います。ファイルタイプ（YAML または JavaScript/TypeScript）を自動的に検出し、適切なパーサーを使用します。

```typescript
// From: packages/core/src/loader/index.ts

export async function loadAgent(
  path: string,
  options?: LoadOptions,
  agentOptions?: AgentOptions,
): Promise<Agent> {
  // ... implementation
}
```

## プロジェクト設定: `aigne.yaml`

`aigne.yaml`（または `aigne.yml`）ファイルは、プロジェクト設定のルートです。ローダーは、指定されたパスでこのファイルを検索し、ロードプロセスを開始します。

### `aigne.yaml` スキーマ

`aigne.yaml` ファイルで定義できるトップレベルのプロパティは次のとおりです。

| キー | タイプ | 説明 |
| :--- | :--- | :--- |
| `name` | `string` | プロジェクトの名前。 |
| `description` | `string` | プロジェクトの簡単な説明。 |
| `model` | `string` or `object` | すべての Agent のデフォルトのチャットモデル設定。個々の Agent によって上書き可能です。 |
| `imageModel` | `string` or `object` | すべての Agent のデフォルトの画像モデル設定。 |
| `agents` | `string[]` | ロードする Agent 定義ファイルへのパスのリスト。 |
| `skills` | `string[]` | グローバルに利用可能にするスキル定義ファイルへのパスのリスト。 |
| `mcpServer` | `object` | MCP (Multi-agent Communication Protocol) サーバーの設定。公開する Agent のリストを含みます。 |
| `cli` | `object` | コマンドラインインターフェースの設定。チャット Agent と Agent コマンド構造を定義します。 |

### `aigne.yaml` の例

この例では、典型的なプロジェクト設定を示し、デフォルトモデルを定義し、ロードする様々な Agent とスキルをリストアップしています。

```yaml
name: test_aigne_project
description: A test project for the aigne agent
chat_model:
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
  - chat-with-prompt.yaml
  - team.yaml
  - image.yaml
  - agents/test-relative-prompt-paths.yaml
skills:
  - sandbox.js
mcp_server:
  agents:
    - chat.yaml
cli:
  agents:
    - chat.yaml
    - test-cli-agents/b.yaml
    - url: test-cli-agents/a.yaml
      name: a-renamed
      description: A agent from a.yaml
      alias: ["a", "a-agent"]
      agents:
        - url: test-cli-agents/a-1.yaml
          agents:
            - url: test-cli-agents/a-1-1.yaml
            - url: test-cli-agents/a-1-2.yaml
              name: a12-renamed
              description: A agent from a-1-2.yaml
        - test-cli-agents/a-2.yaml
```

## Agent の設定 (YAML)

Agent は AIGNE プラットフォームの基本的な構成要素です。宣言的で読みやすい形式の YAML ファイルで定義できます。

### 共通の Agent プロパティ

すべての Agent タイプは、共通のプロパティセットを共有します。

| キー | タイプ | 説明 |
| :--- | :--- | :--- |
| `name` | `string` | Agent の一意の名前。 |
| `description` | `string` | Agent の目的と能力に関する説明。 |
| `model` | `string` or `object` | この特定の Agent のデフォルトチャットモデルを上書きします。 |
| `inputSchema` | `string` or `object` | 期待される入力を定義する JSON スキーマファイルへのパス、またはインラインスキーマ。 |
| `outputSchema` | `string` or `object` | 期待される出力を定義する JSON スキーマファイルへのパス、またはインラインスキーマ。 |
| `skills` | `(string or object)[]` | この Agent が利用できるスキル（ツール）のリスト。スキルファイルへのパス、またはネストされた Agent 定義を指定できます。 |
| `memory` | `boolean` or `object` | Agent のメモリを有効にします。単純な `true` または高度な設定のためのオブジェクトを指定できます。 |
| `hooks` | `object` or `object[]` | ライフサイクルのさまざまな時点（例：`onStart`、`onSuccess`）で他の Agent をトリガーするフックを定義します。 |

### Agent タイプ

`type` プロパティは Agent の中核的な振る舞いを決定します。

#### 1. AI Agent (`type: "ai"`)

最も一般的なタイプで、汎用的な AI タスクに使用されます。大規模言語モデルを使用して指示を処理し、スキルと対話します。

-   **`instructions`**: Agent のプロンプトを定義します。文字列、`role` と `content` を持つオブジェクト、または `url` を使用したファイル参照が可能です。
-   **`inputKey`**: 入力オブジェクト内で、メインのユーザーメッセージとして扱われるべきキー。
-   **`toolChoice`**: Agent がツールをどのように使用するかを制御します（例：`auto`、`required`）。

**例:**

```yaml
name: chat-with-prompt
description: Chat agent
instructions:
  url: chat-prompt.md
input_key: message
memory: true
skills:
  - sandbox.js
```

#### 2. Image Agent (`type: "image"`)

プロンプトに基づいて画像を生成することに特化しています。

-   **`instructions`**: (必須) 画像生成に使用されるプロンプト。
-   **`modelOptions`**: 画像生成モデルに固有のオプションの辞書。

#### 3. Team Agent (`type: "team"`)

Agent（スキル）のグループを組織し、タスクに共同で取り組ませます。

-   **`mode`**: 処理モード（`parallel` や `sequential` など）。
-   **`iterateOn`**: スキルで処理する際、反復処理の対象となる入力からのキー。
-   **`reflection`**: `reviewer` Agent が出力を承認または変更要求を行うレビュープロセスを設定します。

#### 4. Transform Agent (`type: "transform"`)

JSONata 式を使用して入力データを変換します。

-   **`jsonata`**: (必須) 入力に適用する JSONata 式を含む文字列。

#### 5. MCP Agent (`type: "mcp"`)

外部の Agent またはサービスへのクライアントとして機能します。

-   **`url`**: 外部 Agent の URL。
-   **`command`**: 実行するシェルコマンド。

#### 6. Function Agent (`type: "function"`)

JavaScript/TypeScript ファイルでプログラム的に定義されます。このタイプは YAML ではなく、JS/TS ファイル自体で指定されます。