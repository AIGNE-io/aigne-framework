# Models

The AIGNE Framework is designed to be model-agnostic, allowing you to connect to a wide range of third-party AI model providers. This flexibility is achieved through a system of model adapters, where each adapter provides a standardized interface for a specific service, such as OpenAI, Anthropic, or Google Gemini.

This section provides detailed guides for installing, configuring, and using each officially supported model provider. Whether you need powerful language models, specialized image and video generation, or the privacy of a locally hosted model, you can find the right integration here.

## Supported Model Providers

Below is a curated list of supported providers. Each card links to a dedicated guide with installation instructions, configuration details, and practical code examples.

### Foundational Models

These are direct integrations with major AI model providers for chat completions and other language-based tasks.

<x-cards data-columns="2">
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
    Integrate with OpenAI's suite of models, including the powerful GPT-4o, for chat completions and function calling.
  </x-card>
  <x-card data-title="Anthropic" data-icon="simple-icons:anthropic" data-href="/models/anthropic">
    Leverage Anthropic's Claude models, known for their strong performance in complex reasoning and conversation.
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    Connect to Google's Gemini family of multimodal models for advanced text and image understanding.
  </x-card>
  <x-card data-title="AWS Bedrock" data-icon="simple-icons:amazonaws" data-href="/models/bedrock">
    Access a variety of foundation models from providers like Anthropic, Cohere, and Amazon through AWS Bedrock.
  </x-card>
  <x-card data-title="DeepSeek" data-icon="lucide:brain-circuit" data-href="/models/deepseek">
    Utilize DeepSeek's powerful and efficient language models for a range of natural language processing tasks.
  </x-card>
  <x-card data-title="Doubao" data-icon="lucide:bot" data-href="/models/doubao">
    Integrate with Doubao's language models for building conversational AI and other text-based applications.
  </x-card>
  <x-card data-title="xAI" data-icon="lucide:sparkles" data-href="/models/xai">
    Connect to xAI's Grok models, designed for real-time information processing and a unique conversational style.
  </x-card>
</x-cards>

### Image Generation Models

Specialized integrations for creating visual content from text prompts.

<x-cards data-columns="2">
  <x-card data-title="Ideogram" data-icon="lucide:image" data-href="/models/ideogram">
    Generate high-quality images with reliable text rendering using Ideogram's advanced synthesis models.
  </x-card>
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
    Use DALL-E 3 and other models for creative and diverse image generation capabilities.
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    Leverage Gemini and Imagen models for versatile image generation and editing alongside language features.
  </x-card>
</x-cards>

### Video Generation Models

Integrations for generating video content from text or image inputs.

<x-cards data-columns="2">
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
     Generate high-quality video content from text or image prompts using OpenAI's Sora models.
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    Create video from text or images using Google's Veo models for dynamic content generation.
  </x-card>
    <x-card data-title="AIGNE Hub" data-icon="lucide:hub" data-href="/models/aigne-hub">
    Access video generation models like OpenAI Sora and Google Veo through a unified API endpoint.
  </x-card>
</x-cards>

### Local and Aggregator Services

Connect to local instances or services that provide access to multiple models through a single API.

<x-cards data-columns="2">
  <x-card data-title="Ollama" data-icon="lucide:server" data-href="/models/ollama">
    Run open-source models like Llama 3 locally on your own hardware for maximum privacy and offline access.
  </x-card>
  <x-card data-title="LMStudio" data-icon="lucide:laptop" data-href="/models/lmstudio">
    Connect to models running locally via the LMStudio application, providing a simple way to experiment with open-source AI.
  </x-card>
  <x-card data-title="OpenRouter" data-icon="lucide:route" data-href="/models/open-router">
    Access a wide variety of models from different providers through a single, unified API with fallback options.
  </x-card>
  <x-card data-title="Poe" data-icon="lucide:message-square-plus" data-href="/models/poe">
    Integrate with various models available through the Poe platform, offering a diverse set of AI capabilities.
  </x-card>
  <x-card data-title="AIGNE Hub" data-icon="lucide:hub" data-href="/models/aigne-hub">
    Use the AIGNE Hub as a unified proxy to seamlessly switch between multiple LLM providers without changing client-side code.
  </x-card>
</x-cards>

## Summary

The AIGNE Framework's modular design makes it easy to integrate with the best AI model for your specific needs. Each provider has a dedicated package that handles the complexities of the underlying API, presenting you with a consistent and straightforward interface.

To get started, choose a provider from the list above and follow the linked guide for detailed instructions. For a high-level overview of how model adapters work within the framework, see the [Overview](./models-overview.md) page.
