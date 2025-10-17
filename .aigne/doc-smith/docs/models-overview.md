# Overview

The AIGNE Framework is designed to be model-agnostic, allowing developers to integrate a wide variety of large language models (LLMs) and image generation models from different providers. This is achieved through a standardized adapter system that abstracts the unique APIs of each provider behind a consistent interface.

At the core of this system are the `ChatModel` and `ImageModel` agents. These specialized agents act as a bridge between your application's logic and the external AI services. By using these standardized agents, you can switch between model providers with minimal code changes, often only requiring a change in configuration. Each supported provider has a dedicated package (e.g., `@aigne/openai`, `@aigne/anthropic`) that contains the specific implementation for communicating with its API.

This section provides a summary of all officially supported model providers. For detailed instructions on how to install, configure, and use a specific provider, please refer to its dedicated documentation page.

```d2
direction: down
style: {
  stroke-width: 2
  font-size: 14
}

AIGNE_Framework_Core: {
  label: "AIGNE Framework Core"
  shape: rectangle
  style: {
    fill: "#D1E7DD"
    stroke: "#198754"
  }
}

Model_Abstraction_Layer: {
  label: "Model Abstraction Layer"
  shape: rectangle
  style: {
    fill: "#cfe2ff"
    stroke: "#0d6efd"
  }
}

ChatModel: {
  label: "ChatModel Interface"
  shape: rectangle
  style: {
    fill: "#f8d7da"
    stroke: "#dc3545"
  }
}

ImageModel: {
  label: "ImageModel Interface"
  shape: rectangle
  style: {
    fill: "#f8d7da"
    stroke: "#dc3545"
  }
}

Model_Providers: {
  label: "Model Provider Adapters"
  shape: cloud
  style: {
    fill: "#fff3cd"
    stroke: "#ffc107"
  }
}

OpenAI: "OpenAI Adapter\n(@aigne/openai)"
Anthropic: "Anthropic Adapter\n(@aigne/anthropic)"
Google: "Google Gemini Adapter\n(@aigne/gemini)"
Bedrock: "AWS Bedrock Adapter\n(@aigne/bedrock)"
Ollama: "Ollama Adapter\n(@aigne/ollama)"
Other_Providers: {
    label: "..."
    shape: circle
}


AIGNE_Framework_Core -> Model_Abstraction_Layer: Interacts with

Model_Abstraction_Layer.ChatModel
Model_Abstraction_Layer.ImageModel

Model_Abstraction_Layer -> Model_Providers: Plugs into

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

## Supported Chat Models

The following table lists the chat model providers that are officially supported by the AIGNE Framework. Select a provider to view its detailed integration guide.

| Provider | Package |
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

## Supported Image Models

The following table lists the image generation model providers that are officially supported. Select a provider to view its detailed integration guide.

| Provider | Package |
| :--- | :--- |
| [AIGNE Hub](./models-aigne-hub.md) | `@aigne/aigne-hub` |
| [Doubao](./models-doubao.md) | `@aigne/doubao` |
| [Google Gemini](./models-gemini.md) | `@aigne/gemini` |
| [Ideogram](./models-ideogram.md) | `@aigne/ideogram` |
| [OpenAI](./models-openai.md) | `@aigne/openai` |