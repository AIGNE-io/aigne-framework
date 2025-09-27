# AIGNE Hub

The AIGNE Hub is a powerful service that acts as a single, unified gateway to a wide variety of Large Language Models (LLMs) from different providers like OpenAI, Anthropic, Google, and many others. Instead of juggling multiple API keys and accounts, you can connect to the Hub with a single access key and use any supported model seamlessly.

This simplifies development, enhances security by not exposing individual provider keys in your application, and provides a centralized way to manage usage and billing.

### How It Works

Your AIGNE agent communicates with the AIGNE Hub, and the Hub securely routes your request to the appropriate AI provider based on the model you've chosen. This means you can switch between different models and providers without changing any of your application's connection settings.

```d2
direction: down

Your-Agent: {
  label: "Your AIGNE Agent"
  shape: rectangle
}

AIGNE-Hub: {
  label: "AIGNE Hub"
  shape: rectangle
  style.fill: "#f0f9ff"
}

AI-Providers: {
  label: "AI Model Providers"
  shape: rectangle
  grid-columns: 3

  OpenAI: {
    label: "OpenAI"
  }

  Anthropic: {
    label: "Anthropic"
  }

  Google: {
    label: "Google Gemini"
  }

  Bedrock: {
    label: "AWS Bedrock"
  }

  Ollama: {
    label: "Ollama"
  }

  More: {
    label: "... and more"
  }
}

Your-Agent -> AIGNE-Hub: "1. Single Request with One Access Key"
AIGNE-Hub -> AI-Providers.OpenAI: "2. Routes to correct provider"
AIGNE-Hub -> AI-Providers.Anthropic
AIGNE-Hub -> AI-Providers.Google

```

### Key Features

<x-cards data-columns="2">
  <x-card data-title="Unified LLM Access" data-icon="lucide:library">
    Route all your AI requests through a single, reliable endpoint. No need to manage multiple SDKs or API configurations.
  </x-card>
  <x-card data-title="Multi-Provider Support" data-icon="lucide:cloud">
    Easily switch between models from top providers like OpenAI, Google, Anthropic, and more, simply by changing the model name.
  </x-card>
  <x-card data-title="Simplified API Key Management" data-icon="lucide:key-round">
    Use a single AIGNE Hub access key to authenticate all requests, keeping your individual provider keys secure on the server.
  </x-card>
  <x-card data-title="Chat and Image Generation" data-icon="lucide:messages-square">
    The Hub supports both text-based chat completions and advanced image generation from providers like DALL-E and Ideogram.
  </x-card>
</x-cards>

## Connecting to the Hub

Connecting your local development environment to the AIGNE Hub is done through a simple command. This process will open a web browser for you to securely authenticate and will automatically configure your credentials.

1.  **Open your terminal or command prompt.**
2.  **Run the connect command:**

    ```bash
    aigne hub connect
    ```

3.  **Choose a Hub.** You will be prompted to connect to the official AIGNE Hub (recommended for new users) or a custom, self-hosted instance.

4.  **Authorize in your browser.** A browser window will open, asking you to log in and approve the connection. Once you approve, the CLI will securely receive and save an access key.

That's it! Your machine is now connected and ready to use models through the AIGNE Hub.

## Managing Your Hub Connection

The AIGNE CLI provides several commands to manage your Hub connections.

### Check Connection Status

To see the details of your current connection, including your user information and credit balance, use the `status` command.

```bash
aigne hub status
```

This will display your connected Hub URL, your user details, and your available credits.

### List All Connections

If you work with multiple Hubs (e.g., the official Hub and a private one), you can list all configured connections.

```bash
aigne hub list
```

### Switch Between Hubs

To change your active Hub, use the `use` command. You will be presented with a list of your saved connections to choose from.

```bash
aigne hub use
```

### Remove a Connection

To disconnect and remove the credentials for a specific Hub, use the `remove` command.

```bash
aigne hub remove
```

## Using Hub Models

Once connected, you can use any model available on the Hub by specifying its name in the format `provider/model-name` in your agent's configuration.

Here are some examples of model identifiers:

-   `openai/gpt-4o-mini`
-   `anthropic/claude-3-sonnet`
-   `google/gemini-pro`
-   `ollama/llama3`
-   `openai/dall-e-3` (for images)

By using this format, the AIGNE Hub knows exactly where to send your request.

## Supported Providers

The AIGNE Hub supports a growing list of AI providers, including:

-   OpenAI
-   Anthropic
-   AWS Bedrock
-   DeepSeek
-   Doubao
-   Google Gemini
-   Ideogram
-   LM Studio
-   Ollama
-   OpenRouter
-   Poe
-   xAI (Grok)

## Summary

AIGNE Hub is the easiest and most secure way to power your agents with a diverse range of AI models. It simplifies key management, centralizes billing, and gives you the flexibility to experiment with different providers without rewriting your code.

To learn more about the specific models you can access through the Hub, explore the other pages in this section.

- [OpenAI Models](./models-openai.md)
- [Anthropic (Claude)](./models-anthropic.md)
- [Google Gemini](./models-gemini.md)