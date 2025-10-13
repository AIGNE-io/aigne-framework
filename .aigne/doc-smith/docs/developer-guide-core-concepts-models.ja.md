このドキュメントでは、大規模言語モデル (LLM) との対話における基本的なコンポーネントである `ChatModel` クラスについて詳しく解説します。クラスのアーキテクチャ、入出力形式、そしてツール呼び出しや構造化データ処理などの強力な機能を可能にする関連データ構造について説明します。

```d2
direction: down

User-Application: {
  label: "ユーザー / アプリケーション"
  shape: c4-person
}

ChatModel-System: {
  label: "ChatModel システム"
  shape: rectangle

  ChatModel: {
    label: "ChatModel インスタンス"
  }

  LLM: {
    label: "大規模言語モデル"
    shape: cylinder
  }

  Tools: {
    label: "ツール / 関数"
  }
}

User-Application -> ChatModel-System.ChatModel: "1. invoke(Input)"
ChatModel-System.ChatModel -> ChatModel-System.LLM: "2. Send Formatted Request"
ChatModel-System.LLM -> ChatModel-System.ChatModel: "3. Receive LLM Response"

# パスA: シンプルなテキスト応答
ChatModel-System.ChatModel -> User-Application: "4a. Return Output with Text"

# パスB: ツール呼び出し応答
ChatModel-System.ChatModel -> ChatModel-System.Tools: "4b. Execute Tool Call"
ChatModel-System.Tools -> ChatModel-System.ChatModel: "5b. Return Tool Result"
ChatModel-System.ChatModel -> ChatModel-System.LLM: "6b. Send Result for Final Answer"
ChatModel-System.LLM -> ChatModel-System.ChatModel: "7b. Receive Final Response"
ChatModel-System.ChatModel -> User-Application: "8b. Return Final Output"
```

## ChatModel

`ChatModel` クラスは、大規模言語モデル (LLM) との対話のために設計された抽象基底クラスです。これは `Agent` クラスを拡張し、モデルの入力、出力、および機能を管理するための標準化されたインターフェースを提供します。特定のモデル (例: OpenAI, Anthropic) の具体的な実装は、このクラスを継承する必要があります。

### コアコンセプト

- **拡張性**: `ChatModel` は拡張可能に設計されており、開発者は抽象メソッド `process` を実装することで、さまざまな LLM 用のカスタムコネクタを作成できます。
- **統一インターフェース**: ストリーミングと非ストリーミングの両方の応答に対して一貫した API を提供し、異なるモデルとの対話を簡素化します。
- **ツール統合**: このクラスはツール呼び出しの組み込みサポートを提供し、モデルが外部の関数やデータソースと対話できるようにします。
- **構造化出力**: `ChatModel` はモデルの出力に JSON スキーマの準拠を強制でき、信頼性の高い構造化データを保証します。
- **自動リトライ**: ネットワークエラーや構造化出力生成の問題に対処するためのデフォルトのリトライメカニズムが含まれています。

### 主要なメソッド

#### `constructor(options?: ChatModelOptions)`

`ChatModel` の新しいインスタンスを作成します。

<x-field-group>
  <x-field data-name="options" data-type="ChatModelOptions" data-required="false" data-desc="Agent の設定オプション。">
    <x-field data-name="model" data-type="string" data-required="false" data-desc="使用するモデルの名前または識別子。"></x-field>
    <x-field data-name="modelOptions" data-type="ChatModelInputOptions" data-required="false" data-desc="各呼び出しでモデルに渡すデフォルトのオプション。"></x-field>
    <x-field data-name="retryOnError" data-type="boolean | object" data-required="false" data-desc="エラー時のリトライ設定。デフォルトでは、ネットワークエラーと構造化出力エラーに対して3回リトライします。"></x-field>
  </x-field>
</x-field-group>

#### `process(input: ChatModelInput, options: AgentInvokeOptions)`

すべてのサブクラスで実装する必要がある中心的な抽象メソッドです。リクエストの送信やレスポンスの処理など、基盤となる LLM との直接的な通信を処理します。

<x-field-group>
  <x-field data-name="input" data-type="ChatModelInput" data-required="true" data-desc="メッセージ、ツール、モデルオプションを含む標準化された入力。"></x-field>
  <x-field data-name="options" data-type="AgentInvokeOptions" data-required="true" data-desc="コンテキストや制限など、Agent 呼び出しのオプション。"></x-field>
</x-field-group>

#### `preprocess(input: ChatModelInput, options: AgentInvokeOptions)`

メインの `process` メソッドが呼び出される前に操作を実行します。これには、トークン制限の検証や、LLM と互換性のあるツール名の正規化が含まれます。

#### `postprocess(input: ChatModelInput, output: ChatModelOutput, options: AgentInvokeOptions)`

`process` メソッドが完了した後に操作を実行します。その主な役割は、呼び出しコンテキスト内のトークン使用統計を更新することです。

### 入力データ構造

#### `ChatModelInput`

`ChatModel` のメイン入力インターフェース。

<x-field-group>
  <x-field data-name="messages" data-type="ChatModelInputMessage[]" data-required="true" data-desc="モデルに送信されるメッセージの配列。"></x-field>
  <x-field data-name="responseFormat" data-type="ChatModelInputResponseFormat" data-required="false" data-desc="希望する出力形式 (例: テキストまたは JSON) を指定します。"></x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false" data-desc="ファイル出力の希望する形式 ('local' または 'file')。"></x-field>
  <x-field data-name="tools" data-type="ChatModelInputTool[]" data-required="false" data-desc="モデルが使用できるツールのリスト。"></x-field>
  <x-field data-name="toolChoice" data-type="ChatModelInputToolChoice" data-required="false" data-desc="ツール選択の戦略 (例: 'auto', 'required')。"></x-field>
  <x-field data-name="modelOptions" data-type="ChatModelInputOptions" data-required="false" data-desc="モデル固有の設定オプション。"></x-field>
</x-field-group>

#### `ChatModelInputMessage`

会話履歴内の単一のメッセージを表します。

<x-field-group>
    <x-field data-name="role" data-type="Role" data-required="true" data-desc="メッセージ作成者のロール ('system'、'user'、'agent'、または 'tool')。"></x-field>
    <x-field data-name="content" data-type="ChatModelInputMessageContent" data-required="false" data-desc="メッセージの内容。文字列またはリッチコンテンツの配列を指定できます。"></x-field>
    <x-field data-name="toolCalls" data-type="object[]" data-required="false" data-desc="'agent' ロールの場合、モデルによって要求されたツール呼び出しのリスト。"></x-field>
    <x-field data-name="toolCallId" data-type="string" data-required="false" data-desc="'tool' ロールの場合、このメッセージが応答するツール呼び出しの ID。"></x-field>
</x-field-group>

#### `ChatModelInputTool`

モデルが呼び出すことができるツールを定義します。

<x-field-group>
    <x-field data-name="type" data-type="'function'" data-required="true" data-desc="ツールのタイプ。現在サポートされているのは 'function' のみです。"></x-field>
    <x-field data-name="function" data-type="object" data-required="true" data-desc="関数の定義。">
        <x-field data-name="name" data-type="string" data-required="true" data-desc="関数の名前。"></x-field>
        <x-field data-name="description" data-type="string" data-required="false" data-desc="関数が何をするかの説明。"></x-field>
        <x-field data-name="parameters" data-type="object" data-required="true" data-desc="関数のパラメータを定義する JSON スキーマオブジェクト。"></x-field>
    </x-field>
</x-field-group>

### 出力データ構造

#### `ChatModelOutput`

`ChatModel` のメイン出力インターフェース。

<x-field-group>
  <x-field data-name="text" data-type="string" data-required="false" data-desc="モデルからのテキスト応答。"></x-field>
  <x-field data-name="json" data-type="object" data-required="false" data-desc="JSON スキーマが要求された場合の、モデルからの JSON 応答。"></x-field>
  <x-field data-name="toolCalls" data-type="ChatModelOutputToolCall[]" data-required="false" data-desc="モデルが実行したいツール呼び出しのリスト。"></x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false" data-desc="呼び出しのトークン使用統計。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="応答を生成したモデルの名前。"></x-field>
  <x-field data-name="files" data-type="FileUnionContent[]" data-required="false" data-desc="モデルによって生成されたファイルのリスト。"></x-field>
</x-field-group>

#### `ChatModelOutputToolCall`

モデルによって要求された単一のツール呼び出しを表します。

<x-field-group>
    <x-field data-name="id" data-type="string" data-required="true" data-desc="このツール呼び出しの一意の識別子。"></x-field>
    <x-field data-name="type" data-type="'function'" data-required="true" data-desc="ツールのタイプ。"></x-field>
    <x-field data-name="function" data-type="object" data-required="true" data-desc="関数呼び出しの詳細。">
        <x-field data-name="name" data-type="string" data-required="true" data-desc="呼び出す関数の名前。"></x-field>
        <x-field data-name="arguments" data-type="Message" data-required="true" data-desc="関数に渡す引数。JSON オブジェクトとして解析されます。"></x-field>
    </x-field>
</x-field-group>

#### `ChatModelOutputUsage`

トークン消費に関する情報を提供します。

<x-field-group>
    <x-field data-name="inputTokens" data-type="number" data-required="true" data-desc="入力プロンプトで使用されたトークンの数。"></x-field>
    <x-field data-name="outputTokens" data-type="number" data-required="true" data-desc="出力で生成されたトークンの数。"></x-field>
    <x-field data-name="aigneHubCredits" data-type="number" data-required="false" data-desc="AIGNE Hub サービスを使用した場合に消費されるクレジット。"></x-field>
</x-field-group>