# Overview

The AIGNE Framework is designed to be model-agnostic, allowing developers to integrate a wide variety of large language models (LLMs) and image generation models from different providers. This is achieved through a standardized adapter system that abstracts the unique APIs of each provider behind a consistent interface.

At the core of this system are the `ChatModel` and `ImageModel` agents. These specialized agents act as a bridge between your application's logic and the external AI services. By using these standardized agents, you can switch between model providers with minimal code changes, often only requiring a change in configuration. Each supported provider has a dedicated package (e.g., `@aigne/openai`, `@aigne/anthropic`) that contains the specific implementation for communicating with its API.

This section provides a summary of all officially supported model providers. For detailed instructions on how to install, configure, and use a specific provider, please refer to its dedicated documentation page.

The following diagram illustrates the architecture of the AIGNE Framework's model abstraction layer:

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Overview](assets/diagram/overview-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

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
