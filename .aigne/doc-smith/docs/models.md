# AIGNE Models

AIGNE offers a comprehensive suite of SDKs designed for seamless integration with a wide array of AI model providers. These packages provide a consistent, unified interface across the AIGNE Framework, making it easy for developers to leverage the powerful capabilities of different AI models without altering their core application logic.

Whether you're working with OpenAI's GPT models, Anthropic's Claude, Google's Gemini, or locally hosted models via Ollama, the AIGNE Model SDKs streamline the development process. Each SDK is tailored to the specific provider's API while adhering to a standardized `invoke` method for chat completions, streaming, and other functionalities.

Furthermore, with `@aigne/aigne-hub`, you can access multiple providers through a single gateway, simplifying API key management and allowing for dynamic model switching and fallbacks. This introduction provides an overview of the available models and guides you through their installation and usage.

```d2
direction: down

Developer-Application: {
  label: "Developer's Application"
  shape: rectangle
}

AIGNE-Ecosystem: {
  label: "AIGNE SDK Ecosystem"
  shape: rectangle
  style: {
    stroke-dash: 4
  }
  grid-gap: 100

  AIGNE-SDKs: {
    label: "AIGNE SDKs"
    shape: rectangle
    grid-columns: 4
    grid-gap: 40

    aigne-core: {
      label: "@aigne/core\n(Foundation)"
      style.fill: "#d1e7dd"
    }

    aigne-hub: {
      label: "@aigne/aigne-hub\n(Gateway)"
      style.fill: "#cfe2ff"
    }
    aigne-open-router: {
      label: "@aigne/open-router\n(Gateway)"
      style.fill: "#cfe2ff"
    }
    aigne-poe: {
      label: "@aigne/poe\n(Gateway)"
      style.fill: "#cfe2ff"
    }

    aigne-openai: { label: "@aigne/openai" }
    aigne-anthropic: { label: "@aigne/anthropic" }
    aigne-gemini: { label: "@aigne/gemini" }
    aigne-bedrock: { label: "@aigne/bedrock" }
    aigne-deepseek: { label: "@aigne/deepseek" }
    aigne-doubao: { label: "@aigne/doubao" }
    aigne-ideogram: { label: "@aigne/ideogram" }
    aigne-ollama: { label: "@aigne/ollama" }
    aigne-xai: { label: "@aigne/xai" }
  }

  AI-Model-Providers: {
    label: "AI Model Providers (External Services)"
    shape: rectangle
    grid-columns: 4
    grid-gap: 40

    OpenAI: { label: "OpenAI\n(GPT, DALL-E)" }
    Anthropic: { label: "Anthropic\n(Claude)" }
    Google: { label: "Google\n(Gemini, Imagen)" }
    AWS-Bedrock: { label: "AWS Bedrock" }
    Deepseek: { label: "Deepseek" }
    Doubao: { label: "Doubao" }
    Ideogram: { label: "Ideogram" }
    Ollama: { label: "Ollama\n(Local Service)" }
    OpenRouter: { label: "OpenRouter" }
    Poe: { label: "Poe" }
    xAI: { label: "xAI\n(Grok)" }
  }
}

Developer-Application -> AIGNE-Ecosystem.AIGNE-SDKs: "Uses SDKs"

AIGNE-Ecosystem.AIGNE-SDKs.aigne-openai -> AIGNE-Ecosystem.AI-Model-Providers.OpenAI
AIGNE-Ecosystem.AIGNE-SDKs.aigne-anthropic -> AIGNE-Ecosystem.AI-Model-Providers.Anthropic
AIGNE-Ecosystem.AIGNE-SDKs.aigne-gemini -> AIGNE-Ecosystem.AI-Model-Providers.Google
AIGNE-Ecosystem.AIGNE-SDKs.aigne-bedrock -> AIGNE-Ecosystem.AI-Model-Providers.AWS-Bedrock
AIGNE-Ecosystem.AIGNE-SDKs.aigne-deepseek -> AIGNE-Ecosystem.AI-Model-Providers.Deepseek
AIGNE-Ecosystem.AIGNE-SDKs.aigne-doubao -> AIGNE-Ecosystem.AI-Model-Providers.Doubao
AIGNE-Ecosystem.AIGNE-SDKs.aigne-ideogram -> AIGNE-Ecosystem.AI-Model-Providers.Ideogram
AIGNE-Ecosystem.AIGNE-SDKs.aigne-ollama -> AIGNE-Ecosystem.AI-Model-Providers.Ollama
AIGNE-Ecosystem.AIGNE-SDKs.aigne-open-router -> AIGNE-Ecosystem.AI-Model-Providers.OpenRouter
AIGNE-Ecosystem.AIGNE-SDKs.aigne-poe -> AIGNE-Ecosystem.AI-Model-Providers.Poe
AIGNE-Ecosystem.AIGNE-SDKs.aigne-xai -> AIGNE-Ecosystem.AI-Model-Providers.xAI

AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.OpenAI
AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.Anthropic
AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.Google
AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.Ideogram
```

## Getting Started

To begin, you need to install the core AIGNE package along with the specific SDK for the AI model provider you wish to use.

### Installation

Install the necessary packages using your preferred package manager. For example, to use the OpenAI SDK:

**Using npm**
```bash
npm install @aigne/openai @aigne/core
```

**Using yarn**
```bash
yarn add @aigne/openai @aigne/core
```

**Using pnpm**
```bash
pnpm add @aigne/openai @aigne/core
```

## Supported Providers

AIGNE supports a diverse range of AI model providers, each with its own dedicated SDK for optimal integration. Below is a detailed guide for each supported provider.

### AIGNE Hub

`@aigne/aigne-hub` provides unified access to multiple LLM providers through a single gateway service. It allows you to switch between models from providers like OpenAI, Anthropic, and Google without changing your client-side code.

**Key Features:**
-   Route requests to any supported provider via a single endpoint.
-   Securely manage API keys using a single `accessKey`.
-   Supports chat completions, streaming, and image generation.

#### Installation
```bash
npm install @aigne/aigne-hub @aigne/core
```

#### Basic Chat Usage
```typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(result);
/* Example Output:
  {
    text: "Hello! How can I help you today?",
    model: "openai/gpt-4o-mini",
    usage: {
      inputTokens: 8,
      outputTokens: 9
    }
  }
*/
```

#### Image Generation
AIGNE Hub supports image generation from multiple providers. Simply specify the model name to switch between them.

**OpenAI DALL-E Example**
```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/dall-e-3",
});

const result = await model.invoke({
  prompt: "A futuristic cityscape with flying cars and neon lights",
  n: 1,
  size: "1024x1024",
});
```

**Google Imagen Example**
```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset",
});
```

**Ideogram Example**
```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "ideogram/ideogram-v3",
});

const result = await model.invoke({
  prompt: "A cyberpunk character with glowing blue eyes",
  resolution: "1024x1024",
});
```

### OpenAI

The `@aigne/openai` SDK provides seamless integration with OpenAI's GPT models. It supports chat completions, function calling, and streaming responses.

#### Installation
```bash
npm install @aigne/openai @aigne/core
```

#### Basic Usage
```typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // Provide API key directly or use environment variable OPENAI_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  model: "gpt-4o", // Defaults to "gpt-4o-mini" if not specified
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

#### Streaming Responses
```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: "your-api-key",
  model: "gpt-4o",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
  },
  { streaming: true },
);

let fullText = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
  }
}
console.log(fullText);
```

### Anthropic

The `@aigne/anthropic` SDK integrates with Anthropic's Claude AI models, offering support for chat completions, tool calling, and streaming.

#### Installation
```bash
npm install @aigne/anthropic @aigne/core
```

#### Basic Usage
```typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // Provide API key directly or use environment variable ANTHROPIC_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  model: "claude-3-haiku-20240307", // Defaults to 'claude-3-7-sonnet-latest'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```

### Google Gemini

The `@aigne/gemini` SDK connects to Google's Gemini AI models, featuring support for multimodal inputs, function calling, and image generation with Imagen.

#### Installation
```bash
npm install @aigne/gemini @aigne/core
```

#### Basic Chat Usage
```typescript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // Provide API key directly or use environment variable GOOGLE_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  model: "gemini-1.5-flash", // Defaults to 'gemini-1.5-pro'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
```

#### Image Generation
```typescript
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

### AWS Bedrock

The `@aigne/bedrock` SDK integrates with foundation models hosted on AWS Bedrock, including Claude, Llama, and Titan, providing a secure and scalable solution.

#### Installation
```bash
npm install @aigne/bedrock @aigne/core
```

#### Basic Usage
```typescript
import { BedrockChatModel } from "@aigne/bedrock";

const model = new BedrockChatModel({
  // Use environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  model: "us.amazon.nova-premier-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

### Deepseek

The `@aigne/deepseek` SDK connects to Deepseek's language models, providing a powerful and cost-effective option for chat completions.

#### Installation
```bash
npm install @aigne/deepseek @aigne/core
```

#### Basic Usage
```typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // Provide API key directly or use environment variable DEEPSEEK_API_KEY
  apiKey: "your-api-key",
  model: "deepseek-chat", // Defaults to 'deepseek-chat'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

### Doubao

The `@aigne/doubao` SDK provides integration with Doubao's language models.

#### Installation
```bash
npm install @aigne/doubao @aigne/core
```

#### Basic Usage
```typescript
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  // Provide API key directly or use environment variable DOUBAO_API_KEY
  apiKey: "your-api-key",
  model: "doubao-seed-1-6-250615", // Default model
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

### Ideogram

The `@aigne/ideogram` SDK is specialized for integrating with Ideogram's advanced image generation models.

#### Installation
```bash
npm install @aigne/ideogram @aigne/core
```

#### Basic Usage
```typescript
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  apiKey: "your-api-key", // Optional if set in env variables
});

const result = await model.invoke({
  model: "ideogram-v3",
  prompt: "A serene mountain landscape at sunset with golden light",
});

console.log(result);
```

### Ollama

The `@aigne/ollama` SDK allows you to connect to locally hosted open-source models via Ollama, ensuring privacy and offline access to AI capabilities.

#### Installation
```bash
npm install @aigne/ollama @aigne/core
```

#### Prerequisites
Ensure [Ollama](https://ollama.ai/) is installed and running on your machine.

#### Basic Usage
```typescript
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  baseURL: "http://localhost:11434", // Defaults to localhost
  model: "llama3", // Defaults to 'llama3'
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me what model you're using" }],
});

console.log(result);
```

### OpenRouter

The `@aigne/open-router` SDK offers a unified API to access models from multiple providers like OpenAI, Anthropic, and Google through a single integration.

#### Installation
```bash
npm install @aigne/open-router @aigne/core
```

#### Basic Usage
```typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  // Provide API key directly or use environment variable OPEN_ROUTER_API_KEY
  apiKey: "your-api-key",
  model: "anthropic/claude-3-opus", // Defaults to 'openai/gpt-4o'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

### Poe

The `@aigne/poe` SDK integrates with Poe's API, giving you access to a variety of language models available on the platform.

#### Installation
```bash
npm install @aigne/poe @aigne/core
```

#### Basic Usage
```typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // Provide API key directly or use environment variable POE_API_KEY
  apiKey: "your-api-key",
  model: "claude-3-opus", // Defaults to 'openai/gpt-4o'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

### xAI

The `@aigne/xai` SDK connects to XAI's language models, including Grok, known for its unique personality and real-time information access.

#### Installation
```bash
npm install @aigne/xai @aigne/core
```

#### Basic Usage
```typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // Provide API key directly or use environment variable XAI_API_KEY
  apiKey: "your-api-key",
  model: "grok-2-latest", // Defaults to 'grok-2-latest'
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```