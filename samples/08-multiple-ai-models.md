# Different Chat Models

Use multiple AI providers in your applications - OpenAI, Anthropic, Google Gemini, and more.

```typescript
import { AIAgent } from "@aigne/core";
import { AnthropicChatModel } from "@aigne/anthropic";
import { GeminiChatModel } from "@aigne/gemini";

// Anthropic model
const claudeAgent = AIAgent.from({
  model: new AnthropicChatModel({ apiKey: "your-key" }),
  inputKey: "message"
});

// Gemini model
const geminiAgent = AIAgent.from({
  model: new GeminiChatModel({ apiKey: "your-key" }),
  inputKey: "message"
});
```

## Twitter Post #1

🎯 Never get locked into one AI provider again!

AIGNE supports: OpenAI • Anthropic • Gemini • Ollama • AWS Bedrock • DeepSeek • Grok • OpenRouter

One codebase, infinite possibilities! 🚀

Which combo do you use? Share below! 👇

#AIGNE #ArcBlock #MultiModel

## Twitter Post #2

This example shows how to use different AI providers:

• Import specific model classes
• Create agents with different models
• Use same API across providers
• Switch providers easily

Never get locked into one AI provider! 🎯

## Twitter Post #3

📚 https://www.arcblock.io/docs/aigne-framework

#AIGNE #ArcBlock #MultiModel
