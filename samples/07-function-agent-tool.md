# Function Agent (Tool)

Create reusable function tools that AI agents can call to extend their capabilities.

```typescript
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const weather = FunctionAgent.from({
  name: "get_weather",
  description: "Get current weather for a location",
  inputSchema: z.object({
    location: z.string()
  }),
  outputSchema: z.object({
    temperature: z.number(),
    condition: z.string()
  }),
  process: async ({ location }) => ({
    temperature: 22,
    condition: "Sunny"
  })
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant",
  skills: [weather],
  inputKey: "message",
});

const result = await aigne.invoke(agent, { message: "What is the weather like in London?" });
```

## Twitter Post #1

🛠️ Build reusable AI tools with AIGNE Function Agents!

Create once, use everywhere:
☀️ Weather • 🗄️ Database • 🔌 Integrations

Modular AI architecture at its finest! 🏗️

What tool would you build first? 🤔

#AIGNE #ArcBlock #AI

## Twitter Post #2

This example shows how to create reusable function tools:

• Define FunctionAgent with name and description
• Set both inputSchema and outputSchema
• Implement process function logic
• Add to skills array for use

Build once, use everywhere! 🛠️

## Twitter Post #3

🌟 https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #AI
