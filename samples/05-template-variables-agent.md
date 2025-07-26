# Agent with Template Variables

Use dynamic template variables in agent instructions for flexible, reusable agents.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const agent = AIAgent.from({
  inputSchema: z.object({
    message: z.string(),
    style: z.string().describe("The response style")
  }),
  instructions: "Respond in {{style}} format.",
  inputKey: "message",
});

const result = await aigne.invoke(agent, {
  message: "Explain AI",
  style: "bullets"
});
console.log(result);
```

## Twitter Post #1

🔧 One agent, infinite possibilities! AIGNE template variables = ultimate flexibility

{{style}} → bullets, JSON, tables, markdown

Build once, use everywhere! 💪

What dynamic format would you love to see? 🤔

#AIGNE #ArcBlock #AI

## Twitter Post #2

This example shows dynamic template variables in action:

• Define inputSchema with variable fields
• Use {{variable}} syntax in instructions
• Pass variables at runtime
• Get customized responses every time

One agent, infinite formats! 🔧

## Twitter Post #3

Star our GitHub repo: https://github.com/aigne-io/aigne-framework
