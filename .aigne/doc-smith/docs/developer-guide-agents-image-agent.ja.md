# Image Agent

`ImageAgent` は、画像の生成を担当する特殊な Agent です。`ImageModel` へのインターフェースとして機能し、入力データを処理してプロンプトを形成し、画像生成サービスに画像の作成を要求します。

この Agent は、テキスト記述に基づいて視覚コンテンツを動的に作成する必要があるあらゆるワークフローに不可欠です。`PromptBuilder` を活用してプロンプトを構築し、テンプレートを使用して可変入力から画像を生成できます。

<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->
![Image Agent](assets/diagram/image-agent-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 設定

`ImageAgent` は、TypeScript を使用してプログラムで設定するか、YAML を使用して宣言的に設定できます。どちらの方法でも、画像生成のための指示を定義し、オプションでモデル固有のパラメーターを指定する必要があります。

### TypeScript での設定

TypeScript で `ImageAgent` を作成するには、静的メソッド `ImageAgent.from()` を使用し、`ImageAgentOptions` を提供します。

```typescript "ImageAgent の設定" icon=logos:typescript
import { AIGNE, ImageAgent } from "@aigne/core";
import { OpenAI } from "@aigne/openai";

// 画像モデルプロバイダーを設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ImageAgent のインスタンスを作成
const architectAgent = ImageAgent.from({
  name: "architect",
  description: "An agent that draws architectural diagrams.",
  instructions: "Create an architectural diagram of a {{subject}}.",
  modelOptions: {
    quality: "hd",
    style: "vivid",
  },
});

// AIGNE インスタンスには imageModel が設定されている必要があります
const aigne = new AIGNE({
  imageModel: openai.image("dall-e-3"),
});

async function run() {
  const result = await aigne.invoke(architectAgent, {
    input: {
      subject: "microservices application",
    },
  });

  console.log(result);
}

run();
```

上記のコードは、「architect」という名前の `ImageAgent` を定義しています。テンプレート化された `instructions` 文字列を使用してプロンプトを生成します。`modelOptions` オブジェクトは、高解像度で鮮やかな画像を要求するために、基盤となる DALL-E 3 モデルに特定のパラメーターを渡します。

### YAML での設定

または、`.yaml` ファイルで `ImageAgent` を定義することもできます。このアプローチは、Agent の定義をアプリケーションロジックから分離するのに役立ちます。

```yaml "image-agent.yaml" icon=logos:yaml
type: image
name: style-artist
description: 特定のスタイルのオブジェクトの画像を描画します。
instructions: |
  Draw an image of a {{object}} in the {{style}} style.
input_schema:
  type: object
  properties:
    object:
      type: string
      description: 描画するオブジェクト。
    style:
      type: string
      description: 画像のスタイル。
  required:
    - object
    - style
```

この宣言的な例では、`type: image` はこれが `ImageAgent` であることを指定します。`instructions` フィールドには、呼び出し時に入力から入力されるプレースホルダー (`{{object}}`、`{{style}}`) を含む複数行の文字列が含まれています。`input_schema` は、期待される入力構造を正式に定義します。

## パラメーター

`ImageAgent` の動作は、構築時に提供されるオプションによって制御されます。

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="true">
    <x-field-desc markdown>画像生成に使用されるプロンプトテンプレートです。これは単純な文字列、またはより複雑なロジックのための `PromptBuilder` インスタンスにすることができます。`{{key}}` 形式のプレースホルダーは、入力オブジェクトの値に置き換えられます。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="Record<string, any>" data-required="false">
    <x-field-desc markdown>基盤となる `ImageModel` に渡すプロバイダー固有のパラメーターを含むオブジェクトです。これにより、画質、サイズ、スタイルなどの生成プロセスを詳細に制御できます。利用可能なオプションについては、特定のモデルプロバイダーのドキュメントを参照してください。</x-field-desc>
  </x-field>
  <x-field data-name="outputFileType" data-type="'url' | 'base64'" data-required="false">
    <x-field-desc markdown>出力画像の希望する形式を指定します。デフォルトの動作は `ImageModel` によって決定されますが、公開 URL (`url`) または Base64 エンコードされた文字列 (`base64`) のいずれかを明示的にリクエストできます。</x-field-desc>
  </x-field>
</x-field-group>

## 呼び出しと出力

`ImageAgent` が呼び出されると、入力がその `PromptBuilder` に渡され、最終的なプロンプトが生成されます。次に、このプロンプトと指定された `modelOptions` を使用して、設定済みの `ImageModel` を呼び出します。

Agent の出力は `ImageModelOutput` スキーマに準拠したオブジェクトで、生成された画像が要求された形式で含まれています。

**呼び出し例**

```typescript "Agent の呼び出し" icon=logos:typescript
const result = await aigne.invoke(styleArtistAgent, { // styleArtistAgent が YAML からロードされていると仮定
  input: {
    object: "futuristic city",
    style: "cyberpunk",
  },
});
```

**レスポンス例**

```json "ImageAgent の出力" icon=mdi:code-json
{
  "url": "https://oaidalleapiprodscus.blob.core.windows.net/private/...",
  "base64": null
}
```

レスポンスには、生成された画像を指す `url` が含まれています。`outputFileType` が `'base64'` に設定されていた場合、代わりに `base64` フィールドが入力されます。

## 概要

`ImageAgent` は、画像生成機能を AI ワークフローに統合するための構造化された再利用可能な方法を提供します。プロンプトのロジックをモデルとのインタラクションから分離することで、明確で保守しやすい Agent の設計が可能になります。

他の Agent タイプに関する詳細については、以下のドキュメントを参照してください。
- [AI Agent](./developer-guide-agents-ai-agent.md): 言語モデルと対話するため。
- [Team Agent](./developer-guide-agents-team-agent.md): 複数の Agent を調整するため。
- [Function Agent](./developer-guide-agents-function-agent.md): カスタムコードを Agent としてラップするため。