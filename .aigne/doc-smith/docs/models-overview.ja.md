# 概要

AIGNEフレームワークは、モデル非依存に設計されており、開発者はさまざまなプロバイダーの大規模言語モデル（LLM）や画像生成モデルを幅広く統合できます。これは、各プロバイダー独自のAPIを、一貫したインターフェースの背後で抽象化する、標準化されたアダプターシステムを通じて実現されています。

このシステムの中核となるのが、`ChatModel` と `ImageModel` のAgentです。これらの特化したAgentは、アプリケーションのロジックと外部のAIサービスとの間の橋渡しとして機能します。これらの標準化されたAgentを使用することで、モデルプロバイダーを最小限のコード変更で切り替えることができ、多くの場合、設定の変更だけで済みます。サポートされている各プロバイダーには、そのAPIと通信するための特定の実装を含む専用パッケージ（例：`@aigne/openai`、`@aigne/anthropic`）があります。

このセクションでは、公式にサポートされているすべてのモデルプロバイダーの概要を説明します。特定のプロバイダーのインストール、設定、および使用方法に関する詳細な手順については、その専用のドキュメントページを参照してください。

```d2
direction: down
style: {
  stroke-width: 2
  font-size: 14
}

AIGNE_Framework_Core: {
  label: "AIGNEフレームワークコア"
  shape: rectangle
  style: {
    fill: "#D1E7DD"
    stroke: "#198754"
  }
}

Model_Abstraction_Layer: {
  label: "モデル抽象化レイヤー"
  shape: rectangle
  style: {
    fill: "#cfe2ff"
    stroke: "#0d6efd"
  }
}

ChatModel: {
  label: "ChatModelインターフェース"
  shape: rectangle
  style: {
    fill: "#f8d7da"
    stroke: "#dc3545"
  }
}

ImageModel: {
  label: "ImageModelインターフェース"
  shape: rectangle
  style: {
    fill: "#f8d7da"
    stroke: "#dc3545"
  }
}

Model_Providers: {
  label: "モデルプロバイダーアダプター"
  shape: cloud
  style: {
    fill: "#fff3cd"
    stroke: "#ffc107"
  }
}

OpenAI: "OpenAIアダプター\n(@aigne/openai)"
Anthropic: "Anthropicアダプター\n(@aigne/anthropic)"
Google: "Google Geminiアダプター\n(@aigne/gemini)"
Bedrock: "AWS Bedrockアダプター\n(@aigne/bedrock)"
Ollama: "Ollamaアダプター\n(@aigne/ollama)"
Other_Providers: {
    label: "..."
    shape: circle
}


AIGNE_Framework_Core -> Model_Abstraction_Layer: と相互作用

Model_Abstraction_Layer.ChatModel
Model_Abstraction_Layer.ImageModel

Model_Abstraction_Layer -> Model_Providers: に接続

Model_Providers.OpenAI
Model_Providers.Anthropic
Model_Providers.Google
Model_Providers.Bedrock
Model_Providers.Ollama
Model_Providers.Other_Providers

ChatModel -> OpenAI
ChatModel -> Anthropic
ChatModel -> Google
ChatModel -> Bedrock
ChatModel -> Ollama
ImageModel -> OpenAI
ImageModel -> Google
```

## サポートされているチャットモデル

以下の表は、AIGNEフレームワークで公式にサポートされているチャットモデルプロバイダーの一覧です。プロバイダーを選択すると、その詳細な統合ガイドが表示されます。

| プロバイダー | パッケージ |
| :--- | :--- |
| [AIGNE Hub](./models-aigne-hub.md) | `@aigne/aigne-hub` |
| [Anthropic](./models-anthropic.md) | `@aigne/anthropic` |
| [AWS Bedrock](./models-bedrock.md) | `@aigne/bedrock` |
| [DeepSeek](./models-deepseek.md) | `@aigne/deepseek` |
| [Doubao](./models-doubao.md) | `@aigne/doubao` |
| [Google Gemini](./models-gemini.md) | `@aigne/gemini` |
| [LMStudio](./models-lmstudio.md) | `@aigne/lmstudio` |
| [Ollama](./models-ollama.md) | `@aigne/ollama` |
| [OpenAI](./models-openai.md) | `@aigne/openai` |
| [OpenRouter](./models-open-router.md) | `@aigne/open-router` |
| [Poe](./models-poe.md) | `@aigne/poe` |
| [xAI](./models-xai.md) | `@aigne/xai` |

## サポートされている画像モデル

以下の表は、公式にサポートされている画像生成モデルプロバイダーの一覧です。プロバイダーを選択すると、その詳細な統合ガイドが表示されます。

| プロバイダー | パッケージ |
| :--- | :--- |
| [AIGNE Hub](./models-aigne-hub.md) | `@aigne/aigne-hub` |
| [Doubao](./models-doubao.md) | `@aigne/doubao` |
| [Google Gemini](./models-gemini.md) | `@aigne/gemini` |
| [Ideogram](./models-ideogram.md) | `@aigne/ideogram` |
| [OpenAI](./models-openai.md) | `@aigne/openai` |