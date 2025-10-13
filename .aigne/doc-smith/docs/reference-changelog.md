AIGNE supports a variety of model providers, allowing developers to choose the best fit for their needs. This section details the supported providers and how to use them.

### Supported Model Providers

The following model providers are supported:

- **OpenAI**: Models from OpenAI, including the GPT series.
- **Anthropic**: Models from Anthropic, such as Claude.
- **Gemini**: Google's Gemini models.
- **Bedrock**: Amazon's Bedrock service, providing access to a range of models.
- **DeepSeek**: Models from DeepSeek.
- **Doubao**: Doubao models.
- **Ideogram**: Image generation models from Ideogram.
- **Ollama**: Run open-source models locally with Ollama.
- **OpenRouter**: Access a variety of models through the OpenRouter service.
- **Poe**: Models available through Poe.
- **XAI**: Models from XAI.
- **AIGNE Hub**: A central hub to access and manage various models.

These providers can be configured and used within your AIGNE applications, providing flexibility and power to your AI agents.

### Diagram of Supported Models

The following diagram illustrates the architecture of AIGNE's model support, with the core framework connecting to various model providers.

AIGNE supports a variety of model providers, allowing developers to choose the best fit for their needs. This section details the supported providers and how to use them.

### Supported Model Providers

The following model providers are supported:

- **OpenAI**: Models from OpenAI, including the GPT series.
- **Anthropic**: Models from Anthropic, such as Claude.
- **Gemini**: Google's Gemini models.
- **Bedrock**: Amazon's Bedrock service, providing access to a range of models.
- **DeepSeek**: Models from DeepSeek.
- **Doubao**: Doubao models.
- **Ideogram**: Image generation models from Ideogram.
- **Ollama**: Run open-source models locally with Ollama.
- **OpenRouter**: Access a variety of models through the OpenRouter service.
- **Poe**: Models available through Poe.
- **XAI**: Models from XAI.
- **AIGNE Hub**: A central hub to access and manage various models.

These providers can be configured and used within your AIGNE applications, providing flexibility and power to your AI agents.

### Diagram of Supported Models

The following diagram illustrates the architecture of AIGNE's model support, with the core framework connecting to various model providers.

```d2
direction: down

AIGNE: {
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

Model-Providers: {
  label: "Supported Model Providers"
  shape: rectangle
  style.stroke-dash: 2
  grid-columns: 3

  OpenAI
  Anthropic
  Gemini
  Bedrock
  DeepSeek
  Doubao
  Ideogram
  Ollama
  OpenRouter
  Poe
  XAI
  AIGNE-Hub: "AIGNE Hub"
}

AIGNE -> Model-Providers: "Connects to"
```

### Using Models in AIGNE

To use a model, you first need to install the corresponding package. For example, to use OpenAI models, you would install the `@aigne/openai` package.

```bash
npm install @aigne/openai
```

Then, you can import the model and use it in your agent definition.

```javascript
import { OpenAIChatModel } from '@aigne/openai';

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
});
```

### AIGNE Hub

AIGNE Hub is a service that allows you to access and manage various models from a single place. To use it, you need to connect your AIGNE CLI to the Hub.

```bash
aigne hub connect
```

This will guide you through the process of authenticating with AIGNE Hub. Once connected, you can use any of the supported models without needing to manage individual API keys.

### Model Configuration

You can configure models by passing an options object to the model's constructor. The available options depend on the model provider. For example, the `OpenAIChatModel` supports options like `temperature`, `max_tokens`, and `top_p`.

```javascript
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 1024,
});
```

### Supported Models by Provider

The following table lists the supported models for each provider. Please refer to the provider's documentation for the most up-to-date list.

| Provider | Supported Models |
| --- | --- |
| **OpenAI** | `gpt-4`, `gpt-4-32k`, `gpt-4-turbo`, `gpt-3.5-turbo`, etc. |
| **Anthropic** | `claude-2`, `claude-instant-1`, etc. |
| **Gemini** | `gemini-pro`, etc. |
| **Bedrock** | Various models from AI21 Labs, Anthropic, Cohere, Meta, and Stability AI. |
| **DeepSeek** | `deepseek-coder`, `deepseek-llm`, etc. |
| **Doubao** | `doubao-pro-4k`, `doubao-pro-32k`, etc. |
| **Ideogram** | Image generation models. |
| **Ollama** | A wide range of open-source models. |
| **OpenRouter** | A variety of models from different providers. |
| **Poe** | Models available through the Poe platform. |
| **XAI** | `grok-1`, etc. |
| **AIGNE Hub**| All models from the providers listed above. |