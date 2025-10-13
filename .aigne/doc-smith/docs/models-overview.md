# Models

Models are a core component of the AIGNE platform, providing a standardized interface to interact with a variety of third-party AI models. This documentation covers the basic model architecture, lists the available models, and provides examples of how to use them.

## Overview

The AIGNE model system is designed with a hierarchical structure. At the base is the `Agent`, which defines the fundamental interface for any processing unit. Extending this is the generic `Model` class, an abstract class that introduces specialized handling for different data types, particularly file content.

Each third-party AI provider, such as OpenAI or Anthropic, has a concrete implementation of the `Model` class. For example, `OpenAIChatModel` and `AnthropicChatModel` are specific classes that handle the unique APIs and requirements of their respective services. This architecture allows you to use different models in a consistent way.

```d2
direction: down

Agent: {
  label: "Agent\n(Base Interface)"
  shape: rectangle
}

Model: {
  label: "Model\n(Abstract Class)\nHandles File Content"
  shape: rectangle
  style: {
    stroke-dash: 4
  }
}

Concrete-Models: {
  label: "Concrete Model Implementations"
  grid-columns: 2
  grid-gap: 100

  Chat-Models: {
    label: "Chat Models"
    shape: rectangle
    grid-columns: 3

    OpenAIChatModel
    AnthropicChatModel
    BedrockChatModel
    DeepSeekChatModel
    GeminiChatModel
    OllamaChatModel
    OpenRouterChatModel
    XAIChatModel
    DoubaoChatModel
    PoeChatModel
    AIGNEHubChatModel
  }

  Image-Models: {
    label: "Image Models"
    shape: rectangle
    grid-columns: 2

    OpenAIImageModel
    GeminiImageModel
    IdeogramImageModel
    DoubaoImageModel
    AIGNEHubImageModel
  }
}

Model -> Agent: "extends"
Concrete-Models.Chat-Models -> Model: "implements"
Concrete-Models.Image-Models -> Model: "implements"

```

## Core Concepts

### The Generic Model Class

The abstract `Model` class, defined in `packages/core/src/agents/model.ts`, serves as the foundation for all specific model implementations. Its primary responsibilities include:

-   **Standardizing Interactions**: Providing a consistent API for invoking models, regardless of the underlying provider.
-   **File Handling**: Automatically transforming file content between different formats. This is a key feature that simplifies data handling. The `Model` class can accept file data as:
    -   **URL**: A public URL to a file. The model will download and process it.
    -   **Local File**: A path to a file on the local filesystem.
    -   **Base64 Encoded**: File content encoded as a base64 string.

The class manages the conversion between these formats, ensuring the data is in the correct format for the specific model being used.

## Available Models

AIGNE supports a wide range of chat and image generation models from various providers.

### Chat Models

The following table lists the available chat models, which can be instantiated and used for text-based interactions.

| Provider / Class Name | Aliases | API Key Environment Variable |
| :--- | :--- | :--- |
| `OpenAIChatModel` | | `OPENAI_API_KEY` |
| `AnthropicChatModel` | | `ANTHROPIC_API_KEY` |
| `BedrockChatModel` | | `AWS_ACCESS_KEY_ID` |
| `DeepSeekChatModel` | | `DEEPSEEK_API_KEY` |
| `GeminiChatModel` | `google` | `GEMINI_API_KEY`, `GOOGLE_API_KEY` |
| `OllamaChatModel` | | `OLLAMA_API_KEY` |
| `OpenRouterChatModel`| | `OPEN_ROUTER_API_KEY` |
| `XAIChatModel` | | `XAI_API_KEY` |
| `DoubaoChatModel` | | `DOUBAO_API_KEY` |
| `PoeChatModel` | | `POE_API_KEY` |
| `AIGNEHubChatModel` | | `AIGNE_HUB_API_KEY` |

### Image Models

The following table lists the available image models for generating visual content.

| Provider / Class Name | Aliases | API Key Environment Variable |
| :--- | :--- | :--- |
| `OpenAIImageModel` | | `OPENAI_API_KEY` |
| `GeminiImageModel` | `google` | `GEMINI_API_KEY` |
| `IdeogramImageModel` | | `IDEOGRAM_API_KEY` |
| `DoubaoImageModel` | | `DOUBAO_API_KEY` |
| `AIGNEHubImageModel` | | `AIGNE_HUB_API_KEY` |

## Usage

You can easily instantiate and use any of the supported models. The system provides helper functions to find and load the correct model based on a provider string.

### Parsing Model Identifiers

A model is typically identified by a string in the format `provider/model_name`, for example, `openai/gpt-4o`. The `parseModel` utility can be used to break this string into its constituent parts.

```typescript
import { parseModel } from "models/aigne-hub/src/utils/model.ts";

const { provider, model } = parseModel("openai/gpt-4o");

console.log(provider); // "openai"
console.log(model);    // "gpt-4o"
```

### Finding and Creating a Model

The `findModel` function allows you to locate the correct model class from the list of available models. You can then use the `create` method of the matched model to instantiate it.

This example demonstrates how to find a model by its provider name and create an instance of it.

```typescript
import { findModel, parseModel } from "models/aigne-hub/src/utils/model.ts";

// The full model identifier string
const modelIdentifier = "openai/gpt-4o";

// 1. Parse the identifier to get the provider and model name
const { provider, model: modelName } = parseModel(modelIdentifier);

// 2. Find the corresponding loadable model configuration
const { match } = findModel(provider);

if (match) {
  // 3. Create an instance of the model
  const chatModel = match.create({
    model: modelName,
    // modelOptions can be used to pass additional parameters
    modelOptions: {
      temperature: 0.7,
    },
    // The API key can also be passed directly, though using
    // environment variables is recommended.
    // apiKey: "sk-...",
  });

  // Now you can use the chatModel instance to make API calls
  console.log(`Successfully created model: ${chatModel.constructor.name}`);
} else {
  console.error(`Model provider "${provider}" not found.`);
}
```

This modular approach makes it simple to switch between different AI models with minimal code changes, promoting flexibility and reusability in your applications.