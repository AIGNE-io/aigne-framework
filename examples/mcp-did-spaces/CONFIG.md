# Configuration Guide

## Environment Variables

Create a `.env.local` file in this directory with the following variables:

```bash
# OpenAI API Configuration (Required)
OPENAI_API_KEY=your_openai_api_key_here

# DID Spaces MCP Configuration (Required)
DID_SPACES_URL=https://your-did-spaces-url.com/app/mcp
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

## DID Spaces MCP Configuration

For this example to work, you **must** provide the DID Spaces MCP configuration:

- `DID_SPACES_URL`: The URL to your DID Spaces MCP endpoint (usually ends with `/mcp`)
- `DID_SPACES_AUTHORIZATION`: The authorization token for accessing your DID Spaces MCP server

## Getting API Keys

- **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Anthropic**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
- **Google Gemini**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **DeepSeek**: Get your API key from [DeepSeek Platform](https://platform.deepseek.com/)
- **OpenRouter**: Get your API key from [OpenRouter](https://openrouter.ai/keys)
- **xAI**: Get your API key from [xAI Console](https://console.x.ai/)
- **Ollama**: Install locally from [Ollama Website](https://ollama.ai/)

## MCP Server Setup

This example connects to a DID Spaces MCP server. Make sure you have:

1. A running DID Spaces instance
2. MCP server enabled on your DID Spaces instance
3. Proper authentication tokens
4. Network access to the MCP endpoint 