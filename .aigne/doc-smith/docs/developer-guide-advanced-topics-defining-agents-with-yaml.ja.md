# YAMLによるAgentの定義

AIGNEフレームワークは、YAML設定ファイルを使用したAgentの宣言的な定義アプローチをサポートしています。この方法では、Agentの定義（プロパティ、指示、スキル）をアプリケーションのビジネスロジックから分離し、複雑なAgentシステムのより良い整理、再利用性、および容易な管理を促進します。

このガイドでは、さまざまなAgentタイプとそのプロパティを定義するためのYAML構文の包括的な概要を説明します。

## 基本構造

すべてのAgent定義は、そのタイプに関わらず、`.yaml`ファイル内に含まれます。`type`属性は、Agentの動作と必要なプロパティを決定する主要な識別子です。`type`が省略された場合、デフォルトで`ai`になります。

以下は、AI Agent設定の基本的な例です。

```yaml chat.yaml
name: Basic Chat Agent
description: A simple agent that responds to user messages.
type: ai
instructions: "You are a helpful assistant. Respond to the user's message concisely."
input_key: message
skills:
  - my-skill.js
```

### コアプロパティ

以下のプロパティは、ほとんどのAgentタイプで共通です。

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="false">
    <x-field-desc markdown>Agentの人間が判読可能な名前。</x-field-desc>
  </x-field>
  <x-field data-name="description" data-type="string" data-required="false">
    <x-field-desc markdown>Agentの目的と能力に関する簡単な説明。</x-field-desc>
  </x-field>
  <x-field data-name="type" data-type="string" data-required="false" data-default="ai">
    <x-field-desc markdown>Agentのタイプを指定します。必須フィールドと動作を決定します。有効なタイプには `ai`、`image`、`team`、`transform`、`mcp`、`function` が含まれます。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="object | string" data-required="false">
    <x-field-desc markdown>Agentが使用するチャットモデルの設定で、グローバルに定義されたモデルを上書きします。文字列または詳細なオブジェクトを指定できます。</x-field-desc>
  </x-field>
  <x-field data-name="skills" data-type="array" data-required="false">
    <x-field-desc markdown>このAgentがツールとして使用できる他のAgentまたはJavaScript/TypeScript関数のリスト。各スキルはファイルパスで参照されます。</x-field-desc>
  </x-field>
  <x-field data-name="inputSchema" data-type="object | string" data-required="false">
    <x-field-desc markdown>期待される入力構造を定義するJSONスキーマ。インラインオブジェクトまたは外部の `.json` や `.yaml` ファイルへのパスを指定できます。</x-field-desc>
  </x-field>
  <x-field data-name="outputSchema" data-type="object | string" data-required="false">
    <x-field-desc markdown>Agentの出力を構造化するためのJSONスキーマ。インラインオブジェクトまたは外部ファイルへのパスを指定できます。これは構造化された出力を可能にするために重要です。</x-field-desc>
  </x-field>
  <x-field data-name="memory" data-type="boolean | object" data-required="false">
    <x-field-desc markdown>Agentの状態保持を有効にします。デフォルトのメモリを使用する場合は `true` に設定するか、特定のプロバイダー用の設定オブジェクトを提供します。</x-field-desc>
  </x-field>
  <x-field data-name="hooks" data-type="array" data-required="false">
    <x-field-desc markdown>実行の異なる段階で他のAgentをトリガーするライフサイクルフック（`onStart`、`onSuccess`、`onError`、`onEnd`）を定義します。</x-field-desc>
  </x-field>
</x-field-group>

## 外部プロンプトとスキーマの読み込み

クリーンでモジュール化された設定を維持するために、Agentの指示とスキーマを外部ファイルから読み込むことができます。これは、複雑なプロンプトや再利用可能なデータ構造に特に便利です。

### 外部の指示

`ai` および `image` Agentでは、指示が長くなることがあります。これらを別のMarkdownまたはテキストファイルで定義し、`url`キーを使用して参照できます。

```yaml chat-with-prompt.yaml
name: chat-with-prompt
description: An AI agent with instructions loaded from an external file.
type: ai
instructions:
  url: prompts/main-prompt.md
input_key: message
memory: true
skills:
  - skills/sandbox.js
```

`main-prompt.md`ファイルには、Agentのシステムプロンプトとして使用される生のテキストが含まれています。

```markdown prompts/main-prompt.md
You are a master programmer. When the user asks for code, provide a complete, runnable example and explain the key parts.
```

異なるロールを持つマルチパートプロンプトを構築することもできます。

```yaml multi-role-prompt.yaml
instructions:
  - role: system
    url: prompts/system-role.md
  - role: user
    content: "Here is an example of a good response:"
  - role: assistant
    url: prompts/example-response.md
```

### 外部スキーマ

同様に、`inputSchema`と`outputSchema`は、スキーマ構造を定義する外部のJSONまたはYAMLファイルを参照できます。

```yaml structured-output-agent.yaml
name: JSON Extractor
type: ai
instructions: Extract the user's name and email from the text.
outputSchema: schemas/user-schema.yaml
```

`user-schema.yaml`ファイルには、JSONスキーマの定義が含まれます。

```yaml schemas/user-schema.yaml
type: object
properties:
  name:
    type: string
    description: The full name of the user.
  email:
    type: string
    description: The email address of the user.
required:
  - name
  - email
```

## Agentタイプ別の詳細

以下のセクションでは、各Agentタイプ固有の設定プロパティについて詳しく説明します。

### AI Agent (`type: ai`)

`AIAgent`は最も一般的なタイプで、言語モデルとの汎用的な対話のために設計されています。

```yaml ai-agent-example.yaml
type: ai
name: Customer Support AI
instructions:
  url: prompts/support-prompt.md
input_key: customer_query
output_key: response
# モデルに特定のスキルを呼び出すように強制する
tool_choice: "sandbox"
outputSchema: schemas/support-response.yaml
skills:
  - sandbox.js
```

<x-field-group>
  <x-field data-name="instructions" data-type="string | object | array" data-required="false">
    <x-field-desc markdown>AIモデルへのシステムプロンプトまたは指示。単純な文字列、外部ファイルへの参照（`url`）、またはメッセージオブジェクト（`role`、`content`/`url`）の配列を指定できます。</x-field-desc>
  </x-field>
  <x-field data-name="inputKey" data-type="string" data-required="false">
    <x-field-desc markdown>入力オブジェクト内で、モデルに送信される主要なユーザーメッセージを含むキー。</x-field-desc>
  </x-field>
  <x-field data-name="outputKey" data-type="string" data-required="false">
    <x-field-desc markdown>AIの最終的なテキスト応答が配置される出力オブジェクトのキー。</x-field-desc>
  </x-field>
  <x-field data-name="toolChoice" data-type="string" data-required="false">
    <x-field-desc markdown>モデルに特定のスキル（ツール）の使用を強制します。値はAgentにアタッチされたスキルの名前と一致する必要があります。</x-field-desc>
  </x-field>
</x-field-group>

### Team Agent (`type: team`)

`TeamAgent`は、子Agent（`skills`で定義）のコレクションを調整して、マルチステップのタスクを実行します。

```yaml team-agent-example.yaml
type: team
name: Research and Write Team
# Agentは次々に実行されます
mode: sequential
# このチームの出力は、すべてのステップの出力を集めたものになります
include_all_steps_output: true
skills:
  - url: agents/researcher.yaml
  - url: agents/writer.yaml
  - url: agents/editor.yaml
```

<x-field-group>
  <x-field data-name="mode" data-type="string" data-required="false" data-default="sequential">
    <x-field-desc markdown>チームの実行モード。`sequential`（Agentが順次実行）または`parallel`（Agentが並行実行）を指定できます。</x-field-desc>
  </x-field>
  <x-field data-name="iterateOn" data-type="string" data-required="false">
    <x-field-desc markdown>配列を含む入力オブジェクトのキー。チームは配列内の各アイテムに対してワークフローを実行します。</x-field-desc>
  </x-field>
  <x-field data-name="reflection" data-type="object" data-required="false">
    <x-field-desc markdown>`reviewer` Agentが出力を検査し、出力が承認されるまで再実行をトリガーできる自己修正ループを設定します。</x-field-desc>
  </x-field>
</x-field-group>

### Image Agent (`type: image`)

`ImageAgent`は、画像モデルを使用して画像を生成することに特化しています。

```yaml image-agent-example.yaml
type: image
name: Logo Generator
instructions: "A minimalist, flat-design logo for a tech startup named 'Innovate'."
# 画像モデルプロバイダーに特定のオプションを渡す
model_options:
  quality: hd
  style: vivid
```

<x-field-group>
  <x-field data-name="instructions" data-type="string | object" data-required="true">
    <x-field-desc markdown>望ましい画像を説明するプロンプト。AI Agentとは異なり、これは必須フィールドです。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>画像生成を制御するためのプロバイダー固有のオプションのキーと値のマップ（例：`quality`、`style`、`size`）。</x-field-desc>
  </x-field>
</x-field-group>

### Transform Agent (`type: transform`)

`TransformAgent`は、[JSONata](https://jsonata.org/)式を使用して、コードを書かずに宣言的にJSONデータをマッピング、フィルタリング、または再構築します。

```yaml transform-agent-example.yaml
type: transform
name: User Formatter
description: Extracts and formats user names from a list.
jsonata: "payload.users.{'name': firstName & ' ' & lastName}"
```

<x-field-group>
  <x-field data-name="jsonata" data-type="string" data-required="true">
    <x-field-desc markdown>入力データに対して実行するJSONata式。</x-field-desc>
  </x-field>
</x-field-group>

## まとめ

YAMLによるAgentの定義は、プログラムによる定義に代わる強力で宣言的な方法を提供します。これにより、関心事の明確な分離、再利用性の向上、Agent設定の管理の簡素化が可能になります。プロンプトやスキーマに外部ファイルを利用することで、複雑でモジュール化され、保守性の高いAIシステムを構築できます。

より実践的な例については、[高度なトピック](./developer-guide-advanced-topics.md)セクションの他のガイドを参照してください。