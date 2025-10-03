---
labels: ["Reference"]
---

---
labels: ["リファレンス"]
---

# プロジェクト設定 (aigne.yaml)

`aigne.yaml`ファイルは、AIGNEプロジェクトの中心です。これは中心的なマニフェストとして機能し、プロジェクトのメタデータ、言語モデルの設定、およびagentやスキルといったコアコンポーネント間の関係を定義します。適切に構造化された`aigne.yaml`は、強力で整理されたagentを構築するための第一歩です。

このファイルは、人間が読みやすく、書きやすいように設計されたYAML形式を使用しています。

## コア設定キー

典型的な`aigne.yaml`ファイルに含まれる主要なセクションを詳しく見ていきましょう。

### プロジェクトのメタデータ

これらのフィールドは、プロジェクトに関する基本情報を提供します。

<x-field data-name="name" data-type="string" data-required="true" data-desc="プロジェクトの一意の識別子。"></x-field>
<x-field data-name="description" data-type="string" data-required="false" data-desc="プロジェクトの機能の簡単な要約。"></x-field>

```yaml aigne.yaml icon=mdi:file-document
name: test_aigne_project
description: A test project for the aigne agent
```

### チャットモデル (`chat_model`)

これは、agentを動かす大規模言語モデル（LLM）を設定する重要なセクションです。AIGNEは、モデルプロバイダー、名前、その他のパラメータを柔軟に定義する方法を提供します。

| キー | タイプ | 説明 |
|---|---|---|
| `provider` | string | LLMプロバイダー（例：`openai`）。`model`キーのプレフィックスとしても指定できます。 |
| `name` / `model` | string | 使用する特定のモデル（例：`gpt-4o-mini`）。 |
| `temperature` | number | モデルの出力のランダム性を制御する0から2までの値。値が大きいほど、より創造的な応答になります。 |

モデルを設定する一般的な方法をいくつか紹介します。

**例1：`provider`と`name`を使用**

これは、モデルを明確かつ明示的に定義する方法です。

```yaml aigne.yaml icon=mdi:file-document
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
```

**例2：プレフィックス付きの`model`キーを使用**

これは、より簡潔なショートハンド形式です。

```yaml aigne.yaml icon=mdi:file-document
chat_model:
  model: openai:gpt-4o-mini
  temperature: 0.8
```

### Agent (`agents`)

`agents`キーは、プロジェクトに含まれるすべてのagent定義ファイル（`.yaml`）をリストします。ここにリストされた各ファイルは、特定のagentの振る舞い、プロンプト、およびツールの使用法を定義します。

```yaml aigne.yaml icon=mdi:file-document
# ... other configurations
agents:
  - chat.yaml
```

### スキル (`skills`)

`skills`キーは、agentにツールと機能を提供する実行可能なコードまたは定義をリストします。これらは、関数を含むJavaScriptファイル（`.js`）や、複雑なスキルを定義する他のYAMLファイルにすることができます。

```yaml aigne.yaml icon=mdi:file-document
# ... other configurations
skills:
  - sandbox.js
  - filesystem.yaml
```

### サービスとCLIの公開

サーバー経由またはコマンドラインツールとして、agentを外部に公開する方法も設定できます。

- `mcp_server`: `aigne serve-mcp`コマンドを実行したときに、モデルコンテキストプロトコル（MCP）を介して提供されるagentを設定します。
- `cli`: コマンドラインから直接実行できるagentを設定します。

```yaml aigne.yaml icon=mdi:file-document
# ... other configurations
mcp_server:
  agents:
    - chat.yaml

cli:
  agents:
    - chat.yaml
```

## 完全な例

以下は、これらすべての要素をまとめた完全な`aigne.yaml`ファイルです。

```yaml aigne.yaml icon=mdi:file-document
name: test_aigne_project
description: A test project for the aigne agent

chat_model:
  model: openai:gpt-4o-mini
  temperature: 0.8

agents:
  - chat.yaml

skills:
  - sandbox.js

mcp_server:
  agents:
    - chat.yaml

cli:
  agents:
    - chat.yaml
```

この設定ファイルがあれば、プロジェクトの強固な基盤ができます。次のステップは、agentとスキルが実際に何をするかを定義することです。

---

プロジェクトの設定方法を理解したところで、コアコンポーネントをさらに詳しく見ていきましょう。次のセクションに進み、[Agentとスキル](./core-concepts-agents-and-skills.md)について学びましょう。