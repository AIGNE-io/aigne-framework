# AI Agent with Skills

Enhance AI agents by giving them access to custom tools and functions.

```typescript
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const calculator = FunctionAgent.from({
  name: "calculate",
  description: "Perform basic math calculations",
  inputSchema: z.object({
    expression: z.string()
  }),
  process: async ({ expression }) => ({ result: eval(expression) })
});

const agent = AIAgent.from({
  instructions: "You can help with math calculations",
  skills: [calculator],
  inputKey: "message",
});

const result = await aigne.invoke(agent, { message: "What is 25 * 4 + 10?" });

```

## Twitter Post #1

🧠 Give your AI agents superpowers! AIGNE skills = limitless potential

🔢 Calculator • 🌐 APIs • 📊 Data • 🔍 Search

One agent + multiple skills = infinite possibilities!

What skill would you add first? 🤔

#AIGNE #ArcBlock #AI

## Twitter Post #2

This code shows how to add custom skills to AI agents:

• Create FunctionAgent with name and description
• Define inputSchema for parameters
• Implement process function
• Add skills array to main agent

Now your AI can call custom functions! 🧠

## Twitter Post #3

📖 https://www.arcblock.io/docs/aigne-framework

#AIGNE #ArcBlock #AI
