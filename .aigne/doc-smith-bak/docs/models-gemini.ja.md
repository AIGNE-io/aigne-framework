# Google Gemini

このガイドでは、`@aigne/gemini` パッケージを介して AIGNE フレームワーク内で Google の Gemini モデルを設定および使用する方法について説明します。API キーの設定、モデルの選択、およびチャット、画像、動画生成で利用可能な特定の機能について解説します。

`@aigne/gemini` パッケージは、Gemini マルチモーダルモデルや Imagen テキストから画像へのモデルなど、Google の高度な AI 機能とのシームレスな統合を提供し、AIGNE エコシステム内で一貫したインターフェースを提供します。

## 機能

- **Google API 統合**: Google の Gemini、Imagen、Veo API サービスへの直接インターフェースを提供します。
- **チャット補完**: 会話型 AI のために利用可能なすべての Gemini チャットモデルをサポートします。
- **画像生成**: 画像生成および編集のために Imagen と Gemini の両モデルと統合します。
- **動画生成**: テキストから動画へ、画像から動画へ、およびフレーム補間タスクのために Google の Veo モデルを活用します。
- **マルチモーダルサポート**: テキスト、画像、音声、動画を組み合わせた入力をネイティブに処理します。
- **関数呼び出し**: 外部ツールと対話するための Gemini の関数呼び出し機能をサポートします。
- **ストリーミング応答**: より応答性の高いアプリケーションのためにリアルタイムのデータ処理を可能にします。
- **タイプセーフ**: すべての API とモデル設定のための包括的な TypeScript 型定義を含みます。

## インストール

お好みのパッケージマネージャーを使用して、必要なパッケージをインストールしてください。

```bash
npm install @aigne/gemini @aigne/core
```

## 設定

リクエストを認証するには、Google API キーを提供する必要があります。これは環境変数を設定することで行うことができ、フレームワークが自動的に検出します。

```bash 環境変数
export GEMINI_API_KEY="your-google-api-key"
```

または、モデルのコンストラクタで `apiKey` を直接渡すこともできます。

## チャット補完

`GeminiChatModel` クラスは、会話型のインタラクションに使用されます。

### 基本的な使用方法

次の例は、`GeminiChatModel` をインスタンス化して呼び出す方法を示しています。

```typescript チャットモデルの使用法 icon=logos:javascript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // GEMINI_API_KEY 環境変数が設定されている場合、API キーは任意です。
  apiKey: "your-api-key",
  // モデルを指定します。デフォルトは 'gemini-2.0-flash' です。
  model: "gemini-1.5-flash",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
```

**応答例**

```json
{
  "text": "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
  "model": "gemini-1.5-flash",
  "usage": {
    "inputTokens": 12,
    "outputTokens": 18
  }
}
```

### ストリーミング応答

リアルタイムアプリケーションの場合、ストリーミングを有効にすることで、応答チャンクが到着するたびに処理できます。

```typescript ストリーミングの例 icon=logos:javascript
import { isAgentResponseDelta } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  apiKey: "your-api-key",
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
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }
}

console.log(fullText);
// Output: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"

console.log(json);
// Output: { model: "gemini-1.5-flash" }
```

### チャットモデルのパラメータ

<x-field-group>
  <x-field data-name="messages" data-type="array" data-required="true" data-desc="会話履歴。各メッセージオブジェクトには 'role' と 'content' が含まれます。"></x-field>
  <x-field data-name="tools" data-type="array" data-required="false" data-desc="モデルが呼び出すことができる利用可能な関数ツールのリスト。"></x-field>
  <x-field data-name="toolChoice" data-type="string | object" data-required="false" data-desc="モデルがツールをどのように使用するかを制御します。「auto」、「required」、「none」、または特定のツールを指定できます。"></x-field>
  <x-field data-name="responseFormat" data-type="object" data-required="false" data-desc="構造化された JSON など、希望する出力形式を指定します。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="使用するモデル (例: 'gemini-1.5-pro', 'gemini-1.5-flash')。"></x-field>
  <x-field data-name="temperature" data-type="number" data-required="false" data-desc="ランダム性を制御します (0-1)。値が高いほど、より創造的な応答が生成されます。"></x-field>
  <x-field data-name="topP" data-type="number" data-required="false" data-desc="Nucleus サンプリングパラメータ (0-1)。"></x-field>
  <x-field data-name="topK" data-type="number" data-required="false" data-desc="Top-k サンプリングパラメータ。"></x-field>
  <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="トークンの繰り返しを減らす可能性を高めます。"></x-field>
  <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="モデルが新しいトピックを導入するように促します。"></x-field>
  <x-field data-name="reasoningEffort" data-type="string | number" data-required="false" data-desc="思考モデル (例: Gemini 2.5) の場合、推論のためのトークンバジェットを設定します。「minimal」、「low」、「medium」、「high」、または特定のトークン数を指定できます。"></x-field>
  <x-field data-name="modalities" data-type="array" data-required="false" data-desc="['TEXT']、['IMAGE']、または ['TEXT', 'IMAGE'] など、希望する応答モダリティを指定します。"></x-field>
</x-field-group>

## 画像生成

`GeminiImageModel` クラスは、特殊な Imagen モデルとマルチモーダル Gemini モデルの両方を使用して、画像の生成と編集をサポートします。

### 基本的な画像生成

この例では、Imagen モデルを使用して画像を生成します。

```typescript 画像生成 icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key",
  model: "imagen-4.0-generate-001", // Default Imagen model
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
```

**応答例**

```json
{
  "images": [
    {
      "type": "file",
      "data": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png"
    }
  ],
  "usage": { "inputTokens": 0, "outputTokens": 0 },
  "model": "imagen-4.0-generate-001"
}
```

### Gemini モデルによる画像編集

マルチモーダル Gemini モデルは、テキストプロンプトに基づいて既存の画像を編集できます。

```typescript 画像編集 icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key",
  model: "gemini-2.0-flash-exp", // Gemini model for editing
});

const result = await model.invoke({
  prompt: "Add vibrant flowers in the foreground",
  image: [
    {
      type: "url",
      url: "https://example.com/original-image.png",
    },
  ],
  n: 1,
});

console.log(result.images); // Array of edited images
```

### 画像モデルのパラメータ

パラメータは、使用されるモデルファミリーによって異なります。

#### 共通パラメータ

| パラメータ | 型 | 説明 |
| :--- | :--- | :--- |
| `prompt` | `string` | **必須。**希望する画像のテキスト説明。 |
| `model` | `string` | 使用するモデル。デフォルトは `imagen-4.0-generate-001` です。 |
| `n` | `number` | 生成する画像の数。デフォルトは `1` です。 |
| `image` | `array` | Gemini モデルの場合、編集のための参照画像の配列。 |

#### Imagen モデルのパラメータ

| パラメータ | 型 | 説明 |
| :--- | :--- | :--- |
| `seed` | `number` | 再現可能な結果を得るためのランダムシード。 |
| `safetyFilterLevel` | `string` | コンテンツモデレーションのセーフティフィルターレベル。 |
| `personGeneration` | `string` | 人物の画像を生成するための設定を制御します。 |
| `outputMimeType` | `string` | 出力画像の形式 (例: `image/png`)。 |
| `negativePrompt` | `string` | 画像から除外するものの説明。 |
| `imageSize` | `string` | 生成される画像の寸法 (例: "1024x1024")。 |
| `aspectRatio` | `string` | 画像のアスペクト比 (例: "16:9")。 |

#### Gemini モデルのパラメータ

| パラメータ | 型 | 説明 |
| :--- | :--- | :--- |
| `temperature` | `number` | ランダム性を制御します (0.0 から 1.0)。 |
| `maxOutputTokens` | `number` | 応答内の最大トークン数。 |
| `topP` | `number` | Nucleus サンプリングパラメータ。 |
| `topK` | `number` | Top-k サンプリングパラメータ。 |
| `safetySettings` | `array` | コンテンツ生成のためのカスタムセーフティ設定。 |
| `seed` | `number` | 再現可能な結果を得るためのランダムシード。 |
| `systemInstruction` | `string` | モデルをガイドするためのシステムレベルの指示。 |

## 動画生成

`GeminiVideoModel` クラスは、Google の Veo モデルを使用して、テキストまたは画像から動画を生成します。

### 基本的な動画生成

```typescript テキストから動画へ icon=logos:javascript
import { GeminiVideoModel } from "@aigne/gemini";

const videoModel = new GeminiVideoModel({
  apiKey: "your-api-key",
  model: "veo-3.1-generate-preview",
});

const result = await videoModel.invoke({
  prompt: "A serene lake with mountains in the background, gentle waves rippling",
  aspectRatio: "16:9",
  size: "720p",
  seconds: "8",
});

console.log(result);
```

**応答例**

```json
{
  "videos": [
    {
      "type": "file",
      "data": "base64-encoded-video-data...",
      "mimeType": "video/mp4",
      "filename": "timestamp.mp4"
    }
  ],
  "usage": { "inputTokens": 0, "outputTokens": 0 },
  "model": "veo-3.1-generate-preview",
  "seconds": 8
}
```

### 高度な動画生成

Veo モデルは、画像から動画への変換とフレーム補間もサポートしています。

-   **画像から動画へ**: `prompt` とソース `image` を提供して、静止画をアニメーション化します。
-   **フレーム補間**: `prompt`、開始 `image`、および終了 `lastFrame` を提供して、それらの間の滑らかな遷移を生成します。

```typescript 画像から動画へ icon=logos:javascript
const result = await videoModel.invoke({
  prompt: "Animate this image with gentle movement, clouds drifting slowly",
  image: {
    type: "url",
    url: "https://example.com/input-image.png",
  },
  seconds: "8",
});
```

### 動画モデルのパラメータ

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="希望する動画コンテンツのテキスト説明。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="使用する Veo モデル。デフォルトは 'veo-3.1-generate-preview' です。"></x-field>
  <x-field data-name="aspectRatio" data-type="string" data-required="false" data-desc="動画のアスペクト比。「16:9」(デフォルト) または「9:16」。"></x-field>
  <x-field data-name="size" data-type="string" data-required="false" data-desc="動画の解像度。「720p」(デフォルト) または「1080p」。"></x-field>
  <x-field data-name="seconds" data-type="string" data-required="false" data-desc="動画の長さ (秒): 「4」、「6」、または「8」(デフォルト)。"></x-field>
  <x-field data-name="image" data-type="object" data-required="false" data-desc="画像から動画への変換のための参照画像、または補間のための最初のフレーム。"></x-field>
  <x-field data-name="lastFrame" data-type="object" data-required="false" data-desc="フレーム補間のための最後のフレーム。"></x-field>
  <x-field data-name="referenceImages" data-type="array" data-required="false" data-desc="動画生成のための追加の参照画像 (Veo 3.1 のみ)。"></x-field>
  <x-field data-name="negativePrompt" data-type="string" data-required="false" data-desc="動画で避けるべき内容の説明。"></x-field>
</x-field-group>

## さらに読む

完全な API の詳細については、公式ドキュメントを参照してください。

- [AIGNE フレームワークドキュメント](https://aigne.io/docs)
- [Google GenAI API リファレンス](https://googleapis.github.io/js-genai/release_docs/)