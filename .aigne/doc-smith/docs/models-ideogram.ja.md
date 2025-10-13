# @aigne/ideogram SDK

`@aigne/ideogram` パッケージは、AIGNE フレームワークと Ideogram の強力な画像生成モデルとのシームレスな統合を提供します。この SDK を使用することで、開発者は AIGNE アプリケーション内で Ideogram の高度な画像生成機能を簡単に活用でき、一貫性のある合理化されたインターフェースを利用できます。

このガイドでは、`@aigne/ideogram` SDK のインストールプロセス、基本的な使い方、および高度な機能について説明します。

## インストール

お好みのパッケージマネージャを使用してパッケージをインストールできます。

### npm を使用する場合

```bash
npm install @aigne/ideogram
```

### yarn を使用する場合

```bash
yarn add @aigne/ideogram
```

### pnpm を使用する場合

```bash
pnpm add @aigne/ideogram
```

## 認証

Ideogram API を使用するには、API キーが必要です。キーを提供するには 2 つの方法があります。

1.  **コンストラクタで直接指定:** オプションオブジェクトで `apiKey` を渡します。
2.  **環境変数の使用:** SDK は `IDEOGRAM_API_KEY` 環境変数を自動的に検出します。

```bash
export IDEOGRAM_API_KEY="your-ideogram-api-key"
```

## 基本的な使い方

以下は、テキストプロンプトから画像を生成する簡単な例です。

```typescript
import { IdeogramImageModel } from "@aigne/ideogram";

// モデルを初期化
const model = new IdeogramImageModel({
  apiKey: "your-api-key", // IDEOGRAM_API_KEY が設定されている場合はオプション
});

// 生成パラメータを定義
const result = await model.invoke({
  model: "ideogram-v3",
  prompt: "A serene mountain landscape at sunset with golden light",
});

// 出力をログに記録
console.log(result);
```

### レスポンスの例

```json
{
  "images": [
    {
      "url": "https://api.ideogram.ai/generation/..."
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "ideogram-v3"
}
```

## 入力パラメータ

`invoke` メソッドは、画像生成をカスタマイズするためのいくつかのパラメータを持つオブジェクトを受け入れます。

### 必須パラメータ

| パラメータ | 型     | 説明                                        |
| :------- | :----- | :------------------------------------------ |
| `prompt` | string | 生成したい画像の説明テキスト。                |

### オプションのパラメータ

| パラメータ       | 型       | 説明                                                                                                          |
| :--------------- | :------- | :------------------------------------------------------------------------------------------------------------ |
| `model`          | string   | 生成に使用するモデル。現在は `ideogram-v3` のみをサポートしています。                                           |
| `n`              | number   | 生成する画像の数。1 から 8 の間でなければなりません。デフォルトは 1 です。                                      |
| `seed`           | number   | 再現可能な結果を得るためのランダムシード。0 から 2147483647 の間でなければなりません。                          |
| `resolution`     | string   | 生成される画像の解像度 (例: "1024x1024", "1792x1024")。                                                         |
| `aspectRatio`    | string   | 画像のアスペクト比 (例: "1x1", "16x9")。                                                                      |
| `renderingSpeed` | string   | 生成速度。「TURBO」、「DEFAULT」、または「QUALITY」が指定できます。                                             |
| `magicPrompt`    | string   | MagicPrompt を有効または無効にします。「AUTO」、「ON」、または「OFF」が指定できます。                           |
| `negativePrompt` | string   | 画像から除外したいものの説明。                                                                                |
| `colorPalette`   | object   | 生成に影響を与えるカラーパレット。                                                                            |
| `styleCodes`     | string[] | 8 文字の 16 進数スタイルコードのリスト。                                                                      |
| `styleType`      | string   | 適用するスタイルタイプ。「AUTO」、「GENERAL」、「REALISTIC」、「DESIGN」、または「FICTION」が指定できます。       |

すべてのパラメータの完全かつ詳細なリストについては、[Ideogram 公式 API リファレンス](https://developer.ideogram.ai/api-reference/api-reference/generate-v3) を参照してください。

## 高度な使い方

複数のパラメータを組み合わせて、生成される画像をより詳細に制御することができます。

```typescript
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  apiKey: "your-api-key",
});

const result = await model.invoke({
  prompt: "A futuristic cityscape with neon lights and flying cars",
  model: "ideogram-v3",
  n: 4,
  resolution: "1792x1024",
  renderingSpeed: "TURBO",
  styleType: "FICTION",
  negativePrompt: "blurry, low quality, distorted",
  seed: 12345
});

console.log(result.images);
```

## デフォルトのモデルオプション

`IdeogramImageModel` インスタンスを作成する際にデフォルトオプションを設定すると、それ以降のすべての `invoke` 呼び出しに適用されます。これらのデフォルトは、個々の呼び出しで上書きすることができます。

```typescript
const model = new IdeogramImageModel({
  apiKey: "your-api-key",
  modelOptions: {
    styleType: "REALISTIC",
    renderingSpeed: "QUALITY",
    magicPrompt: "ON"
  }
});

// この呼び出しはデフォルトのモデルオプションを使用します
const result = await model.invoke({
  prompt: "A photorealistic portrait of an astronaut on Mars",
});
```