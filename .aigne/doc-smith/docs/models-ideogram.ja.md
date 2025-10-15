# Ideogram

このドキュメントは、開発者が AIGNE フレームワーク内で Ideogram の画像生成機能を統合し、利用するための包括的なガイドを提供します。`@aigne/ideogram` パッケージは Ideogram の API へのシームレスなインターフェースを提供し、テキストプロンプトから高品質な画像を生成することを可能にします。

このガイドでは、インストール、設定、使用方法に必要な手順を、コード例と詳細なパラメータ説明とともに解説します。他のモデルに関する情報については、[モデル概要](./models-overview.md) を参照してください。

## インストール

まず、`@aigne/ideogram` パッケージをプロジェクトにインストールします。お好みのパッケージマネージャーを使用できます。

```bash title="npm" icon=logos:npm-icon
npm install @aigne/ideogram
```

```bash title="yarn" icon=logos:yarn
yarn add @aigne/ideogram
```

```bash title="pnpm" icon=logos:pnpm
pnpm add @aigne/ideogram
```

## 設定

Ideogram API に接続するためには、適切な設定が不可欠です。これには、API キーの設定と `IdeogramImageModel` のインスタンス化が含まれます。

### API キーの設定

モデルは認証のために Ideogram の API キーを必要とします。推奨される最も安全な方法は、環境変数を設定することです。

```bash title=".env" icon=mdi:folder-key-outline
export IDEOGRAM_API_KEY="your-ideogram-api-key"
```

あるいは、モデルのインスタンス化時に `apiKey` を直接渡すこともできますが、本番環境では安全性が低くなります。

### モデルのインスタンス化

API キーが設定されたら、`IdeogramImageModel` をインポートしてインスタンスを作成できます。

```typescript Instantiating the Model icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

// API キーは環境変数から自動的に検出されます。
const model = new IdeogramImageModel();

// あるいは、API キーを直接指定します。
const modelWithApiKey = new IdeogramImageModel({
  apiKey: "your-ideogram-api-key", 
});
```

## 基本的な使用方法

画像を生成するには、`invoke` メソッドを使用します。このメソッドは、プロンプトとその他の必要なパラメータを含むオブジェクトを受け取ります。必須パラメータは `prompt` のみです。

```typescript Generating an Image icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel();

async function generateImage() {
  try {
    const result = await model.invoke({
      model: "ideogram-v3",
      prompt: "A serene mountain landscape at sunset with golden light",
    });
    
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateImage();
```

### レスポンスオブジェクト

`invoke` メソッドは、生成された画像と使用状況のメタデータを含むオブジェクトに解決されるプロミスを返します。

```json Example Response icon=material-symbols:data-object-outline
{
  "images": [
    {
      "type": "url",
      "url": "https://api.ideogram.ai/generation/...",
      "mimeType": "image/png"
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

`invoke` メソッドは、画像生成プロセスをカスタマイズするためのいくつかのパラメータを受け入れます。

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true">
    <x-field-desc markdown>生成したい画像のテキスト記述。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="ideogram-v3">
    <x-field-desc markdown>現在サポートされているのは `ideogram-v3` のみです。</x-field-desc>
  </x-field>
  <x-field data-name="n" data-type="number" data-required="false" data-default="1">
    <x-field-desc markdown>生成する画像の数。有効範囲は1から8です。</x-field-desc>
  </x-field>
  <x-field data-name="seed" data-type="number" data-required="false">
    <x-field-desc markdown>再現可能な画像生成のためのランダムシード。0から2147483647までの整数である必要があります。</x-field-desc>
  </x-field>
  <x-field data-name="resolution" data-type="string" data-required="false">
    <x-field-desc markdown>生成される画像の解像度（例: `"1024x1024"`, `"1792x1024"`）。サポートされているすべての解像度については、Ideogram の公式 API ドキュメントを参照してください。</x-field-desc>
  </x-field>
  <x-field data-name="aspectRatio" data-type="string" data-required="false">
    <x-field-desc markdown>画像のアスペクト比（例: `"1x1"`, `"16x9"`）。</x-field-desc>
  </x-field>
  <x-field data-name="renderingSpeed" data-type="string" data-required="false" data-default="DEFAULT">
    <x-field-desc markdown>生成速度と品質を制御します。受け入れられる値は `"TURBO"`、`"DEFAULT"`、または `"QUALITY"` です。</x-field-desc>
  </x-field>
  <x-field data-name="magicPrompt" data-type="string" data-required="false" data-default="AUTO">
    <x-field-desc markdown>プロンプトを強化するための MagicPrompt を有効または無効にします。受け入れられる値は `"AUTO"`、`"ON"`、または `"OFF"` です。</x-field-desc>
  </x-field>
  <x-field data-name="negativePrompt" data-type="string" data-required="false">
    <x-field-desc markdown>生成される画像から除外する要素の記述。</x-field-desc>
  </x-field>
  <x-field data-name="styleType" data-type="string" data-required="false" data-default="AUTO">
    <x-field-desc markdown>芸術的なスタイルを指定します。受け入れられる値は `"AUTO"`、`"GENERAL"`、`"REALISTIC"`、`"DESIGN"`、または `"FICTION"` です。</x-field-desc>
  </x-field>
  <x-field data-name="colorPalette" data-type="object" data-required="false">
    <x-field-desc markdown>生成に使用する特定のカラーパレットを定義するオブジェクト。</x-field-desc>
  </x-field>
  <x-field data-name="styleCodes" data-type="string[]" data-required="false">
    <x-field-desc markdown>特定のスタイルを表す8文字の16進数コードのリスト。</x-field-desc>
  </x-field>
</x-field-group>

## 高度な使用方法

出力をより詳細に制御するために、単一の `invoke` 呼び出しで複数のオプションパラメータを組み合わせることができます。

```typescript Advanced Image Generation icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel();

async function generateAdvancedImage() {
  try {
    const result = await model.invoke({
      prompt: "A futuristic cityscape with neon lights and flying cars",
      model: "ideogram-v3",
      n: 4,
      resolution: "1792x1024",
      renderingSpeed: "TURBO",
      styleType: "FICTION",
      negativePrompt: "blurry, low quality, distorted",
      seed: 12345,
    });
    
    console.log(`Generated ${result.images.length} images.`);
    result.images.forEach((image, index) => {
      console.log(`Image ${index + 1}: ${image.url}`);
    });
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateAdvancedImage();
```

## デフォルトのモデルオプション

モデルのインスタンス化時に `modelOptions` プロパティを使用して、デフォルトのパラメータを設定できます。これらのオプションは、呼び出し自体のパラメータによって上書きされない限り、すべての `invoke` 呼び出しに適用されます。

```typescript Setting Default Options icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  modelOptions: {
    styleType: "REALISTIC",
    renderingSpeed: "QUALITY",
    magicPrompt: "ON",
  },
});

async function generateWithDefaults() {
  // この呼び出しでは、上で定義されたデフォルトのオプションが使用されます。
  const result = await model.invoke({
    prompt: "A photorealistic portrait of an astronaut on Mars",
  });
  
  console.log(result);
}

generateWithDefaults();
```

## まとめ

`@aigne/ideogram` パッケージは、Ideogram の画像生成をアプリケーションに統合するための直接的で効率的な方法を提供します。設定手順に従い、提供されているパラメータを利用することで、特定のニーズに合わせた高品質な画像を生成できます。

すべてのパラメータ、サポートされている値、および高度な機能の完全かつ詳細なリストについては、公式の [Ideogram API リファレンス](https://developer.ideogram.ai/api-reference/api-reference/generate-v3) を参照してください。