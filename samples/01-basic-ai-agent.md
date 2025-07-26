# Basic AI Agent

Create your first AI agent with AIGNE Framework in just a few lines of code.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant",
  inputKey: "message",
});

const result = await aigne.invoke(agent, { message: "Hello, world!" });
```

## Twitter Post #1

🚀 Build AI agents in 6 lines with AIGNE!

✨ Multi-model support
🔧 Simple API
📝 TypeScript ready

What will you build first? 👇

#AIGNE #ArcBlock #AI

## Twitter Post #2

This code creates a basic AI agent with AIGNE Framework:

• Import core modules and OpenAI model
• Initialize AIGNE with your chosen model
• Create an agent with instructions
• Invoke the agent with a message

Perfect for getting started with AI development! 🤖

## Twitter Post #3

⭐ https://github.com/aigne-io/aigne-framework
📚 https://www.arcblock.io/docs/aigne-framework

#AIGNE #ArcBlock #AI
