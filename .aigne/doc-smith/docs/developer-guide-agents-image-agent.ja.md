# ImageAgent

`ImageAgent` は、テキストの指示から画像を生成しやすくするために、ベースの `Agent` クラスを拡張した特殊な Agent です。基盤となる `ImageModel` と統合し、動的な入力に基づいて視覚コンテンツを作成します。

この Agent は、アバターの生成、芸術的なイラスト、またはデータに基づく視覚化など、自動化された画像作成を必要とするタスクに最適です。

## 仕組み

`ImageAgent` は、これらの主要コンポーネントを通じて画像生成プロセスを調整します。

1.  **PromptBuilder**: `PromptBuilder` を使用して、画像モデル用の詳細なプロンプトを構築します。初期化時に提供される `instructions` はテンプレートとして機能し、入力からの動的データで埋めることができます。
2.  **ImageModel**: 実行コンテキストで `ImageModel` が利用可能である必要があります。このモデルは、`PromptBuilder` から受け取ったプロンプトに基づいて、実際の画像レンダリングを担当します。
3.  **処理**: Agent が呼び出されると、その `process` メソッドが最終的なプロンプトを構築し、プロンプトと指定されたモデルオプションで `ImageModel` を呼び出し、生成された画像出力を返します。

この図は、`ImageAgent` とその主要な依存関係との関係を示しています。

```d2
direction: down

ImageAgent: {
  label: "ImageAgent"
  shape: rectangle
}

PromptBuilder: {
  label: "PromptBuilder"
  shape: rectangle
}

ImageModel: {
  label: "ImageModel\n（実行コンテキストから）"
  shape: rectangle
}

ImageAgent -> PromptBuilder: "1. instructions を使用してプロンプトを構築"
ImageAgent -> ImageModel: "2. プロンプトとオプションで呼び出す"
ImageModel -> ImageAgent: "3. 生成された画像を返す"
```

## クラス定義

`ImageAgent` クラスは、画像生成 Agent を作成および設定するための主要なインターフェースを提供します。

### `ImageAgent.from(options)`

`ImageAgent` の新しいインスタンスを作成するための静的メソッド。

**パラメータ**

<x-field-group>
  <x-field data-name="options" data-type="ImageAgentOptions" data-required="true" data-desc="Agent の設定オプション。"></x-field>
</x-field-group>

**戻り値**

<x-field data-name="" data-type="ImageAgent" data-desc="ImageAgent の新しいインスタンス。"></x-field>

### `new ImageAgent(options)`

`ImageAgent` クラスのコンストラクタ。

**パラメータ**

<x-field-group>
  <x-field data-name="options" data-type="ImageAgentOptions" data-required="true" data-desc="Agent の設定オプション。"></x-field>
</x-field-group>

## `ImageAgentOptions`

`ImageAgent` を設定するためのオプションオブジェクト。これはベースの `AgentOptions` を拡張します。

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="true" data-desc="画像の生成指示を定義する文字列テンプレートまたは `PromptBuilder` インスタンス。プレースホルダーを使用して入力データを挿入できます（例：`{{object}}`）。"></x-field>
  <x-field data-name="modelOptions" data-type="Record<string, any>" data-required="false" data-desc="基盤となる画像モデルに直接渡すオプションの辞書。これにより、生成プロセスを細かく制御できます（例：解像度、品質）。"></x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false" data-desc="出力画像の希望ファイル形式を指定します（例：'png'、'jpeg'）。"></x-field>
</x-field-group>

## 使用例

`ImageAgent` は、TypeScript を使用してプログラム的に、または YAML を使用して宣言的に定義および使用できます。

### プログラマティックな使用法（TypeScript）

以下は、コードで `ImageAgent` を作成して呼び出す方法です。

```typescript
import { ImageAgent } from "@AIGNE/core"; // AIGNE がパッケージ名であると仮定

// 1. ImageAgent のインスタンスを作成
const drawingAgent = new ImageAgent({
  name: "drawing-agent",
  description: "An agent that draws an image based on a description and style.",
  instructions: "Draw an image of a {{object}} in the {{style}} style.",
});

// 2. Agent の入力を定義
const input = {
  object: "a serene lake at sunrise",
  style: "impressionistic",
};

// 3. Agent を呼び出して画像を生成
// invoke が呼び出されるコンテキストで imageModel が利用可能である必要があります。
async function generateImage() {
  try {
    const result = await context.invoke(drawingAgent, input);
    // result.output には生成された画像データが含まれます
    console.log("Image generated:", result.output);
    return result.output;
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateImage();
```

### 宣言的な使用法（YAML）

Agent は YAML 設定ファイルでも定義でき、これは異なる環境でそれらをロードするのに役立ちます。

次の例では、指定されたスタイルのオブジェクトを描画する `ImageAgent` を定義しています。

```yaml
# packages/core/test-agents/image.yaml
type: image
name: test-image-agent
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

この宣言的なアプローチは、Agent の定義をアプリケーションロジックから分離し、管理と更新を容易にします。