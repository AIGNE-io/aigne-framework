# Model Configuration

To integrate and utilize the various AI models within the AIGNE Framework, you must first configure the necessary credentials, primarily through environment variables. This ensures secure and proper authentication with the respective third-party services. This guide provides the specific environment variables required for each supported model provider.

## General Usage

To use a specific model, you typically need to set two primary environment variables:

1.  `MODEL`: Specifies the model identifier, often prefixed with the provider's name (e.g., `openai:gpt-4o`).
2.  `[PROVIDER]_API_KEY`: The unique API key for that provider (e.g., `OPENAI_API_KEY`).

You can set these variables in your shell before running your application.

```bash Set environment variables icon=lucide:terminal
export MODEL=openai:gpt-4o
export OPENAI_API_KEY="your_api_key_here"

# Then run your AIGNE application
node your-app.js
```

## Provider Configurations

Below is a detailed list of the required environment variables for each supported model provider. Replace the placeholder values with your actual credentials.

### OpenAI

To connect to OpenAI models like GPT-4o, set the following variables:

```bash OpenAI Configuration icon=lucide:key-round
export MODEL="openai:gpt-4o"
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

### Anthropic

For Anthropic's Claude models, configure the following:

```bash Anthropic Configuration icon=lucide:key-round
export MODEL="anthropic:claude-3-7-sonnet-latest"
export ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY"
```

### Google Gemini

To use Google's Gemini models, set these variables:

```bash Gemini Configuration icon=lucide:key-round
export MODEL="gemini:gemini-2.0-flash"
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### AWS Bedrock

For models hosted on AWS Bedrock, you need to provide your AWS credentials and the target region.

```bash AWS Bedrock Configuration icon=lucide:key-round
export MODEL="bedrock:us.amazon.nova-premier-v1:0"
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
export AWS_REGION="YOUR_AWS_REGION"
```

### DeepSeek

To use DeepSeek models, configure the following API key:

```bash DeepSeek Configuration icon=lucide:key-round
export MODEL="deepseek/deepseek-chat"
export DEEPSEEK_API_KEY="YOUR_DEEPSEEK_API_KEY"
```

### Doubao

For Doubao models, set the following environment variable:

```bash Doubao Configuration icon=lucide:key-round
export MODEL="doubao-seed-1-6-250615"
export DOUBAO_API_KEY="YOUR_DOUBAO_API_KEY"
```

### Ideogram

For Ideogram's image generation models, configure your API key as shown:

```bash Ideogram Configuration icon=lucide:key-round
export MODEL="ideogram-v3"
export IDEOGRAM_API_KEY="YOUR_IDEOGRAM_API_KEY"
```

### Ollama

When using a locally hosted Ollama instance, you need to specify the model name and the API endpoint. The API key is typically a placeholder.

```bash Ollama Configuration icon=lucide:server
export MODEL="llama3"
export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434/v1"
export OLLAMA_API_KEY="ollama"
```

### OpenRouter

OpenRouter provides access to various models through a single API. Specify the model with its full path.

```bash OpenRouter Configuration icon=lucide:key-round
export MODEL="openai/gpt-4o"
export OPEN_ROUTER_API_KEY="YOUR_OPEN_ROUTER_API_KEY"
```

### Poe

To connect to models via Poe, use the following configuration:

```bash Poe Configuration icon=lucide:key-round
export MODEL="claude-3-opus"
export POE_API_KEY="YOUR_POE_API_KEY"
```

### xAI

For xAI's Grok models, set the `XAI_API_KEY` environment variable.

```bash xAI Configuration icon=lucide:key-round
export MODEL="grok-2-latest"
export XAI_API_KEY="YOUR_XAI_API_KEY"
```

### LMStudio

For locally hosted models via LMStudio, specify the model name. The API key is typically a placeholder as LMStudio runs locally without authentication by default.

```bash LMStudio Configuration icon=lucide:server
export MODEL="llama-3.2-3b-instruct"
export LM_STUDIO_API_KEY="lmstudio"
```

## Summary

Properly configuring these environment variables is the foundational step for integrating any model into the AIGNE Framework. This approach keeps your sensitive API keys secure and allows for flexible model selection without changing your application code. For more detailed guides on each provider, please refer to the specific documentation pages, such as [OpenAI](./models-openai.md) or [Google Gemini](./models-gemini.md).