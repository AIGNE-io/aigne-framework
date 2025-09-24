# AI Models

The AIGNE Framework is designed to be flexible, allowing you to connect your AI agents to a wide variety of powerful AI models. Whether you want to use the latest models from major providers like OpenAI and Google, explore specialized models, or even run models locally on your own computer for maximum privacy, AIGNE has you covered.

Each integration is designed to be straightforward, so you can switch between models without having to rewrite your agent's core logic.

## AIGNE Hub: The Unified Gateway

For the simplest way to access multiple models, we recommend using the AIGNE Hub. It acts as a single entry point to many popular AI providers, so you only need to manage one connection. This simplifies development and lets you easily experiment with different models to find the best one for your needs.

![AIGNE Hub Architecture](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-hub.png)

## Supported Model Providers

Explore the growing list of supported AI model providers. Click on any provider to see detailed documentation on how to connect and use their models within the AIGNE Framework.

<x-cards data-columns="2">
  <x-card data-title="AIGNE Hub" data-icon="lucide:hub" data-href="/models/aigne-hub">
    Connect to a unified proxy for multiple LLM providers, manage credits, and simplify API key management.
  </x-card>
  <x-card data-title="Anthropic (Claude)" data-icon="lucide:brain-circuit" data-href="/models/anthropic">
    Leverage Anthropic's Claude models, known for strong performance in complex reasoning and creative tasks.
  </x-card>
  <x-card data-title="AWS Bedrock" data-icon="lucide:server-cog" data-href="/models/aws-bedrock">
    Access foundation models from leading AI companies through Amazon's fully managed AWS Bedrock service.
  </x-card>
  <x-card data-title="DeepSeek" data-icon="lucide:search-code" data-href="/models/deepseek">
    Integrate DeepSeek's powerful open-source language models for strong coding and reasoning capabilities.
  </x-card>
  <x-card data-title="Doubao" data-icon="lucide:message-square-plus" data-href="/models/doubao">
    Connect with Doubao's AI models for a wide range of language and image generation tasks.
  </x-card>
  <x-card data-title="Google Gemini" data-icon="lucide:gem" data-href="/models/gemini">
    Use Google's Gemini family of multimodal models for tasks involving text, images, and more.
  </x-card>
  <x-card data-title="Ideogram" data-icon="lucide:image" data-href="/models/ideogram">
    Generate high-quality images from text prompts using Ideogram's advanced image synthesis models.
  </x-card>
  <x-card data-title="OpenAI" data-icon="lucide:sparkles" data-href="/models/openai">
    Integrate OpenAI's powerful GPT models, including chat completions and DALL-E image generation.
  </x-card>
  <x-card data-title="OpenRouter" data-icon="lucide:route" data-href="/models/open-router">
    Access a diverse marketplace of models from multiple providers through a single, unified OpenRouter API.
  </x-card>
  <x-card data-title="Poe" data-icon="lucide:bot" data-href="/models/poe">
    Integrate with various AI models available on the Poe platform through its OpenAI-compatible API.
  </x-card>
  <x-card data-title="xAI (Grok)" data-icon="lucide:star" data-href="/models/xai">
    Connect to xAI's models, like Grok, known for their unique personality and real-time information access.
  </x-card>
</x-cards>

## Run Models Locally

For ultimate privacy and control, AIGNE supports running open-source models directly on your own machine using tools like Ollama and LM Studio. This means your data never leaves your computer, and you can operate completely offline.

<x-cards data-columns="2">
  <x-card data-title="LM Studio" data-icon="lucide:laptop" data-href="/models/lm-studio">
    Run local language models on your own machine through LM Studio's OpenAI-compatible server.
  </x-card>
  <x-card data-title="Ollama" data-icon="lucide:server" data-href="/models/ollama">
    Utilize a wide variety of open-source models running locally on your machine via the Ollama server.
  </x-card>
</x-cards>