# Multi-Provider AI with Fallback Strategy

Build resilient AI systems with automatic model fallbacks and smart provider selection.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { AnthropicChatModel } from "@aigne/anthropic";
import { OpenRouterChatModel } from "@aigne/open-router";

// Smart routing with multiple providers
const robustAigne = new AIGNE({
  model: new OpenRouterChatModel({
    model: "openai/gpt-4o",
    fallbackModels: [
      "anthropic/claude-3-opus",
      "google/gemini-1.5-pro"
    ]
  }),
});

// Cost-optimized multi-tier strategy
const fastAigne = new AIGNE({
  model: new OpenAIChatModel({ model: "gpt-4o-mini" })
});

const powerAigne = new AIGNE({
  model: new AnthropicChatModel({ model: "claude-3-5-sonnet-20241022" })
});

const quickAgent = AIAgent.from({
  instructions: "Provide quick, concise answers",
  inputKey: "message",
});

const analyticsAgent = AIAgent.from({
  instructions: "Provide detailed analysis and reasoning",
  inputKey: "message",
});

// Route simple queries to fast model
const quickResult = await fastAigne.invoke(quickAgent, {
  message: "What's 2+2?"
});

// Route complex queries to powerful model
const analyticsResult = await powerAigne.invoke(analyticsAgent, {
  message: "Analyze the market trends for renewable energy"
});
```

## Twitter Post #1

🎯 Smart AI routing with AIGNE!

Multi-provider strategy:
🔄 Automatic fallbacks
💰 Cost optimization
🌐 Provider diversity
🔓 Zero vendor lock-in

Fast models for quick tasks, powerful models for complex analysis! 🚀

What's your fallback strategy? 🤔

#AIGNE #ArcBlock #Fallback

## Twitter Post #2

This example shows multi-provider fallback strategy:

• Use OpenRouter with fallback models
• Create different AIGNE instances for different needs
• Route queries based on complexity
• Automatic failover when providers fail

Resilient AI systems made simple! 🎯

## Twitter Post #3

📚 https://www.arcblock.io/docs/aigne-framework

#AIGNE #ArcBlock #Fallback
