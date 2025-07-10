# Configuration Guide

## Environment Variables

Create a `.env.local` file in this directory with the following variables:

```bash
# OpenAI API Configuration (Required)
OPENAI_API_KEY=your_openai_api_key_here

# DID Spaces Configuration (Optional - fallback to default if not set)
DID_SPACES_URL=https://your-did-spaces-url.com/app
DID_SPACES_AUTHORIZATION=Bearer your-did-spaces-token
```

## Alternative Model Configurations (Optional)

You can use different AI models by uncommenting and configuring any of these:

```bash
# Anthropic
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# MODEL=anthropic:claude-3-7-sonnet-latest

# Google Gemini
# GEMINI_API_KEY=your_gemini_api_key_here
# MODEL=gemini:gemini-2.0-flash

# DeepSeek
# DEEPSEEK_API_KEY=your_deepseek_api_key_here
# MODEL=deepseek:deepseek-chat

# OpenRouter
# OPEN_ROUTER_API_KEY=your_openrouter_api_key_here
# MODEL=openrouter:openai/gpt-4o

# xAI
# XAI_API_KEY=your_xai_api_key_here
# MODEL=xai:grok-2-latest

# Ollama (Local)
# OLLAMA_DEFAULT_BASE_URL=http://localhost:11434
# MODEL=ollama:llama3.2
```

## DID Spaces Configuration

The example will use default DID Spaces settings if the environment variables are not provided. For production use, you should set your own:

- `DID_SPACES_URL`: The URL to your DID Spaces instance
- `DID_SPACES_AUTHORIZATION`: The authorization token for accessing your DID Spaces

## Getting API Keys

- **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Anthropic**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
- **Google Gemini**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **DeepSeek**: Get your API key from [DeepSeek Platform](https://platform.deepseek.com/)
- **OpenRouter**: Get your API key from [OpenRouter](https://openrouter.ai/keys)
- **xAI**: Get your API key from [xAI Console](https://console.x.ai/)
- **Ollama**: Install locally from [Ollama Website](https://ollama.ai/) 