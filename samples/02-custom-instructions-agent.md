# Agent with Custom Instructions

Customize your AI agent's behavior with specific instructions for unique response styles.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const agent = AIAgent.from({
  instructions: "Only speak in Haikus.",
  inputKey: "message",
});

const result = await aigne.invoke(agent, { message: "What is AIGNE?" });
```

## Twitter Post #1

🎨 Want your AI to speak in Haikus? AIGNE custom instructions make it possible!

Perfect for:
📝 Poetry bots
⚙️ Technical writers
🎭 Creative assistants

What unique AI personality would you create? 🤔

#AIGNE #ArcBlock #AI

## Twitter Post #2

This example shows how to customize AI behavior with specific instructions:

• Import AIGNE core and OpenAI model
• Set custom instructions ("Only speak in Haikus")
• Create agent with unique personality
• Get responses in your desired style

Transform any AI into a creative assistant! 🎭

## Twitter Post #3

⭐ https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #AI
