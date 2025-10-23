# Google Gemini

このドキュメントは、AIGNE フレームワーク内で Google の Gemini モデルを設定し、使用するための包括的なガイドです。API キーの設定、モデルの選択、そして `@aigne/gemini` パッケージを通じて利用可能なチャットおよび画像生成機能に関する特定の機能について説明します。

`@aigne/gemini` パッケージは、Google の Gemini および Imagen API との直接的な統合を提供し、開発者が一貫性のある予測可能なインターフェースを通じて、これらの高度なマルチモーダルモデルを AIGNE アプリケーションで活用できるようにします。

## 特徴

- **Google API との直接統合**: Google の Gemini および Imagen API サービスに直接接続します。
- **チャット補完**: `gemini-1.5-pro` や `gemini-1.5-flash` を含む Gemini チャットモデルを完全にサポートします。
- **画像生成**: 画像生成のために Imagen (例: `imagen-4.0-generate-001`) と Gemini モデルの両方をサポートします。
- **マルチモーダル機能**: マルチモーダルアプリケーションのために、テキストと画像の両方の入力をネイティブに処理します。
- **関数呼び出し**: Gemini の関数呼び出し機能と統合します。
- **ストリーミング応答**: ストリーミング応答をサポートすることで、リアルタイムで応答性の高いアプリケーションを可能にします。
- **タイプセーフ**: すべての API インタラクションとモデル設定に対して、包括的な TypeScript 型定義を提供します。

## インストール

まず、お好みのパッケージマネージャーを使用して必要なパッケージをインストールします。

<tabs>
<tab title="npm">
```bash
npm install @aigne/gemini @aigne/core
```
</tab>
<tab title="yarn">
```bash
yarn add @aigne/gemini @aigne/core
```
</tab>
<tab title="pnpm">
```bash
pnpm add @aigne/gemini @aigne/core
```
</tab>
</tabs>

## 設定

Gemini モデルには認証用の API キーが必要です。キーはモデルのコンストラクタで直接提供するか、セキュリティと柔軟性を高めるために環境変数を通じて提供することができます。

フレームワークが API キーを自動的に検出できるように、以下の環境変数を設定してください:

```bash title="環境変数"
export GEMINI_API_KEY="your-google-api-key"
```

## チャットモデル

`GeminiChatModel` クラスは、Google のチャットベースのモデルと対話するためのインターフェースを提供します。

### 基本的な使用方法

以下は、`GeminiChatModel` をインスタンス化し、それを呼び出して応答を取得する標準的な例です。

```typescript "チャットモデルの例" icon=logos:javascript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // GEMINI_API_KEY 環境変数が設定されている場合、API キーはオプションです。
  apiKey: "your-google-api-key",

  // モデルのバージョンを指定します。指定しない場合、デフォルトは 'gemini-1.5-pro' です。
  model: "gemini-1.5-flash",

  // 追加のモデルオプションを設定できます。
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
```

期待される出力は、モデルの応答を含むオブジェクトになります。

```json "応答の例"
{
  "text": "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
  "model": "gemini-1.5-flash"
}
```

### ストリーミング応答

リアルタイムの対話が必要なアプリケーションでは、ストリーミングを有効にして、応答チャンクが利用可能になり次第処理することができます。

```typescript "ストリーミングの例" icon=logos:javascript
import { isAgentResponseDelta } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  apiKey: "your-google-api-key",
  model: "gemini-1.5-flash",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hi there, introduce yourself" }],
  },
  { streaming: true }
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log(fullText);
// 期待される出力: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"

console.log(json);
// 期待される出力: { model: "gemini-1.5-flash" }
```

## 画像生成モデル

`GeminiImageModel` クラスは画像を生成するために使用されます。これは、画像生成に特化した **Imagen** モデルと、同様に画像を生成できるマルチモーダルな **Gemini** モデルという、2つの異なるタイプの基盤モデルをサポートしています。

### 基本的な使用方法

以下は、デフォルトの Imagen モデルを使用して画像を生成する基本的な例です。

```typescript "画像生成の例" icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-google-api-key",
  // デフォルトは "imagen-4.0-generate-001" です
  model: "imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
```

結果には、生成された画像データが Base64 形式で含まれます。

```json "応答の例"
{
  "images": [
    {
      "type": "file",
      "data": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "imagen-4.0-generate-001"
}
```

### 画像生成パラメータ

画像生成に利用できるパラメータは、Imagen モデルを使用しているか Gemini モデルを使用しているかによって異なります。

#### Imagen モデル (例: `imagen-4.0-generate-001`)

これらのパラメータは、画像生成に最適化されたモデルに特有のものです。

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `prompt` | `string` | **必須。** 生成する画像のテキスト説明。 |
| `n` | `number` | 生成する画像の数。デフォルトは `1` です。 |
| `negativePrompt` | `string` | 画像から除外する要素の説明。 |
| `seed` | `number` | 再現可能な画像生成を保証するためのランダムシード。 |
| `aspectRatio` | `string` | 生成される画像のアスペクト比 (例: "1:1"、"16:9")。 |
| `imageSize` | `string` | 生成される画像のサイズ (例: "1024x1024")。 |
| `guidanceScale` | `number` | 生成された画像がプロンプトにどれだけ忠実であるかを制御します。 |
| `outputMimeType` | `string` | 画像の出力形式 (例: "image/png"、"image/jpeg")。 |
| `addWatermark` | `boolean` | `true` の場合、生成された画像にウォーターマークを追加します。 |
| `safetyFilterLevel` | `string` | コンテンツモデレーションのセーフティフィルターレベル。 |
| `personGeneration` | `string` | 画像内の人物生成に関連する設定。 |
| `outputGcsUri` | `string` | 出力を保存するための Google Cloud Storage URI。 |
| `outputCompressionQuality` | `number` | JPEG の圧縮品質、1 から 100。 |
| `language` | `string` | プロンプトの言語。 |
| `includeSafetyAttributes` | `boolean` | `true` の場合、応答にセーフティ属性を含めます。 |
| `includeRaiReason` | `boolean` | `true` の場合、応答に RAI (責任ある AI) の理由を含めます。 |

#### Gemini モデル (例: `gemini-1.5-pro`)

これらのパラメータは、画像生成にマルチモーダルな Gemini モデルを使用する場合に適用されます。

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `prompt` | `string` | **必須。** 生成する画像のテキスト説明。 |
| `n` | `number` | 生成する画像の数。デフォルトは `1` です。 |
| `temperature` | `number` | ランダム性を制御します (0.0 から 1.0)。値が高いほど、より創造的な出力になります。 |
| `maxOutputTokens` | `number` | 応答内のトークンの最大数。 |
| `topP` | `number` | 核サンプリングパラメータ。 |
| `topK` | `number` | トップ k サンプリングパラメータ。 |
| `seed` | `number` | 再現可能な生成を保証するためのランダムシード。 |
| `stopSequences` | `array` | 生成プロセスを停止させるシーケンスのリスト。 |
| `safetySettings` | `array` | コンテンツ生成のためのカスタムセーフティ設定。 |
| `systemInstruction` | `string` | モデルの振る舞いをガイドするためのシステムレベルの指示。 |

### 高度な画像生成

この例では、複数のパラメータを使用して Imagen モデルからの出力を微調整する方法を示します。

```typescript "高度な画像生成" icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({ apiKey: "your-google-api-key" });

const result = await model.invoke({
  prompt: "A futuristic cityscape with neon lights and flying cars",
  model: "imagen-4.0-generate-001",
  n: 2,
  imageSize: "1024x1024",
  aspectRatio: "1:1",
  guidanceScale: 7.5,
  negativePrompt: "blurry, low quality, distorted",
  seed: 12345,
  includeSafetyAttributes: true,
  outputMimeType: "image/png",
});

console.log(result);
```

## 関連情報

パラメータの完全なリストとより高度な機能については、Google AI の公式ドキュメントを参照してください。

- **Imagen モデル**: [Google GenAI Models.generateImages()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generateimages)
- **Gemini モデル**: [Google GenAI Models.generateContent()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generatecontent)