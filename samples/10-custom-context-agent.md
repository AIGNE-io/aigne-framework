# Agent with Custom Context

Provide custom user context and configuration to personalize AI agent behavior.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
  userContext: {
    userId: "user123",
    preferences: { language: "en", theme: "dark" }
  }
});

const agent = AIAgent.from({
  instructions: "Respond according to user preferences",
  inputKey: "message",
});

const result = await aigne.invoke(agent, {
  message: "Hello!"
});

console.log("AI:", result.message);
```

## Twitter Post #1

👤 Personalized AI with AIGNE's custom context!

Each user gets tailored experiences:
🌍 Language prefs • ⚙️ Custom settings • 📊 User data • 💬 Smart responses

One agent, infinite personalities! ✨

What personal touch would you add? 🤔

#AIGNE #ArcBlock #AI

## Twitter Post #2

This example shows how to add custom user context:

• Pass userContext to AIGNE initialization
• Include user preferences and settings
• Agent uses context for personalization
• Tailored responses for each user

Personalized AI made simple! 👤

## Twitter Post #3

Get started with personalized AI: https://github.com/aigne-io/aigne-framework
