# @aigne/ollama

`@aigne/ollama` SDKは、AIGNEフレームワークとOllama経由でローカルにホストされるAIモデルとのシームレスな統合を提供します。これにより、開発者はAIGNEアプリケーションでオープンソースの言語モデルを簡単に活用でき、プライバシーとAI機能へのオフラインアクセスを確保しながら、一貫したインターフェースを提供します。

```d2
direction: down

AIGNE-Application: {
  label: "あなたのAIGNEアプリケーション"
  shape: rectangle
}

aigne-ollama: {
  label: "@aigne/ollama SDK"
  shape: rectangle
}

Ollama-Instance: {
  label: "Ollamaインスタンス\n(ローカルで実行)"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  API-Server: {
    label: "APIサーバー\n(localhost:11434)"
    shape: rectangle
  }

  Local-Models: {
    label: "ローカルAIモデル"
    shape: rectangle
    grid-columns: 2

    Llama3: { shape: rectangle }
    Mistral: { shape: rectangle }
    "and more...": { shape: rectangle }
  }
}

AIGNE-Application -> aigne-ollama: "`OllamaChatModel`を使用"
aigne-ollama -> Ollama-Instance.API-Server: "HTTP APIリクエストを送信"
Ollama-Instance.API-Server -> Ollama-Instance.Local-Models: "モデルをロードして実行"
Ollama-Instance.Local-Models -> Ollama-Instance.API-Server: "補完結果を返す"
```

## 機能

*   **Ollamaとの直接統合**: ローカルのOllamaインスタンスに直接接続します。
*   **ローカルモデルのサポート**: Ollama経由でホストされる多種多様なオープンソースモデルを使用します。
*   **チャット補完**: すべての互換性のあるOllamaモデルでチャット補完APIを完全にサポートします。
*   **ストリーミング応答**: ストリーミング応答のサポートにより、リアルタイムで応答性の高いアプリケーションを実現します。
*   **型安全**: すべてのAPIとモデルに対する包括的なTypeScriptの型付けの恩恵を受けられます。
*   **一貫したインターフェース**: AIGNEフレームワークのモデルインターフェースとスムーズに統合します。
*   **プライバシー重視**: データを外部サービスに送信することなく、モデルをローカルで実行します。
*   **完全な設定**: モデルの動作を微調整するための広範な設定オプションにアクセスできます。

## 前提条件

このパッケージを使用する前に、お使いのマシンに[Ollama](https://ollama.ai/)がインストールされ、実行されている必要があります。また、少なくとも1つのモデルをプルしておく必要もあります。[Ollamaの公式サイト](https://ollama.ai/)の公式な指示に従って、セットアップを完了してください。

## インストール

お好みのパッケージマネージャーを使用して、パッケージとそのコア依存関係をインストールします。

### npm

```bash
npm install @aigne/ollama @aigne/core
```

### yarn

```bash
yarn add @aigne/ollama @aigne/core
```

### pnpm

```bash
pnpm add @aigne/ollama @aigne/core
```

## 設定

プライマリエントリポイントは、ローカルのOllamaインスタンスに接続する`OllamaChatModel`クラスです。

```typescript
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  // OllamaインスタンスのベースURL。
  // デフォルトは `http://localhost:11434` です。
  baseURL: "http://localhost:11434",

  // 補完に使用するOllamaモデル。
  // デフォルトは 'llama3' です。
  model: "llama3",

  // モデルに渡す追加のオプション。
  modelOptions: {
    temperature: 0.8,
  },
});
```

コンストラクタは以下のオプションを受け入れます：

| パラメータ | 型 | 説明 | デフォルト |
| :--- | :--- | :--- | :--- |
| `model` | `string` | 使用するOllamaモデルの名前。 | `llama3.2` |
| `baseURL` | `string` | OllamaサーバーのベースURL。`OLLAMA_BASE_URL`環境変数でも設定できます。 | `http://localhost:11434/v1` |
| `modelOptions` | `object` | `temperature`や`top_p`などのモデル固有のパラメータを含むオブジェクト。 | `{}` |
| `apiKey` | `string` | 認証用のAPIキー。`OLLAMA_API_KEY`でも設定できます。 | `ollama` |

## 基本的な使い方

応答を生成するには、`invoke`メソッドを使用します。メッセージのリストを渡すと、単一の完全な応答が返されます。

```typescript
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me what model you're using" }],
});

console.log(result);
```

**出力:**

```json
{
  "text": "I'm an AI assistant running on Ollama with the llama3 model.",
  "model": "llama3"
}
```

## ストリーミング応答

よりインタラクティブなアプリケーションのために、生成中の応答をストリーミングできます。`invoke`呼び出しで`streaming: true`オプションを設定すると、応答チャンクの非同期ストリームを受け取ることができます。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me what model you're using" }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  // isAgentResponseDelta型ガードを使用してデルタを処理します
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text); // テキストが届き次第出力します
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n--- Final Data ---");
console.log("Full Text:", fullText);
console.log("JSON:", json);
```

**出力:**

```
I'm an AI assistant running on Ollama with the llama3 model.
--- Final Data ---
Full Text: I'm an AI assistant running on Ollama with the llama3 model.
JSON: { "model": "llama3" }
```

## ライセンス

このパッケージは[Elastic-2.0ライセンス](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)の下でライセンスされています。