# モデル

モデルは、大規模言語モデル (LLM) や画像生成プラットフォームなどの外部 AI サービスと対話するための標準化されたインターフェースを提供する、重要な抽象化層として機能する特化した Agent です。モデルは API 通信の複雑さをカプセル化し、開発者が一貫性のある統一された契約を通じて様々な AI プロバイダーを扱えるようにします。

AIGNE フレームワークは、ベースとなる `Model` クラスを定義しており、これはテキストベースの対話型 AI のための `ChatModel` と、画像生成タスクのための `ImageModel` という2つの主要な特化クラスによって拡張されます。これらの抽象化は、`AIAgent` や `ImageAgent` のような高レベルの Agent が構築される基盤となります。

## コアコンセプト

`Model` 層は、異なる AI プロバイダーとの対話を合理化するために設計されています。OpenAI、Anthropic、Google Gemini のような各サービスに対してプロバイダー固有のコードを書く代わりに、標準化された `ChatModel` または `ImageModel` インターフェースと対話します。AIGNE フレームワークは、特定のモデルパッケージ (例: `@aigne/openai`) を通じて、この標準フォーマットとプロバイダーのネイティブ API との間の変換を処理します。

この設計には、いくつかの重要な利点があります:
- **プロバイダー非依存:** 最小限のコード変更で、基盤となる AI モデルを交換できます。例えば、モデルのインスタンス化を変更するだけで、OpenAI の GPT-4 から Anthropic の Claude 3 に切り替えることができます。
- **標準化されたデータ構造:** すべてのモデルは一貫した入出力スキーマ (`ChatModelInput`、`ImageModelOutput` など) を使用するため、データハンドリングと Agent の構成が簡素化されます。
- **シンプル化された API:** モデルは、各外部サービスの認証、リクエストフォーマット、エラーハンドリングの詳細を抽象化する、クリーンで高レベルな API を提供します。

以下の図は、ベースの `Agent`、`Model` の抽象化、そしてそれらが接続する外部 AI サービスとの関係を示しています。

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Models](assets/diagram/models-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## ChatModel 抽象化

`ChatModel` は、大規模言語モデル (LLM) とのインターフェースのために設計された抽象クラスです。マルチターンの対話、ツールの使用、構造化されたデータ抽出など、対話型のインタラクションを構造化された方法で処理する手段を提供します。

### ChatModelInput

`ChatModelInput` インターフェースは、言語モデルに送信されるリクエストのデータ構造を定義します。これにより、メッセージ、ツール、その他の設定がどのように渡されるかが標準化されます。

<x-field-group>
  <x-field data-name="messages" data-type="ChatModelInputMessage[]" data-required="true">
    <x-field-desc markdown>会話履歴と現在のプロンプトを形成するメッセージオブジェクトの配列です。</x-field-desc>
  </x-field>
  <x-field data-name="responseFormat" data-type="ChatModelInputResponseFormat" data-required="false">
    <x-field-desc markdown>モデルの出力に望ましい形式を指定します。例えば、プレーンテキストや提供されたスキーマに基づく構造化 JSON などです。</x-field-desc>
  </x-field>
  <x-field data-name="tools" data-type="ChatModelInputTool[]" data-required="false">
    <x-field-desc markdown>モデルがアクションの実行や情報の取得のために呼び出しをリクエストできる、利用可能なツール (関数) のリストです。</x-field-desc>
  </x-field>
  <x-field data-name="toolChoice" data-type="ChatModelInputToolChoice" data-required="false">
    <x-field-desc markdown>モデルが提供されたツールをどのように使用するかを制御します。`"auto"`、`"none"`、`"required"` に設定したり、特定の関数呼び出しを強制したりすることができます。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="ChatModelInputOptions" data-required="false">
    <x-field-desc markdown>`temperature`、`topP`、`parallelToolCalls` など、プロバイダー固有のオプションを格納するコンテナです。</x-field-desc>
  </x-field>
  <x-field data-name="outputFileType" data-type="'local' | 'file'" data-required="false">
    <x-field-desc markdown>ファイルベースの出力について、ローカルファイルパス (`local`) または base64 エンコードされた文字列 (`file`) のどちらの形式を望むかを指定します。</x-field-desc>
  </x-field>
</x-field-group>

#### ChatModelInputMessage

`messages` 配列内の各メッセージは、定義された構造に従います。

<x-field-group>
  <x-field data-name="role" data-type="'system' | 'user' | 'agent' | 'tool'" data-required="true">
    <x-field-desc markdown>メッセージ送信者の役割です。`system` は指示を提供し、`user` はユーザー入力を表し、`agent` はモデルの応答用、`tool` はツール呼び出しの出力用です。</x-field-desc>
  </x-field>
  <x-field data-name="content" data-type="string | UnionContent[]" data-required="false">
    <x-field-desc markdown>メッセージのコンテンツです。単純な文字列、またはテキストと画像 (`FileUnionContent`) を組み合わせたマルチモーダルコンテンツ用の配列にすることができます。</x-field-desc>
  </x-field>
  <x-field data-name="toolCalls" data-type="object[]" data-required="false">
    <x-field-desc markdown>`agent` メッセージ内で使用され、モデルによって開始された1つ以上のツール呼び出しを示します。</x-field-desc>
  </x-field>
  <x-field data-name="toolCallId" data-type="string" data-required="false">
    <x-field-desc markdown>`tool` メッセージ内で使用され、ツールの出力を対応する `toolCalls` リクエストにリンクさせます。</x-field-desc>
  </x-field>
</x-field-group>

### ChatModelOutput

`ChatModelOutput` インターフェースは、言語モデルから受け取った応答を標準化します。

<x-field-group>
  <x-field data-name="text" data-type="string" data-required="false">
    <x-field-desc markdown>モデルの応答のテキストベースのコンテンツです。</x-field-desc>
  </x-field>
  <x-field data-name="json" data-type="object" data-required="false">
    <x-field-desc markdown>`responseFormat` が `"json_schema"` に設定されている場合にモデルから返される JSON オブジェクトです。</x-field-desc>
  </x-field>
  <x-field data-name="toolCalls" data-type="ChatModelOutputToolCall[]" data-required="false">
    <x-field-desc markdown>モデルによって行われたツール呼び出しリクエストの配列です。各オブジェクトには関数名と引数が含まれます。</x-field-desc>
  </x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false">
    <x-field-desc markdown>`inputTokens` と `outputTokens` を含む、トークン使用統計を格納したオブジェクトです。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false">
    <x-field-desc markdown>応答を生成したモデルの識別子です。</x-field-desc>
  </x-field>
  <x-field data-name="files" data-type="FileUnionContent[]" data-required="false">
    <x-field-desc markdown>モデルによって生成されたファイルの配列です (もしあれば)。</x-field-desc>
  </x-field>
</x-field-group>

## ImageModel 抽象化

`ImageModel` は、画像生成モデルとのインターフェースのための抽象クラスです。テキストプロンプトに基づいて画像を作成または編集するための、簡素化された契約を提供します。

### ImageModelInput

`ImageModelInput` インターフェースは、画像生成タスクのリクエスト構造を定義します。

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true">
    <x-field-desc markdown>希望する画像のテキストによる説明です。</x-field-desc>
  </x-field>
  <x-field data-name="image" data-type="FileUnionContent[]" data-required="false">
    <x-field-desc markdown>オプションの入力画像の配列で、画像編集やバリエーション作成などのタスクに使用されます。</x-field-desc>
  </x-field>
  <x-field data-name="n" data-type="number" data-required="false">
    <x-field-desc markdown>生成する画像の数です。デフォルトは 1 です。</x-field-desc>
  </x-field>
  <x-field data-name="outputFileType" data-type="'local' | 'file'" data-required="false">
    <x-field-desc markdown>出力画像をローカルファイル (`local`) として保存するか、base64 エンコードされた文字列 (`file`) として返すかを指定します。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="ImageModelInputOptions" data-required="false">
    <x-field-desc markdown>画像の寸法、品質、スタイルプリセットなど、プロバイダー固有のオプションを格納するコンテナです。</x-field-desc>
  </x-field>
</x-field-group>

### ImageModelOutput

`ImageModelOutput` インターフェースは、画像生成サービスからの応答構造を定義します。

<x-field-group>
  <x-field data-name="images" data-type="FileUnionContent[]" data-required="true">
    <x-field-desc markdown>生成された画像の配列です。各要素のフォーマットは、入力で指定された `outputFileType` に依存します。</x-field-desc>
  </x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false">
    <x-field-desc markdown>使用統計を含むオブジェクトで、トークン数やその他のプロバイダー固有のメトリクスが含まれる場合があります。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false">
    <x-field-desc markdown>画像を生成したモデルの識別子です。</x-field-desc>
  </x-field>
</x-field-group>

## ファイルコンテンツタイプ

モデルは `FileUnionContent` 型を通じて、マルチモーダルタスクのための様々な形式のファイル入力を処理します。この判別共用体により、ファイルを3つの方法で表現できます:

-   **`LocalContent`**: ローカルファイルシステムに保存されているファイルを表します。
    -   `type`: "local"
    -   `path`: ファイルへの絶対パス。
-   **`UrlContent`**: 公開 URL 経由でアクセス可能なファイルを表します。
    -   `type`: "url"
    -   `url`: ファイルの URL。
-   **`FileContent`**: base64 エンコードされた文字列としてのファイルを表します。
    -   `type`: "file"
    -   `data`: ファイルの base64 エンコードされたコンテンツ。

`Model` ベースクラスには `transformFileType` メソッドが含まれており、必要に応じてこれらのフォーマット間で自動的に変換できるため、異なる Agent やモデルプロバイダー間でのファイルハンドリングが簡素化されます。

## まとめ

`ChatModel` と `ImageModel` の抽象化は、AIGNE フレームワークを柔軟かつプロバイダー非依存にするコアコンポーネントです。これらは、広範な外部 AI サービスと対話するための、安定した標準化されたインターフェースを提供します。

-   これらのモデルを実際に使用する方法については、[AI Agent](./developer-guide-agents-ai-agent.md) と [Image Agent](./developer-guide-agents-image-agent.md) のドキュメントを参照してください。
-   OpenAI、Anthropic、Google Gemini のような特定のプロバイダーの設定詳細については、[モデル](./models.md) セクションのガイドを参照してください。